import * as React from 'react'
import { Button, DragDropContext, Draggable, Drawer, Droppable, IValueProvider, Notification, reorder, UseConsumer } from '@haravan/hrw-react-components';
import { Icon_close_drawer, Icon_drag_drop_left, Icon_plus_16, Icon_radio_check, Icon_radio_none } from '../../IconSVG';
import { CustomSelect, SearchEntityNew, } from '../../../../components';
import { ECreateCategories, EPositionType, INIT_SEARCH_ENTITY, JOBTITLE_OPTION } from '../../CommonHelp/constants';
import { ICreateCategories, IParentCategories, } from '../../../../interfaces';
import './index.css';
import { CustomInput } from '../CustomInput';
import { PopoverAddSubject } from '../PopoverAddSubject';
import { ModalAccept } from '../ModalAccept';
import { searchASCII } from '../../../../utils/env';
interface IProps {
    isVisibleDrawer: boolean
    handleClose: Function
    listSubjectPublish: any[]
    isEdit?: boolean
    onUpdateData: Function
    item: ICreateCategories
    listParent: any[]
    categoriesEdit: IParentCategories[]
    hasChildren: boolean
}

export function DrawerCategories(props: IProps) {
    const { isVisibleDrawer, handleClose, listSubjectPublish, hasChildren, isEdit, onUpdateData, item, listParent, categoriesEdit } = props
    const [dataItem, setDataItem] = React.useState<ICreateCategories>(null)
    const [isDisableBtn, setIsDisableBtn] = React.useState(true)
    const [isVisiblePopover, setIsVisiblePopover] = React.useState(false)
    const [isVisibleModal, setIsVisibleModal] = React.useState(false)
    const [errorArr, setErrorArr] = React.useState([{ type: ECreateCategories.name, errorString: '', isError: false },])

    const isCheckCancel = React.useRef(false)

    const checkNameList = React.useMemo(() => {
        let newList = []
        if (dataItem) {
            if (!dataItem?.parentId) {
                newList = [...listParent].filter(category => category.id !== dataItem.nodeId)
            } else {
                let itemParent = categoriesEdit.find(parentItem => parentItem.item.nodeId === dataItem.parentId)
                newList.push({
                    id: itemParent.item.nodeId,
                    name: itemParent.item.name
                })
                itemParent.children.map(childrenItem => {
                    if (dataItem.nodeId !== childrenItem.item.nodeId) {
                        newList.push({
                            id: childrenItem.item.nodeId,
                            name: childrenItem.item.name
                        })
                    }
                })
            }
        }
        return newList

    }, [dataItem?.parentId])

    React.useEffect(() => {
        if (dataItem && checkNameList.length > 0 && isEdit) {
            handleOnBlur(ECreateCategories.name, dataItem)
        }
    }, [checkNameList])

    React.useEffect(() => {
        let newItem = { ...item }
        newItem.jobtitles = item.jobtitles.map(jobtitle => ({
            ...INIT_SEARCH_ENTITY,
            type: 3,
            name: jobtitle.name,
            orgId: jobtitle.orgId,
            jobtitleId: jobtitle.id,
            ...jobtitle
        }))
        setDataItem(newItem)
    }, [])


    //Logic area
    const onChangeData = (type: ECreateCategories, value) => {
        isCheckCancel.current = true
        let newDataItem: ICreateCategories = { ...dataItem }
        if (type === ECreateCategories.positionType) {
            newDataItem[type] = value
            if (value === EPositionType.all) {
                newDataItem.jobtitles = []
            }
        }
        else if (value && Array.isArray(value)) {
            newDataItem[type] = [...value]
        } else if (type === ECreateCategories.parentId)
            newDataItem.parentId = value.id
        else {
            newDataItem[type] = value
        }
        isCheckCancel.current = true
        handleOnBlur(type, newDataItem)
        setDataItem(newDataItem)
    }

    const handleOnBlur = (type: ECreateCategories, newDataItem = dataItem) => {
        let newErrorArr = [...errorArr]
        let message = ''
        let value = newDataItem[type]
        if (type === ECreateCategories.name && value.length === 0) {
            message = 'Vui lòng nhập tên danh mục'
        }
        if (type === ECreateCategories.name && value.length > 0) {
            const indexCodeChosen = checkNameList.findIndex(category => searchASCII(category.name, value))
            if (indexCodeChosen > -1) {
                message = 'Tên danh mục đã tồn tại. Vui lòng kiểm tra lại.'
            }
        }
        let indexError = newErrorArr.findIndex((item) => item.type === type)
        if (indexError > -1) {
            newErrorArr[indexError] = { type, errorString: message, isError: message.length > 0 }
            setErrorArr(newErrorArr)
        }
        setIsDisableBtn(newErrorArr.some(error => error.isError))
    }

    const checkErrorByType = (type: ECreateCategories) => {
        let indexError = errorArr.findIndex((item) => item.type === type)
        if (indexError > -1) return errorArr[indexError]
        return null
    }

    const onClose = () => {
        if (isCheckCancel.current)
            setIsVisibleModal(true)
        else
            handleClose()
    }

    const handleAcceptModal = () => {
        setIsVisibleModal(false)
        handleClose()
    }

    const handleOnChangeListSubject = (newList: any[]) => {
        onChangeData(ECreateCategories.subject, newList)
    }

    const getItemSelectChosen = (list: any[], value) => {
        return list.find(item => item?.id === value)
    }

    const onDragEnd = (result) => {
        const { destination, source } = result;
        if (!destination || (destination.index === source.index && destination.draggableId === source.draggableId)) return;

        let newCurrentListSubject = reorder(dataItem.subjects, source.index, destination.index);
        onChangeData(ECreateCategories.subject, [...newCurrentListSubject])
    }

    const validation = () => {
        let isValid = true
        if (dataItem.name.trim().length === 0) {
            handleOnBlur(ECreateCategories.name)
            return false
        }
        if (errorArr.some(error => error.isError)) return false
        if (dataItem.parentId && dataItem.subjects.length === 0) {
            Notification['error']({
                message: 'Vui lòng thêm môn học cho danh mục.',
            })
            return false
        }
        return isValid
    }

    const handleClickCreate = () => {
        let isValidation = validation()
        if (isValidation) {
            let params = { ...dataItem, }
            params.jobtitleIds = params.jobtitles.length > 0 ? params.jobtitles.map(job => job.jobtitleId) : []
            params.subjectIds = params.subjects.length > 0 ? params.subjects.map(subject => subject.id) : []
            let oldParentId = null
            if (item?.parentId !== params?.parentId) {
                oldParentId = item.parentId
            }
            onUpdateData(params, oldParentId)
            handleClose()
        }
    }

    const deleteSubject = (id) => {
        let newDataItem = { ...dataItem }
        newDataItem.subjects = newDataItem.subjects.filter(subject => subject.id !== id)
        setDataItem(newDataItem)
    }
    //End logic Area

    const _renderTitle = () => (<div className="d-flex justify-content-between align-items-center">
        <div className="drawerFilter__textTitle">{`${isEdit ? 'Chỉnh sửa' : 'Thêm'} danh mục`}</div>
        <div className="d-flex align-items-center">
            <div className="buttonClose" onClick={onClose}><Icon_close_drawer /></div>
        </div>
    </div>)

    const _renderName = () => {
        const error = checkErrorByType(ECreateCategories.name)
        return <>
            <CustomInput
                onChangeText={(value) => onChangeData(ECreateCategories.name, value)}
                label='Tên danh mục'
                isRequire
                value={dataItem.name}
                maxLength={50}
                onBlur={() => handleOnBlur(ECreateCategories.name)}
                isError={error.isError}
            />
            {(error && error.isError) && <div className='Lnd__code__error'>{error.errorString}</div>}
        </>
    }

    const _renderSearchEntity = () => (<div className="LnDDrawerFilter__search__entity">
        {dataItem.jobtitles.length > 0 && <div className="title__search">Các vị trí công việc</div>}
        <SearchEntityNew
            isTypeShowInput={true}
            disabledChooseGroup
            locale={{ placeholder: 'Các vị trí công việc' }}
            disabledChooseOrg
            disabledChooseUser
            disabledChooseDepartment
            disabledChooseWorkPosition
            mutilple
            value={[...dataItem.jobtitles]}
            onChange={value => onChangeData(ECreateCategories.jobtitles, [...value])}
        >
        </SearchEntityNew>
    </div>)

    const listParentCategories = React.useMemo(() => {
        if (dataItem?.parentId === '') {
            return listParent.filter(category => category.id !== dataItem?.nodeId)
        }
        return listParent
    }, [listParent, dataItem])

    const _renderParentCategories = () => {
        const isReadOnly = isEdit && dataItem?.parentId === "" && hasChildren ? true : false
        return (<div className="marginTop30px CustomSelect__position__relative">
            <CustomSelect
                onChange={(value: any) => onChangeData(ECreateCategories.parentId, value)}
                label={'Danh mục cha'}
                listData={listParentCategories}
                value={getItemSelectChosen(listParentCategories, dataItem?.parentId) || null}
                isRequired={false}
                isMulti={false}
                disableClearable
                isReadOnly={isReadOnly}
            />
        </div>)
    }

    const _renderJobtitle = () => {
        return <div className='view-item'>
            <div className="text-content-normal text-title">Hiển thị đến các vị trí công việc</div>
            <div className="view-radio-button">
                {JOBTITLE_OPTION.map(option => {
                    return <div key={'option' + option.id} className='view-items-option' onClick={() => onChangeData(ECreateCategories.positionType, option.id)}>
                        <div className="icon-radio">
                            {(option.id === dataItem.positionType) ? <Icon_radio_check /> : <Icon_radio_none />}
                        </div>
                        <div className="text-content-normal">{option.name}</div>
                    </div>
                })}
                {dataItem.positionType === EPositionType.custom && _renderSearchEntity()}
            </div>
        </div>
    }

    const _renderListSubject = () => {
        return <div className='view-item'>
            <div className="text-content-normal text-title">Các môn học thuộc danh mục này</div>
            <div>
                <div className="button-add-subject" onClick={() => setIsVisiblePopover(!isVisiblePopover)}>
                    <Icon_plus_16 />
                    <div className="text-btn-add-subject">Thêm môn học</div>
                </div>
                <PopoverAddSubject
                    isVisible={isVisiblePopover}
                    onClose={() => setIsVisiblePopover(false)}
                    listSubject={listSubjectPublish}
                    currentList={dataItem.subjects}
                    onChangeListData={handleOnChangeListSubject}
                />
            </div>
            {_renderContainer()}
        </div>
    }

    const _renderContainer = () => {
        return <DragDropContext onDragEnd={(result) => onDragEnd(result)}>
            <div className='list-subject-drag-drop'>
                <Droppable droppableId='list-item'>
                    {dataItem.subjects && dataItem.subjects.length > 0
                        ? dataItem.subjects.map((item, index) => _renderDragItem(item, index))
                        : null}
                </Droppable>
            </div>
        </DragDropContext>
    }

    const _renderDragItem = (item, index) => {
        return <Draggable key={item.id} draggableId={item.id} index={index} isCustomDragHandle={true}>
            <UseConsumer>
                {({ provided, snapshot }: IValueProvider) => {
                    return <div className='subject-item-drag'>
                        <div className="icon-drag"  {...provided.dragHandleProps}>
                            <Icon_drag_drop_left />
                        </div>
                        <div className='item-drag-content'>
                            {item.name}
                        </div>
                        <div style={{ cursor: 'pointer' }} onClick={() => deleteSubject(item.id)}>
                            <Icon_close_drawer />
                        </div>
                    </div>
                }}
            </UseConsumer>
        </Draggable>
    }

    const _renderModalAccept = () => {
        return <ModalAccept
            isVisible={isVisibleModal}
            title={isEdit ? 'Xác nhận thoát' : 'Xác nhận hủy'}
            content={isEdit ? 'Nếu bạn thoát bây giờ, hệ thống sẽ không lưu các thay đổi. Bạn có chắc chắn muốn thoát không?' : 'Bạn có muốn hủy tạo danh mục?'}
            handleOnClose={() => setIsVisibleModal(false)}
            handleAccept={handleAcceptModal}
            textBtnAccept={isEdit ? 'Thoát' : 'Đồng ý'}
            statusAccept={isEdit ? 'primary' : 'danger'}
        />
    }

    return <Drawer
        className='LnD-categories__drawer-filter'
        title={_renderTitle()}
        width={678}
        placement="right"
        closable={false}
        onClose={onClose}
        maskClosable={false}
        visible={isVisibleDrawer}
    >
        {dataItem && <div className="drawerFilter__viewFillData">
            {_renderName()}
            {_renderParentCategories()}
            {_renderJobtitle()}
            {_renderListSubject()}
        </div>}

        <div className="drawerFilter__viewButton">
            <Button status='default' className="button__default" onClick={onClose}>
                Hủy
            </Button>
            <Button status='primary' disabled={isDisableBtn} className="button__default" onClick={handleClickCreate}>
                {isEdit ? 'Cập nhật' : 'Tạo danh mục'}
            </Button>
        </div>
        {_renderModalAccept()}
    </Drawer>
}
