import * as React from 'react'
import { ELearningTurnDetailStatus, HEADER_TABLE_LEARNING_TURN, LEARNING_RESULT, LEARNING_TURN_STATUS, LEARNING_TYPE_ARR } from '../../CommonHelp/constants'
import { IItemLearningTurn } from '../../../../interfaces';
import './index.css'
import { getAvatarUser, getDateShort, history } from '../../../../utils/env';
import { CardProfile } from '@haravan/hrw-react-components';
import { HrRepositoryCache } from '../../../../repositories';
import { ProfileEmployee } from '../../../../components/ProfileEmployee';
import { NavLink } from 'react-router-dom';

interface IProps {
    listData: IItemLearningTurn[]
    onSetScrollRef: Function
}

const ROUTE_DETAIL = '/lnd/course/'
export const TableLearningTurn = React.memo((props: IProps) => {
    const { listData, onSetScrollRef } = props

    const checkStatus = (status, list) => {
        return list.find(item => item.id === status)
    }

    const renderItem = (item: IItemLearningTurn, index: number) => {
        const route = ROUTE_DETAIL + `${item.id}?isManagerView=true`
        const learningResultObj = checkStatus(item.learningResult, LEARNING_RESULT)
        const learningTypeObj = LEARNING_TYPE_ARR.find(type => type.id === item.learningType)
        const startDate = getDateShort(item.createdAt, "DD/MM/YYYY HH:mm")
        const statusObj = checkStatus(item.status, LEARNING_TURN_STATUS)
        const versionInfo = item?.subjectPublishDate ? `Phiên bản ${getDateShort(item.subjectPublishDate, "DD/MM/YYYY HH:mm")}` : '-'
        return (<tr className="LnD-list-learning-turn__rowItem" key={item.id}>
            <td style={{ fontWeight: 500, minWidth: '300px' }}>
                <NavLink to={route}>
                    {item?.subjectName?.length > 0 ? item.subjectCode + ' - ' + item.subjectName : '-'}
                    <div className='text__secondary'>{versionInfo}</div>
                </NavLink>
            </td>
            <td style={{ minWidth: '130px', fontWeight: 500, }}>
                <NavLink to={route}>
                    {learningTypeObj?.name || '-'}
                </NavLink>
            </td>
            <td style={{ minWidth: '200px' }}>
                {item.createByStudent && <ProfileEmployee photo={getAvatarUser(item.createByStudent.haraId)}
                    fullName={item.createByStudent?.fullName}
                    inline={false}
                    bodyProfile={<span className="name_approver"><CardProfile type='User' id={item?.createByStudent?.haraId} callApiUser={() => HrRepositoryCache.GetUserByHaraId} /></span>}
                    titleProfile={<div className='position-relative'>
                        <NavLink to={route}>
                            <span className="text__secondary">{item.createByStudent.mainPosition.jobtitleName}</span>
                        </NavLink>
                    </div>}
                />}
            </td>
            <td style={{ minWidth: '150px' }}>
                <NavLink to={route}>
                    {item?.classroom?.name || '-'}
                </NavLink>
            </td>
            <td style={{ minWidth: '200px' }}>
                {item?.classroom?.lecturer ? <ProfileEmployee photo={getAvatarUser(item.classroom.lecturer?.haraId)}
                    fullName={item.classroom.lecturer?.fullName}
                    inline={false}
                    bodyProfile={<span className="name_approver"><CardProfile type='User' id={item.classroom.lecturer?.haraId} callApiUser={() => HrRepositoryCache.GetUserByHaraId} /></span>}
                    titleProfile={<div className='position-relative'>
                        <NavLink to={route}><span className="text__secondary">{item.classroom.lecturer?.mainPosition?.jobtitleName}</span></NavLink>
                    </div>
                    }
                /> : '-'}
            </td>
            <td style={{ minWidth: '150px' }}>
                <NavLink to={route}>
                    {startDate}
                </NavLink>
            </td>
            <td style={{ minWidth: '100px' }}>
                <NavLink to={route}>
                    {item.status === ELearningTurnDetailStatus.done ? item.averagePoint : '-'}
                </NavLink>
            </td>
            <td style={{ minWidth: '100px' }}>
                <NavLink to={route}>
                    {item.status === ELearningTurnDetailStatus.done ? <div className="d-flex flex-grow-1">
                        <div className='status__bg' style={{ backgroundColor: learningResultObj?.backgroundColor || '#E8EAED' }}>
                            <span className="status__text" style={{ color: learningResultObj?.color || '#021337' }}>{learningResultObj?.name || ''}</span>
                        </div>
                    </div> : '-'}
                </NavLink>
            </td>
            <td style={{ minWidth: '130px' }}>
                <NavLink to={route}>
                    <div className="d-flex flex-grow-1">
                        <div className='status__bg' style={{ backgroundColor: statusObj?.backgroundColor || '#E8EAED' }}>
                            <span className="status__text" style={{ color: statusObj?.color || '#021337' }}>{statusObj?.name || ''}</span>
                        </div>
                    </div>
                </NavLink>
            </td>
        </tr>)
    }

    const renderTable = () => {
        return <table className="LnD-list-learning-turn__table">
            <thead>
                <tr>
                    {HEADER_TABLE_LEARNING_TURN.map((item, index) => (<th key={'header' + index}>{item}</th>))}
                </tr>
            </thead>
            <tbody>
                {listData.map((item, index) => renderItem(item, index))}
            </tbody>
        </table>
    }

    return (
        <div className="LnD-list-learning-turn__container">
            <div className="LnD-list-learning-turn__inner" ref={ref => onSetScrollRef(ref)}>
                {renderTable()}
            </div>
        </div>
    )
})
