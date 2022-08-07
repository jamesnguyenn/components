import { Collapse, Tooltip } from '@haravan/hrw-react-components'
import { IItemCategories } from '../../../../interfaces/LnD/ICategories'
import * as React from 'react'
import { Icon_categories_down, Icon_categories_up, Icon_subject_categories } from '../../IconSVG'
import './index.css'
import { ELearningResult, EPositionType, LEARNING_RESULT } from '../../CommonHelp/constants'
import { IItemLearningTurn, IDetailSubject } from '../../../../interfaces'
import { NavLink } from 'react-router-dom'

interface IProps {
    children: any
    header: any
    isShowJobtitle?: boolean
    item?: IItemCategories
    isDashBoard?: boolean
}

const NUMBER_ITEM_JOBTITLE = 5
export function CollapseCategories({ children, header, isShowJobtitle, item, isDashBoard }: IProps) {
    const [collapseArr, setCollapseArr] = React.useState(['1'])

    const _renderListSubject = () => {
        if (item.subjects.length > 0) {
            return <>
                {item.subjects.map((subject, index) => (<div className='row mx-0 list-subject' key={'subject-render-' + index}>
                    <div className={isShowJobtitle ? "col-6 lnd-list-subject-padding-left-8px" : "col-12"}>
                        <ItemSubjectCategories
                            subject={subject}
                            isDashBoard={isDashBoard || false}
                            learningTurnManager={item?.learningTurnManager || []}
                        />
                    </div>
                    {isShowJobtitle && <div className="col-6 view-jobtitles-subject" style={{ paddingLeft: '24px' }}>
                        -
                    </div>}
                </div>))}
            </>
        }
        return null
    }

    const _renderListItemJobtitle = (item: IItemCategories) => {
        if (item && item.jobtitles && item.jobtitles.length > 0) {
            let trimList = []
            let listRender = [...item.jobtitles]
            let tooltipName = ''
            if (item.jobtitles.length > NUMBER_ITEM_JOBTITLE) {
                listRender = listRender.slice(0, NUMBER_ITEM_JOBTITLE)
                trimList = [...item.jobtitles].slice(NUMBER_ITEM_JOBTITLE, item.jobtitles.length)
                trimList.map((value, index) => {
                    tooltipName = tooltipName + value.name + ((index === trimList.length - 1) ? '' : ', ')
                })
            }
            return <>
                {listRender.map((job, index) => (
                    <div
                        key={`jobtitle-${job?.jobtitleId}-${index}`}
                        className='item-jobtitle-categories'
                    >
                        {job.name}
                    </div>))}
                {trimList.length > 0 && <Tooltip title={tooltipName}>
                    <div
                        className='item-jobtitle-categories'
                    >
                        {`+ ${trimList.length}`}
                    </div>
                </Tooltip>}
            </>
        }
        return null
    }

    const _renderShowJobtitle = () => {
        return <div className="col-6 view-jobtitles-subject">
            {item?.positionType === EPositionType.all
                ? 'Tất cả'
                : _renderListItemJobtitle(item)
            }
        </div>
    }

    const isCollapseBasic = collapseArr.some(collapse => collapse === "1")
    return (
        <div className={`Lnd-collapse-categories`}>
            <Collapse defaultActiveKey={['1']} onChange={(value: string[]) => setCollapseArr(value)}>
                <Collapse.Panel
                    showArrow={false}
                    header={<>
                        <div className='icon-collapse-categories'>
                            {isCollapseBasic ? <Icon_categories_down /> : <Icon_categories_up />}
                        </div>
                        <div className={isShowJobtitle ? "col-6" : "col-12"}>
                            {header}
                        </div>
                        {isShowJobtitle && _renderShowJobtitle()}
                    </>}
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

interface IItemSubject {
    subject: IDetailSubject,
    isDashBoard: boolean,
    learningTurnManager: IItemLearningTurn[]
}

const DETAIL_BASE_URL = '/lnd/course/'
export function ItemSubjectCategories({ subject, isDashBoard, learningTurnManager }: IItemSubject) {

    const renderDashboard = () => {
        let smallContent = ''
        let colorSmallContent = "#81899B"
        let url = DETAIL_BASE_URL
        let learningTurnItem = null
        if (learningTurnManager.length > 0 && subject.subVersionIds.length > 0) {
            for (let index = learningTurnManager.length - 1; index >= 0; index--) {
                const element = learningTurnManager[index];
                if (subject.subVersionIds.some(subVersion => subVersion === element.subjectId)) {
                    learningTurnItem = element
                    break
                }
            }

            if (learningTurnItem && learningTurnItem.learningResult !== 0) {
                smallContent = LEARNING_RESULT.find(resultItem => resultItem.id === learningTurnItem.learningResult)?.name || ""
                colorSmallContent = learningTurnItem.learningResult === ELearningResult.success ? "#1D7859" : "#CA4E4A"
            } else if (learningTurnItem && learningTurnItem.learningResult === 0) {
                smallContent = `Hoàn tất ${learningTurnItem.totalLessonComplete}/${learningTurnItem.totalLesson} bài`
            }
        }
        if (learningTurnItem?.id) {
            url += learningTurnItem.id
        } else {
            url += 'subject/' + subject.lastVersionId
        }
        return <NavLink to={url} className="item-subject-content isDashBoard">
            <div className="large-content">
                <span style={{ fontWeight: 500 }}>{subject.code} - </span>
                {subject.lastVersionName}
            </div>
            <div
                className="small-content font-weight-500"
                style={{ color: colorSmallContent }}
            >
                {smallContent}
            </div>
        </NavLink>
    }

    const renderContent = () => {
        return <div className="item-subject-content">
            <div className="large-content">{subject.code}</div>
            <div className="small-content">{subject.name}</div>
        </div>
    }


    return <div className='Lnd-item-subject-categories'>
        <div className="icon-subject">
            <Icon_subject_categories />
        </div>
        {isDashBoard ? renderDashboard() : renderContent()}
    </div>
}