import { IItemCategories, IParentCategories } from '../../../../interfaces/LnD/ICategories'
import * as React from 'react'
import { ModalAccept } from '../ModalAccept'
import './index.css'
import { Button, Notification } from '@haravan/hrw-react-components'
import { DrawerCategories } from '../DrawerCategories'
import useUnsavedChangesWarning from '../../../../hook/useUnsavedChangesWarning'
import { v4 as uuidv4 } from "uuid";
import { ACTION_DRAG_DROP_CATEGORIES, EActionDragDrop, INIT_CREATE_CATEGORIES } from '../../CommonHelp/constants'
import { Icon_plus_16 } from '../../IconSVG'
import { DragDropCategories } from '../DragDropCategories'
import { PopoverAddSubject } from '../PopoverAddSubject'
import { searchASCII } from '../../../../utils/env'

interface IProps {
    listSubjectPublish: any[]
    onCloseEdit: Function
    onUpdateData: Function
    categoriesList: IParentCategories[]
}

interface IModalObj {
    isVisible?: boolean,
    title: string,
    content: string,
    type: EActionDragDrop,
    textBtn: string,
    itemModal?: IParentCategories
}

interface IDrawerVisibleObj {
    isVisible: boolean,
    type: EActionDragDrop,
    itemModal: IParentCategories
    hasChildren: boolean
}

interface IItemAction {
    type: EActionDragDrop,
    tooltip: string,
    icon: any
}

interface IIndexDragDrop {
    indexParent: number,
    indexChild: number,
    indexSubject: number
}

interface IIndexItemDrag {
    indexItemDragParent: number,
    indexItemDragChild: number,
    indexItemDragSubject: number
}

