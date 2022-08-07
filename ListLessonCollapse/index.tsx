import * as React from 'react'
import { ILearningTurnExamItem, ILearningTurnLessonItem, ILnDContentItem } from '../../../../interfaces';
import { EnumContentLesson, EnumTypeLnDContent, listIconLesson } from '../../CommonHelp/constants';
import { CollapseCustom } from '../CollapseCustom'
import { Icon_check_circle, Icon_exam_item, Icon_lock, ISVGEditor, ISVGFilePDF, ISVGLndContentExam, ISVGPowerPoint, ISVGYoutube } from '../../IconSVG'
import './index.css'
import { checkCompleteLessonOrExam } from '../../CommonHelp/UtilsLnD';
import { Tooltip } from '@haravan/hrw-react-components';

interface IProps {
    listData: IListData[]
    isOnlyView?: boolean
    learningTurnExams?: ILearningTurnExamItem[]
    learningTurnLessons?: ILearningTurnLessonItem[]
    isQualified: boolean
    goToLearningPage: Function
    currentLesson?: any
    handleClickItemLock?: Function;
}

interface IListData {
    itemId?: string;
    name?: string;
    description?: string;
    sortOrder?: number;
    type?: EnumTypeLnDContent;
    [key: string]: any;
    listItem?: ILnDContentItem[]
}

export const ListLessonCollapse = React.memo(({ listData, isOnlyView, learningTurnExams, learningTurnLessons, isQualified, goToLearningPage, currentLesson, handleClickItemLock }: IProps) => {

    return (
        <div style={{ paddingBottom: '16px' }}>
            {listData.map((item, index) => {
                if (item.type === EnumTypeLnDContent.TypeClassify) {
                    const totalLearned = item.listItem.reduce((acc, current) => (current.isComplete ? acc + 1 : acc), 0)
                    return <CollapseCustom
                        header={<div className='lnd-lesson-collapse__header-content'>
                            <div style={{ flexGrow: 1 }}>
                                <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                                    <div className='lnd-lesson-collapse__name-subject'>{item.name}</div>
                                    <div className='percent-learning'>
                                        {`${totalLearned}/${item.listItem.length}`}
                                    </div>
                                </div>
                                <div className='lnd-lesson-collapse__description-subject'>{item.description}</div>
                            </div>
                        </div>}
                        key={'collapseLesson' + index}
                        isNotPadding
                    >
                        {(item?.listItem && item.listItem.length >= 0) &&
                            item.listItem.map((lesson, index) => {
                                return <ItemLesson
                                    key={'lesson' + index}
                                    itemData={lesson}
                                    isOnlyView={isOnlyView}
                                    goToLearningPage={goToLearningPage}
                                    isQualified={isQualified}
                                    learningTurnExams={learningTurnExams}
                                    learningTurnLessons={learningTurnLessons}
                                    isSelected={currentLesson && currentLesson.id === lesson.itemId}
                                    handleClickItemLock={handleClickItemLock}
                                />
                            })
                        }
                    </CollapseCustom>
                } else {
                    return <ItemLesson
                        key={'collapseExam' + index}
                        itemData={item}
                        isOnlyView={isOnlyView}
                        goToLearningPage={goToLearningPage}
                        isQualified={isQualified}
                        learningTurnExams={learningTurnExams}
                        learningTurnLessons={learningTurnLessons}
                        isSelected={currentLesson && currentLesson.id === item.itemId}
                        handleClickItemLock={handleClickItemLock}
                    />
                }
            })}
        </div>
    )
})

interface IItemLesson {
    itemData: ILnDContentItem
    isSelected?: boolean
    isOnlyView?: boolean
    goToLearningPage: Function
    isQualified: boolean
    learningTurnExams?: ILearningTurnExamItem[]
    learningTurnLessons?: ILearningTurnLessonItem[]
    handleClickItemLock?: Function
}

const ItemLesson = ({ itemData, isSelected, isOnlyView, goToLearningPage, handleClickItemLock, isQualified }: IItemLesson) => {
    const { name, description, type, isComplete, isLock } = itemData

    const getIconByType = (type) => {
        if (type === EnumTypeLnDContent.TypeExam)
            return listIconLesson[0]
        else
            return listIconLesson[itemData?.lesson?.contentType]
    }

    const handleGoToLearningPage = () => {
        if (!isLock) {
            goToLearningPage(itemData)
        } else {
            if (handleClickItemLock)
                handleClickItemLock(itemData);
        }
    }

    const iconLesson = getIconByType(type)
    const isExam = type === EnumTypeLnDContent.TypeExam
    return (
        <div
            className={`lnd-item-lesson ${isSelected ? 'selected' : ''} ${isOnlyView ? 'is-only-view' : ''}`}
            onClick={handleGoToLearningPage}
        >
            <div className="content-info">
                <Tooltip title={iconLesson.tooltip}>
                    <div className={`icon-type-item ${isExam ? 'type-exam' : ''}`}>
                        {iconLesson.icon}
                        {isComplete && <div className="icon-complete">
                            <Icon_check_circle size={12} />
                        </div>}
                    </div>
                </Tooltip>
                <div className="main-info">
                    <div className="name">{name}</div>
                    {description.length > 0 && <div className="description">{description}</div>}
                </div>
            </div>
            {(isLock) && <div className='lnd-icon-lock'><Icon_lock /></div>}
        </div>
    )
}