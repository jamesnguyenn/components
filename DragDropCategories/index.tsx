import { Collapse, Tooltip } from '@haravan/hrw-react-components'
import { IParentCategories } from '../../../../interfaces/LnD/ICategories'
import * as React from 'react'
import { Icon_categories_down, Icon_categories_up, Icon_drag_drop_left, Icon_subject_categories, Icon_trash } from '../../IconSVG'
import './index.css'
import { EActionDragDrop } from '../../CommonHelp/constants'

interface IItemAction {
    type: EActionDragDrop,
    tooltip: string,
    icon: any
}
interface IProps {
    children: any
    isShowJobtitle?: boolean
    parentItem?: IParentCategories
    isDragDrop?: boolean
    onDeleteItem?: Function
    onDragEnd: Function
    onDragOver: Function
    onDragStart: Function
    indexChild: number
    indexParent: number
    handleClickBtnAction: Function
    listAction: any[]
}

export function DragDropCategories({
    children,
    isShowJobtitle,
    parentItem,
    onDeleteItem,
    onDragEnd,
    onDragOver,
    onDragStart,
    indexChild,
    indexParent,
    handleClickBtnAction,
    listAction
}: IProps) {
    const [collapseArr, setCollapseArr] = React.useState(['1'])
    const { item } = parentItem

    const subjectRefs = item.subjects.reduce((acc, value) => {
        acc[value.id] = React.createRef();
        return acc;
    }, {});

    const parentItemRef: any = React.useRef();

    const dragEnterId = React.useRef(null)

    const handleOnDragOver = (e, indexSubject) => {
        // subjectRefs[id].current.classList.add('dragover')
        // subjectRefs[id].current.classList.remove('dragover')
        onDragOver(e, {
            indexParent,
            indexSubject,
            indexChild
        })
    }

    const changeStyleSubjetc = (e, indexSubject, id) => {
        if (dragEnterId.current !== id) {
            let oldId = dragEnterId.current
            dragEnterId.current = id
            subjectRefs[id].current.classList.add('dragover')
            oldId && subjectRefs[oldId].current.classList.remove('dragover')
        }
        handleOnDragOver(e, indexSubject)
    }

    const handleOnDragStartSubject = (e, subject, index) => {
        subjectRefs[subject.id].current.classList.add('dragStart')
        onDragStart(e, subject, {
            indexItemDragChild: indexChild,
            indexItemDragParent: indexParent,
            indexItemDragSubject: index
        })
    }

    const handleOnDragEndSubject = (id) => {
        subjectRefs[id].current.classList.remove('dragStart')
        onDragEnd()
    }

    const handleOnDragStartCollapse = (e) => {
        parentItemRef.current && parentItemRef.current.classList.add('dragStart')
        onDragStart(e, parentItem, {
            indexItemDragChild: indexChild,
            indexItemDragParent: indexParent,
            indexItemDragSubject: -1
        })
    }

    const handleOnDragEndCollapse = () => {
        parentItemRef.current && parentItemRef.current.classList.remove('dragStart')
        onDragEnd()
    }

    const renderBtnAction = (item: any, itemAction: IItemAction, key?: string) => {
        return <Tooltip title={itemAction.tooltip} key={key}>
            <div className="btn-item-header" onClick={() => handleClickBtnAction(item, itemAction.type)}>
                {itemAction.icon}
            </div>
        </Tooltip>
    }

    const _renderListSubject = () => {
        if (item.subjects.length > 0) {
            return <>
                {item.subjects.map((subject, index) => (<div
                    ref={subjectRefs[subject.id]}
                    key={'subject-' + index}
                    className='row list-subject'
                    onDragOver={(e) => handleOnDragOver(e, index)}
                >
                    <div className={isShowJobtitle ? "col-6" : "col-12"}>
                        <div className='Lnd-item-subject-categories'>
                            <div className="icon-drag" draggable
                                onDragStart={e => handleOnDragStartSubject(e, subject, index)}
                                onDragEnd={() => handleOnDragEndSubject(subject.id)}
                            // onDragOver={(e) => changeStyleSubjetc(e, index, subject.id)}
                            >
                                <span className='style-drag'>
                                    <Icon_drag_drop_left />
                                </span>
                            </div>
                            <div className="icon-subject">
                                <Icon_subject_categories />
                            </div>
                            <div className="item-subject-content item-enable-drag-drop">
                                <div className="large-content">{subject.code}</div>
                                <div className="small-content">{subject.name}</div>
                            </div>
                            <Tooltip title='Xóa'>
                                <div className='icon-trash-subject' onClick={() => onDeleteItem(EActionDragDrop.deleteSubject, {
                                    item: { ...subject },
                                    categoryId: item.nodeId,
                                    parentId: item.parentId
                                })}>
                                    <Icon_trash size={16} />
                                </div>
                            </Tooltip>
                        </div>
                    </div>
                </div>
                ))}
            </>

        }
        return null
    }

    const _renderHeader = () => {
        return <>
            <div className='icon-collapse-categories'>
                {collapseArr.length > 0 ? <Icon_categories_down /> : <Icon_categories_up />}
            </div>
            <div className={isShowJobtitle ? "col-6" : "col-12 px-0"} >
                <div
                    className='header-drag-drop'
                    ref={parentItemRef}
                    onDragOver={(e) => onDragOver(e, {
                        indexParent,
                        indexSubject: -1,
                        indexChild
                    })}
                    onDragStart={e => handleOnDragStartCollapse(e)}
                    onDragEnd={() => handleOnDragEndCollapse()}
                    draggable
                >
                    <div className='d-flex'>
                        <div className="icon-drag">
                            <span className='style-drag'>
                                <Icon_drag_drop_left />
                            </span>
                        </div>
                        {parentItem.item.name}
                    </div>
                    <div className='button-header-drag-drop'>
                        {listAction.map((actionItem, index) => (renderBtnAction(parentItem, actionItem, `parentItem-${index}-${parentItem.item.id}`)))}
                    </div>
                </div>
            </div>
        </>
    }

    return (
        <div className={`Lnd-collapse-categories-edit`}>
            <Collapse defaultActiveKey={['1']} onChange={(value: string[]) => setCollapseArr(value)}>
                <Collapse.Panel
                    showArrow={false}
                    header={_renderHeader()}
                    key="1"
                >
                    <div className="view-children">
                        {children}
                        {_renderListSubject()}
                    </div>
                </Collapse.Panel>
            </Collapse>
        </div>
    )
}