export function EditCategories({ listSubjectPublish, onCloseEdit, onUpdateData, categoriesList }: IProps) {
    const [modalObj, setModalObj] = React.useState<IModalObj>(null)
    const [drawerVisibleObj, setDrawerVisibleObj] = React.useState<IDrawerVisibleObj>(null)
    const [Prompt, setDirty, setPristine] = useUnsavedChangesWarning('Dữ liệu đã thay đổi có khả năng không được lưu đầy đủ, bạn vẫn muốn rời khỏi trang này?');
    const [categoriesEdit, setCategoriesEdit] = React.useState<IParentCategories[]>([])
    const isCheckCancel = React.useRef(false)
    const [popoverObj, setPopoverObj] = React.useState(null)

    const listDelete = React.useRef([])

    const indexObjRef = React.useRef<IIndexDragDrop>(null)

    const itemDrag = React.useRef(null)

    //logic area
    React.useEffect(() => {
        if (categoriesList.length === 0) {
            onOpenDrawer(null, EActionDragDrop.add)
        } else {
            let newListEdit = [...categoriesList]
            let newListParent = []
            newListEdit = newListEdit.map((parentItem: IParentCategories) => {
                parentItem = { ...parentItem, item: { ...parentItem.item, nodeId: parentItem.item.id } }
                parentItem.children = parentItem.children.map((children: IParentCategories) => {
                    children = { ...children, item: { ...children.item, nodeId: children.item.id } }
                    return children
                })
                newListParent.push({ ...parentItem })
                return parentItem
            })
            setCategoriesEdit(newListEdit)
        }
    }, [])


    const listParent = React.useMemo(() => {
        let newListParent = []
        if (categoriesEdit.length > 0) {
            newListParent = categoriesEdit.map(item => ({ id: item.item?.nodeId, name: item.item.name }))
        }
        return newListParent
    }, [categoriesEdit])

    const handleOpenModal = (type: EActionDragDrop, itemModal: IParentCategories = null,) => {
        let newModalObj: IModalObj = {
            isVisible: true,
            title: 'Xác nhận thoát',
            content: 'Nếu bạn thoát bây giờ, hệ thống sẽ không lưu các thay đổi. Bạn có chắc chắn muốn thoát không?',
            type,
            textBtn: 'Đồng ý',
            itemModal
        }
        if (type === EActionDragDrop.deleteCategory) {
            newModalObj.title = 'Xác nhận xóa'
            newModalObj.content = `Bạn có chắc chắn muốn xóa danh mục "${itemModal.item.name}"?`
            if (itemModal.children.length > 0 || itemModal.item.subjects.length > 0) {
                newModalObj.content = newModalObj.content + ' Lưu ý: Các dữ liệu con cũng sẽ bị xóa.'
            }
        } else if (type === EActionDragDrop.deleteSubject) {
            newModalObj.title = 'Xác nhận xóa'
            newModalObj.content = `Bạn có chắc chắn muốn xóa môn học "${itemModal.item.name}"?`
        }
        setModalObj(newModalObj)
    }

    const handleOpenPopover = (dataItem) => {
        setPopoverObj({
            isVisible: true,
            dataItem,
        })
    }

    const handleAcceptModal = () => {
        const { type, itemModal } = modalObj
        isCheckCancel.current = true
        setModalObj(null)
        setDirty()
        if (type === EActionDragDrop.cancel) {
            onCloseEdit()
            setPristine()
        }
        else if (type === EActionDragDrop.deleteCategory)
            handleDeleteItem(itemModal)
        else if (type === EActionDragDrop.deleteSubject)
            handleDeleteSubject(itemModal)
    }

    const handleCancel = () => {
        if (isCheckCancel.current) handleOpenModal(EActionDragDrop.cancel)
        else onCloseEdit()
    }

    const handleDeleteSubject = (itemModal: any) => {
        const { item, categoryId, parentId } = itemModal
        let newListEdit = [...categoriesEdit]
        const parent = newListEdit.find(parent => parent.item.nodeId === parentId || parent.item.nodeId === categoryId)

        if (parent) {
            let children = parent
            if (parentId) {
                children = parent.children.find(children => children.item.nodeId === categoryId)
            }
            if (children) {
                const indexSubject = children.item.subjects.findIndex(subject => subject.id === item.id)
                if (indexSubject > -1) {
                    children.item.subjects.splice(indexSubject, 1)
                    children.item.subjectIds.splice(indexSubject, 1)
                    setCategoriesEdit(newListEdit)
                }
            }
        }
    }

    const handleDeleteItem = (itemModal: IParentCategories) => {
        if (itemModal.item?.id) {
            listDelete.current.push(itemModal.item.id)
            if (itemModal.children.length > 0) {
                itemModal.children.map(children => listDelete.current.push(children.item.id))
            }
        }
        let newCategoriesEdit = [...categoriesEdit]
        if (!itemModal.item.parentId) {
            newCategoriesEdit = newCategoriesEdit.filter(cate => cate.item.nodeId !== itemModal.item.nodeId)
        } else {
            const index = newCategoriesEdit.findIndex(cate => cate.item.nodeId === itemModal.item.parentId)
            newCategoriesEdit[index].children = newCategoriesEdit[index].children.filter(child => child.item.nodeId !== itemModal.item.nodeId)
        }
        setModalObj(null)
        setCategoriesEdit(newCategoriesEdit)
    }

    const checkHasSubject = (listChildren, listSubject, nameCategory: string) => {
        const hasSubject = listSubject.length > 0
        if (listChildren.length === 0 && !hasSubject) {
            Notification['error']({
                message: `Vui lòng thêm môn học cho ${nameCategory}`
            })
            return false
        }
        return true
    }

    const validation = () => {
        let isValid = true
        for (let indexParent = 0; indexParent < categoriesEdit.length; indexParent++) {
            const parentItem = categoriesEdit[indexParent];
            let isParentHasSubject = checkHasSubject(parentItem.children, parentItem.item.subjectIds, parentItem.item.name)
            let isChildrenHasSubject = true
            if (parentItem.children.length > 0) {
                isChildrenHasSubject = parentItem.children.every(child => {
                    return checkHasSubject(child.children, child.item.subjectIds, child.item.name)
                })
            }
            if (!isParentHasSubject || !isChildrenHasSubject) {
                isValid = false
                break;
            }
        }
        return isValid
    }

    const handleUpdate = () => {
        setPristine()
        if (validation()) {
            onUpdateData([...categoriesEdit], listDelete.current)
        }
    }

    const onOpenDrawer = (parentItem: IParentCategories, type: EActionDragDrop) => {
        let itemModal = null
        if (type === EActionDragDrop.edit)
            itemModal = { ...parentItem }
        else {
            itemModal = {
                item: {
                    ...INIT_CREATE_CATEGORIES,
                    nodeId: uuidv4(),
                    parentId: parentItem?.item?.nodeId ? parentItem.item.nodeId : ''
                },
                children: []
            }
        }
        setDrawerVisibleObj({
            isVisible: true,
            type,
            itemModal,
            hasChildren: itemModal?.children?.length > 0
        })
    }

    const updateChildren = (newItemCategories: IItemCategories, newCategoriesEdit: IParentCategories[]) => {
        const indexParent = newCategoriesEdit.findIndex(cate => cate?.item?.nodeId === newItemCategories?.parentId)
        if (indexParent > -1) {
            const parentItem = { ...newCategoriesEdit[indexParent] }
            if (parentItem.children.length === 0) {
                parentItem.children.push({ item: newItemCategories, children: [] })
            } else {
                const indexChildren = parentItem.children.findIndex(child => child.item.nodeId === newItemCategories.nodeId)
                if (indexChildren > -1) {
                    parentItem.children[indexChildren] = { item: newItemCategories, children: [] }
                } else[
                    parentItem.children.push({ item: newItemCategories, children: [] })
                ]
            }
            newCategoriesEdit[indexParent] = { ...parentItem }
        }
        return newCategoriesEdit
    }

    const onDeleteOldParent = (newCategoriesEdit: IParentCategories[], oldParentId: any, newItemCategories: IItemCategories) => {
        if (oldParentId?.length === 0) {
            newCategoriesEdit = newCategoriesEdit.filter(parentItem => parentItem.item.nodeId !== newItemCategories.nodeId)
        } else {
            const indexParent = newCategoriesEdit.findIndex(parentItem => parentItem.item.nodeId === oldParentId)
            if (indexParent > -1) {
                newCategoriesEdit[indexParent].children = newCategoriesEdit[indexParent].children.filter((children) => children.item.nodeId !== newItemCategories.nodeId)
            }
        }
        return newCategoriesEdit
    }

    const onUpdateEditList = (newItemCategories: IItemCategories, oldParentId: any) => {
        isCheckCancel.current = true
        setDirty()
        let newCategoriesEdit = [...categoriesEdit]
        if (oldParentId !== null) {
            newCategoriesEdit = onDeleteOldParent(newCategoriesEdit, oldParentId, newItemCategories)
        }
        if (newItemCategories.parentId) {
            newCategoriesEdit = updateChildren(newItemCategories, newCategoriesEdit)
        } else {
            //update parentItem
            const indexParent = newCategoriesEdit.findIndex(cate => cate?.item?.nodeId === newItemCategories?.nodeId)
            if (indexParent > -1) {
                newCategoriesEdit[indexParent] = {
                    ...newCategoriesEdit[indexParent],
                    item: { ...newCategoriesEdit[indexParent].item, ...newItemCategories }
                }
            } else {
                newCategoriesEdit.push({ item: newItemCategories, children: [] })
            }
        }
        setCategoriesEdit(newCategoriesEdit)
    }

    const handleOnChangeListSubject = (newListSubject: any[]) => {
        const { dataItem } = popoverObj
        dataItem.subjects = newListSubject
        dataItem.subjectIds = newListSubject.map(subject => subject.id)
        onUpdateEditList(dataItem, null)
    }

    const handleClickBtnAction = (item, type) => {
        if (type === EActionDragDrop.add || type === EActionDragDrop.edit) {
            onOpenDrawer(item, type)
        } else if (type === EActionDragDrop.addSubject) {
            handleOpenPopover(item.item)
        } else {
            handleOpenModal(type, item)
        }
    }

    //end logic area
    const _renderbButtonUpdate = () => {
        return <div className="Lnd-edit-categories">
            <div style={{ borderTop: "1px solid #E8EAED" }}>
                <div className="Lnd__createNew__combo__button">
                    <div className='Lnd__createNew__saveCraft'>
                        <Button
                            status='link'
                            onClick={handleCancel}
                            size={"small"}
                            className='btn__close'
                        >
                            Hủy
                        </Button>
                    </div>
                    <div className='d-flex'>
                        <Button
                            status='primary'
                            onClick={handleUpdate}
                            size={"small"}
                        >
                            Cập nhật
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    }

    const reOrderList = (list: any[], index: number, itemList, isSameArr: boolean, idCompare) => {
        let previous = list.slice(0, index)
        let after = list.slice(index, list.length)
        if (isSameArr) {
            previous = previous.filter(previousValue => previousValue?.item?.nodeId ? previousValue.item.nodeId !== idCompare : (previousValue?.id ? previousValue.id !== idCompare : previousValue !== idCompare))
            after = after.filter(afterValue => afterValue?.item?.nodeId ? afterValue.item.nodeId !== idCompare : (afterValue?.id ? afterValue.id !== idCompare : afterValue !== idCompare))
        }
        return [...previous, ...itemList, ...after]
    }

    const handleDeleteItemDrag = (list: IParentCategories[]) => {
        const { indexItemDragChild, indexItemDragParent, indexItemDragSubject } = itemDrag.current
        if (indexItemDragSubject > -1) {
            if (indexItemDragChild > -1) {
                list[indexItemDragParent].children[indexItemDragChild].item.subjects.splice(indexItemDragSubject, 1)
                list[indexItemDragParent].children[indexItemDragChild].item.subjectIds.splice(indexItemDragSubject, 1)
            } else {
                list[indexItemDragParent].item.subjects.splice(indexItemDragSubject, 1)
                list[indexItemDragParent].item.subjectIds.splice(indexItemDragSubject, 1)
            }
        } else if (indexItemDragChild > -1) {
            list[indexItemDragParent].children.splice(indexItemDragChild, 1)
        } else {
            list.splice(indexItemDragParent, 1)
        }
        return list
    }

    const dragDropValidation = () => {
        const { indexChild, indexParent, indexSubject } = indexObjRef.current
        const newItemDrag = itemDrag.current.item
        const { indexItemDragChild, indexItemDragParent } = itemDrag.current

        //không kéo môn học ra khỏi danh mục root
        if (!newItemDrag?.item && indexChild === -1 && indexSubject === -1) return false

        //Không kéo danh mục cha vào danh mục con
        if (newItemDrag?.item && indexSubject > -1 && indexItemDragChild === -1) return false

        if (newItemDrag?.item && indexSubject > -1 && indexChild > -1 && indexItemDragChild > -1) return false

        if (newItemDrag?.item?.parentId === '' && indexParent > -1 && indexParent === indexItemDragParent) return false

        if (newItemDrag?.item?.parentId === '' && newItemDrag?.children?.length > 0 && indexChild > -1) return false

        //Check same name item
        if (newItemDrag?.children) {
            const isSameArr = (indexParent === indexItemDragParent) || (newItemDrag.item.parentId === "" && indexChild === -1)
            if (isSameArr) {
                return true
            }

            let listCheckNameCategories = ((indexChild > -1) || (indexChild === -1 && indexSubject > -1)) ? categoriesEdit[indexParent].children : categoriesEdit
            const isSameName = listCheckNameCategories.some(category => (searchASCII(category.item.name, newItemDrag?.item?.name)))
            if (isSameName) {
                const nameCategory = ((indexChild > -1) || (indexChild === -1 && indexSubject > -1)) ? "đã thuộc " + categoriesEdit[indexParent].item.name : " đã tồn tại"
                Notification['error']({
                    message: `Danh mục "${newItemDrag?.item?.name}" ${nameCategory}. Vui lòng kiểm tra lại.`
                })
                return false
            }
        } else {
            const isSameArr = (indexParent === indexItemDragParent && indexChild === indexItemDragChild) || (indexParent === indexItemDragParent && indexChild === -1 && indexItemDragChild === -1)
            if (isSameArr) {
                return true
            }

            let listCheckNameSubject = indexChild > -1 ? categoriesEdit[indexParent].children[indexChild].item.subjectIds : categoriesEdit[indexParent].item.subjectIds
            const isHasSubject = listCheckNameSubject.some(subjectId => subjectId === newItemDrag?.id)
            if (isHasSubject) {
                const nameCategory = indexChild > -1 ? categoriesEdit[indexParent].children[indexChild].item.name : categoriesEdit[indexParent].item.name
                Notification['error']({
                    message: `Môn học "${newItemDrag.name}" đã thuộc ${nameCategory}`
                })
                return false
            }
        }

        return true
    }

    const onDragEnd = () => {
        const { indexChild, indexParent, indexSubject } = indexObjRef.current
        const newItemDrag = itemDrag.current.item
        const { indexItemDragChild, indexItemDragParent, indexItemDragSubject } = itemDrag.current

        if (!dragDropValidation()) {
            itemDrag.current = null
            return
        }

        let newListEdit = [...categoriesEdit]
        const parentItem = newListEdit[indexParent]
        let isSameArr = false

        //Di chuyển danh mục child
        if (indexChild > -1 && indexSubject === -1) {
            isSameArr = indexParent === indexItemDragParent
            if (newItemDrag?.children) {
                // Dùng cho trường hợp drag drop trong cùng 1 danh mục cha
                let newIndexChild = (isSameArr && indexItemDragChild <= indexChild) ? indexChild + 1 : indexChild
                newItemDrag.item.parentId = parentItem.item.id
                parentItem.children = reOrderList(parentItem.children, newIndexChild, [{ ...newItemDrag }], isSameArr, newItemDrag.item.nodeId)
            }
        }
        //Di chuyển môn học vào 1 môn học nằm trong danh mục child
        else if (indexChild > -1 && indexSubject > -1) {
            isSameArr = indexChild === indexItemDragChild && indexParent === indexItemDragParent
            let newIndexSubject = (isSameArr && indexItemDragSubject <= indexSubject) ? indexSubject + 1 : indexSubject
            parentItem.children[indexChild].item.subjects = reOrderList(parentItem.children[indexChild].item.subjects, newIndexSubject, [{ ...newItemDrag }], isSameArr, newItemDrag.id)
            parentItem.children[indexChild].item.subjectIds = reOrderList(parentItem.children[indexChild].item.subjectIds, newIndexSubject, [newItemDrag.id], isSameArr, newItemDrag.id)
        }
        // Di chuyển môn học trong danh mục cha
        else if (indexChild === -1 && indexSubject > -1 && !newItemDrag?.item) {
            isSameArr = indexChild === indexItemDragChild && indexParent === indexItemDragParent
            let newIndexSubject = (isSameArr && indexItemDragSubject <= indexSubject) ? indexSubject + 1 : indexSubject
            parentItem.item.subjects = reOrderList(parentItem.item.subjects, newIndexSubject, [{ ...newItemDrag }], isSameArr, newItemDrag.id)
            parentItem.item.subjectIds = reOrderList(parentItem.item.subjectIds, newIndexSubject, [newItemDrag.id], isSameArr, newItemDrag.id)
        }
        // Di chuyển danh mục vào vị trí của môn học
        else if (indexChild === -1 && indexSubject > -1 && newItemDrag?.item) {
            isSameArr = indexChild === indexItemDragChild && indexParent === indexItemDragParent
            let newIndexChild = parentItem.children.length
            parentItem.children = reOrderList(parentItem.children, newIndexChild, [{ ...newItemDrag }], isSameArr, newItemDrag.nodeId)
        }
        // Di chuyển danh mục cha
        else if (indexChild === -1) {
            isSameArr = indexItemDragChild > -1 ? false : true
            if (indexParent <= indexItemDragParent) {
                itemDrag.current.indexItemDragParent += 1
            }
            let newIndexParent = (isSameArr && indexItemDragParent <= indexParent) ? indexParent + 1 : indexParent
            newItemDrag.item.parentId = ''
            newListEdit = reOrderList(newListEdit, newIndexParent, [{ ...newItemDrag }], isSameArr, newItemDrag.item.nodeId)
        }
        if (!isSameArr) {
            newListEdit = handleDeleteItemDrag(newListEdit)
        }

        setCategoriesEdit(newListEdit)

        itemDrag.current = null
    }

    const onDragStart = (e, item, indexDragObj: IIndexItemDrag) => {
        e.dataTransfer.effectAllowed = "move";//hiệu ứng di chuyển
        e.dataTransfer.setData("text/html", e.target.parentNode);//để firefox có thể chạy đc
        e.dataTransfer.setDragImage(e.target.parentNode, 20, 20);//để chrome có thể chạy đc

        itemDrag.current = {
            item,
            ...indexDragObj
        }
    };

    const onDragOver = (e, indexObj: IIndexDragDrop) => {
        e.preventDefault()
        indexObjRef.current = { ...indexObj }
    }


    const _renderContent = () => {
        return <div className="LnD-categories-edit__container">
            <div className="LnD-categories-edit__main-content">
                {categoriesEdit.length > 0 && <div className="Lnd-categories-list-drag-drop">
                    {categoriesEdit.map((parentItem, indexParent) => {
                        return <DragDropCategories
                            parentItem={parentItem}
                            handleClickBtnAction={handleClickBtnAction}
                            key={`categories-collapse-${parentItem.item.nodeId}-${indexParent}`}
                            onDeleteItem={handleOpenModal}
                            onDragOver={onDragOver}
                            onDragStart={onDragStart}
                            onDragEnd={onDragEnd}
                            indexParent={indexParent}
                            indexChild={-1}
                            listAction={ACTION_DRAG_DROP_CATEGORIES}
                        >
                            {parentItem.children.length > 0
                                ? parentItem.children.map((child, indexChild) => {
                                    return <DragDropCategories
                                        parentItem={child}
                                        key={`categories-collapse-${child.item.nodeId}-${indexChild}`}
                                        onDeleteItem={handleOpenModal}
                                        onDragEnd={onDragEnd}
                                        onDragOver={onDragOver}
                                        onDragStart={onDragStart}
                                        indexChild={indexChild}
                                        indexParent={indexParent}
                                        handleClickBtnAction={handleClickBtnAction}
                                        listAction={[...ACTION_DRAG_DROP_CATEGORIES].slice(1, ACTION_DRAG_DROP_CATEGORIES.length)}
                                    >
                                    </DragDropCategories>
                                })
                                : null}

                        </DragDropCategories>
                    })}
                </div>}
                <Button className="btn-add-categories" status='link' onClick={() => onOpenDrawer(null, EActionDragDrop.add)}>
                    <Icon_plus_16 />
                    <div style={{ marginLeft: '8px' }}>
                        Thêm danh mục
                    </div>
                </Button>
            </div>
        </div >
    }

    return (
        <>
            {_renderContent()}
            {_renderbButtonUpdate()}
            {drawerVisibleObj && <DrawerCategories
                isVisibleDrawer={drawerVisibleObj.isVisible}
                handleClose={() => setDrawerVisibleObj(null)}
                listSubjectPublish={listSubjectPublish}
                onUpdateData={onUpdateEditList}
                isEdit={drawerVisibleObj.type === EActionDragDrop.edit}
                listParent={listParent}
                item={drawerVisibleObj?.itemModal?.item || null}
                hasChildren={drawerVisibleObj?.hasChildren}
                categoriesEdit={categoriesEdit || []}
            />}
            {modalObj && <ModalAccept
                isVisible={modalObj.isVisible}
                title={modalObj.title}
                content={modalObj.content}
                handleOnClose={() => setModalObj(null)}
                handleAccept={handleAcceptModal}
                textBtnAccept={modalObj.textBtn}
                textBtnClose='Đóng'
            />}
            {popoverObj && <PopoverAddSubject
                isVisible={popoverObj.isVisible}
                onClose={() => setPopoverObj(null)}
                listSubject={listSubjectPublish}
                currentList={popoverObj.dataItem.subjects}
                onChangeListData={handleOnChangeListSubject}
            />}
            {Prompt}
        </>
    )
}
