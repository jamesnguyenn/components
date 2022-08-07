import { Modal } from '@haravan/hrw-react-components'
import { CustomSelect } from '../../../../components'
import * as React from 'react'
import './index.css'

interface IProps {
    isVisible: boolean
    onClose: Function
    currentList: any[]
    listSubject: any[]
    onChangeListData: Function
}

export function PopoverAddSubject(props: IProps) {
    const { isVisible, onClose, currentList, listSubject, onChangeListData } = props
    const [listData, setListData] = React.useState([])
    const [disable, setDisable] = React.useState(true)

    React.useEffect(() => {
        if (currentList.length > 0) {
            setListData([...currentList])
        }
    }, [currentList])

    const onChangeData = (value: any[]) => {
        setDisable(false)
        setListData([...value])
    }

    const handleOnChangeListData = () => {
        if (!disable) {
            onClose(false)
            onChangeListData([...listData])
        }
    }

    return <Modal
        size='md'
        headerContent={null}
        className='lnd-menu-add-subject'
        bodyContent={<div className='select-list-subject position-relative'>
            <CustomSelect
                onChange={(value: any) => onChangeData(value)}
                label={'Các môn học thuộc danh mục này'}
                listData={listSubject}
                value={listData}
                isRequired={false}
                isMulti={true}
                disableClearable
                limitTags={2}
            />
        </div>}
        footerContent={<div className="lnd-menu-item-view-button">
            <div className="btn-add-subject-default" onClick={() => onClose()}>
                Hủy
            </div>
            <div className="btn-add-subject-default status__primary" onClick={handleOnChangeListData}>
                Thêm
            </div>
        </div>}
        isOpen={isVisible}
        footerDisabledCloseModal
        afterCloseModal={() => onClose()}
        iconClose={false}
    />

    // return (
    //     <Popover
    //         visible={isVisible}
    //         placement='bottomLeft'
    //         content={<Menu className='lnd-menu-add-subject' >
    //             <MenuItem className='lnd-menu-item'>
    //                 <div className='select-list-subject'>
    //                     <CustomSelect
    //                         onChange={(value: any) => onChangeData(value)}
    //                         label={'Các môn học thuộc danh mục này'}
    //                         listData={listSubject}
    //                         value={listData}
    //                         isRequired={false}
    //                         isMulti={true}
    //                         disableClearable
    //                         limitTags={2}
    //                     />
    //                 </div>
    //             </MenuItem>
    //             <MenuItem className='lnd-menu-item'>
    // <div className="view-button">
    //     <div className="btn-add-subject-default" onClick={() => onChangeVisible(false)}>
    //         Hủy
    //     </div>
    //     <div className="btn-add-subject-default status__primary" onClick={handleOnChangeListData}>
    //         Thêm
    //     </div>
    // </div>
    //             </MenuItem>
    //         </Menu>}
    //     />
    // )
}
