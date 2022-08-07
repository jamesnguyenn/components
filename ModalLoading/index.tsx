import React from 'react'
import { Button, Modal, } from '@haravan/hrw-react-components';
import './index.css'

interface IProps {
    isVisible: boolean
    handleClose: Function
    title: string
    content: string
}

export function ModalLoading({ isVisible, handleClose, title, content }: IProps) {

    return (<Modal size='sm' isOpen={isVisible}
        headerContent={<div>{title}</div>}
        isBtnClose={false}
        bodyContent={<div className="quickApproveCondition__loadingApprove">
            <div className="requestProgress">
                <div className="bar"></div>
            </div>
            <div className="quickApproveCondition__loadingApprove__textContent">{content}</div>
        </div>}
        footerContent={<span>
            <Button status='link' onClick={handleClose}>Hủy</Button>
        </span>}
        afterCloseModal={handleClose}
    />
    )
}
