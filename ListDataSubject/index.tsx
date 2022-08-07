import * as React from 'react'
import { ELNDSortType, ELNDSubjectSortField, HEADER_TABLE_SUBJECT, LEARNING_TYPE_ARR, SORT_ARRAY, STATUS_SUBJECT_ARR } from '../../CommonHelp/constants'
import { IItemDataSubject } from '../../../../interfaces';
import './index.css'
import { getAvatarUser, getDateShort, history } from '../../../../utils/env';
import { CardProfile } from '@haravan/hrw-react-components';
import { HrRepositoryCache } from '../../../../repositories';
import { ProfileEmployee } from '../../../../components/ProfileEmployee';
import { Icon_sort_ascend, Icon_sort_descend } from '../../IconSVG';
import { NavLink } from 'react-router-dom';

interface IProps {
    listData: IItemDataSubject[]
    onSort: Function
    onSetScrollRef: Function
}

interface ISortObj {
    SortField: number,
    SortType: number
}

const ROUTE_DETAIL = '/lnd/manager/detail/'
export const ListDataSubject = React.memo((props: IProps) => {
    const { listData, onSort, onSetScrollRef } = props
    const [sortObj, setSortObj] = React.useState<ISortObj>({ SortField: ELNDSubjectSortField.CreatedAt, SortType: -1 })

    const handleOnSort = (newSortField) => {
        let newSortObj = { ...sortObj }
        if (newSortField === sortObj.SortField) {
            newSortObj.SortType = newSortObj.SortType === ELNDSortType.Ascending ? ELNDSortType.Descending : ELNDSortType.Ascending
        } else {
            newSortObj = { SortField: newSortField, SortType: 1 }
        }
        onSort(newSortObj)
        setSortObj(newSortObj)
    }

    const checkStatus = (status) => {
        return STATUS_SUBJECT_ARR.find(item => item.id === status)
    }

    const renderItem = (item: IItemDataSubject, index: number) => {
        const route = ROUTE_DETAIL + `${item.id}`
        const statusObj = checkStatus(item.status) || STATUS_SUBJECT_ARR[1]
        const learningTypeObj = LEARNING_TYPE_ARR.find(type => type.id === item.learningType)
        const dateCreate = getDateShort(item.createdAt, "DD/MM/YYYY")
        const timeCreate = getDateShort(item.createdAt, "HH:mm:ss")
        const dateUpdate = getDateShort(item.updatedAt, "DD/MM/YYYY")
        const timeUpdate = getDateShort(item.updatedAt, "HH:mm:ss")
        const datePublication = item?.lastPublicationDate ? getDateShort(item.lastPublicationDate, "DD/MM/YYYY") : 'Chưa xuất bản'
        const timePublication = item?.lastPublicationDate ? getDateShort(item.lastPublicationDate, "HH:mm:ss") : 'Chưa xuất bản'
        return (
            <tr className="LnD-list-subject__rowItem" key={item.id}>
                <td style={{ fontWeight: 500, minWidth: '100px', textTransform: 'uppercase' }}>
                    <NavLink to={route}>
                        <div className="d-flex flex-grow-1">
                            {item?.code?.length > 0 ? item.code : '-'}
                        </div>
                    </NavLink>
                </td>
                <td style={{ width: '272px', fontWeight: 500, }}>
                    <NavLink to={route}>
                        {item?.name?.length > 0 ? item.name : '-'}
                        <div className='text__secondary'>{item?.isDraft ?
                            (item?.lastVersionId !== null ? 'Có bản nháp' : 'Bản nháp')
                            : ''}</div>
                    </NavLink>
                </td>
                <td style={{ minWidth: '150px' }}>
                    <NavLink to={route}>
                        <div>{dateCreate}</div>
                        <div className="text__secondary">{timeCreate}</div>
                    </NavLink>
                </td>
                <td style={{ minWidth: '150px' }}>
                    <NavLink to={route}>
                        <div>{dateUpdate}</div>
                        <div className="text__secondary">{timeUpdate}</div>
                    </NavLink>
                </td>
                <td style={{ minWidth: '200px' }}>
                    {item.author && <ProfileEmployee photo={getAvatarUser(item.authorHaraId)}
                        fullName={item.author?.fullName}
                        inline={false}
                        bodyProfile={<span className="name_approver"><CardProfile type='User' id={item.authorHaraId} callApiUser={() => HrRepositoryCache.GetUserByHaraId} /></span>}
                        titleProfile={<div className='position-relative'>
                            <NavLink to={route}>
                                <span className="text__secondary">{item.author.mainPosition.jobtitleName}</span>
                            </NavLink>
                        </div>}
                    />}

                </td>
                <td style={{ minWidth: '150px' }}>
                    <NavLink to={route}>
                        {learningTypeObj?.name || '-'}
                    </NavLink>
                </td>
                <td style={{ minWidth: '160px' }}>
                    <NavLink to={route}>
                        {item?.lastPublicationDate ? <>
                            <div>{datePublication}</div>
                            <div className="text__secondary">{timePublication}</div>
                        </> : <div className='lnd-list-subject__text-not-publish'>Chưa xuất bản</div>
                        }
                    </NavLink>
                </td>
                <td style={{ minWidth: '150px' }}>
                    <NavLink to={route}>
                        <div className="d-flex flex-grow-1">
                            <div className='status__bg' style={{ backgroundColor: statusObj?.backgroundColor || '#E8EAED' }}>
                                <span className="status__text" style={{ color: statusObj?.color || '#021337' }}>{statusObj?.name || ''}</span>
                            </div>
                        </div>
                    </NavLink>
                </td>
            </tr >)
    }

    const renderItemHeader = (item, index) => {
        if (item.isSort) {
            return <th key={'header' + index}>
                <div
                    className='d-flex'
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleOnSort(item.key)}
                >
                    <div>
                        {item.name}
                    </div>
                    <div className='buttons__sort' >
                        {SORT_ARRAY.map((sort) => (<div
                            key={'sort' + sort}
                            className='sortButton'
                        >
                            {sort === 1
                                ? <Icon_sort_ascend check={item.key === sortObj.SortField && sort === sortObj.SortType} />
                                : <Icon_sort_descend check={item.key === sortObj.SortField && sort === sortObj.SortType} />}
                        </div>))}
                    </div>
                </div>
            </th>
        }
        return <th key={index}>{item.name}</th>
    }

    const renderTable = () => {
        return <table className="LnD-list-subject__table" >
            <thead>
                <tr>
                    {HEADER_TABLE_SUBJECT.map((item, index) => (renderItemHeader(item, index)))}
                </tr>
            </thead>
            <tbody>
                {listData.map((item, index) => renderItem(item, index))}
            </tbody>
        </table>
    }

    return (
        <div className="list-data-subject__container">
            <div className="LnD-list-subject__inner" ref={ref => onSetScrollRef(ref)}>
                {renderTable()}
            </div>
        </div>
    )
})
