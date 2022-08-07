import { Tooltip } from '@haravan/hrw-react-components'
import * as React from 'react'
import { Icon_close_filter, Icon_dot_filter, Icon_filter, Icon_next, Icon_previous } from '../../IconSVG'
import { Carousel } from '../Carousel'
import '../../index.css'

interface IProps {
    pagingObj: any
    filterArray: any[]
    isShowFilter: boolean
    onChangePaging: Function
    onOpenDrawer: Function
    handleResetFilter: Function
    handleDeleteItemFilter: Function
    listData: any[]
}

export interface IItemFilterArr {
    value: string
    toolTip: string
    key: any
}

let filterContainerWidth = 0
let pagingWidth = 0
export function FilterContainer({ pagingObj, filterArray, isShowFilter, listData, onChangePaging, onOpenDrawer, handleResetFilter, handleDeleteItemFilter }: IProps) {

    React.useEffect(() => {
        filterContainerWidth = document.getElementById('filter__container').clientWidth;
        pagingWidth = document.getElementById('filter__paging').clientWidth
    }, [listData])

    const _renderItemFilter = (item: IItemFilterArr, index: number) => {
        let content = (<div className="viewItem__applyFilter" key={'item_filter' + index}>
            <div>{item.value}</div>
            <div className="clearItemFilter" onClick={() => handleDeleteItemFilter(item)}>
                <Icon_close_filter />
            </div>
        </div>)
        if (item.toolTip) {
            return <Tooltip title={item.toolTip} key={'tooltip_filter' + index}>
                {content}
            </Tooltip>
        }
        return content
    }

    const _renderApplyFilter = (filterArray: IItemFilterArr[]) => {
        const maxWidth = (filterContainerWidth - pagingWidth - 188)
        return <div className="filter__item mr-2 LnD-list-subject__applyFilter" style={{ cursor: 'unset' }}>
            <span style={{ whiteSpace: 'nowrap' }}>Bộ lọc đang áp dụng: </span>
            <Carousel max_width={maxWidth}>
                {filterArray.map((item, index) => (_renderItemFilter(item, index)))}
                <div className="buttonReset" onClick={() => handleResetFilter()}>Đặt lại</div>
            </Carousel>
        </div>
    }

    const { page, page_size, totalCount, totalPage } = pagingObj
    const pagingString = `${page_size * (page - 1) + 1} - ${((page_size * page) <= totalCount) ? (page_size * page) : totalCount}`
    return <div className="Lnd__filter__container" id="filter__container">
        <div className="d-flex .align-items-center">
            {isShowFilter && _renderApplyFilter(filterArray)}
        </div>
        <div className="d-flex .align-items-center" id="filter__paging">
            {(listData && listData.length > 0) && <React.Fragment>
                <div className="filter__item mr-2" style={{ cursor: 'unset' }}>
                    <span style={{ color: '#4E5A73' }}>{pagingString} trong số {totalCount || ''}</span>
                </div>
                <div className="filter__item m-0 p-0">
                    <div className="view__button" onClick={() => onChangePaging('previous')}>
                        <Icon_previous color={page === 1 ? '#81899B' : null} />
                    </div>
                    <div className="view__button" onClick={() => onChangePaging('next')}>
                        <Icon_next color={page === totalPage || totalPage === 0 ? '#81899B' : null} />
                    </div>
                </div>
            </React.Fragment>}
            <div className="filter__item my-0 mr-0 p-0 icon__filter" onClick={() => onOpenDrawer()}>
                <Icon_filter />
                {(filterArray.length > 0) && <div className="icon__dot">
                    <Icon_dot_filter />
                </div>}
            </div>
        </div>
    </div >
}
