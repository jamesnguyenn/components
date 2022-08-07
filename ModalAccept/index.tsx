import * as React from 'react'
import { Button, Modal, Textarea } from '@haravan/hrw-react-components';
import './index.css'

interface IProps {
    isVisible: boolean,
    handleOnClose?: Function
    handleAccept?: Function
    title?: string
    content?: string | React.ReactNode
    textBtnAccept?: string
    statusAccept?: 'danger' | 'primary'
    textBtnClose?: string
    isTextArea?: boolean
}

export function ModalAccept({ isVisible, isTextArea, handleOnClose, handleAccept, title, content, statusAccept, textBtnAccept, textBtnClose }: IProps) {
    const [text, setText] = React.useState('')
    const [disableAccept, setDisableAccept] = React.useState(false)

    const handleClickAccept = () => {
        setDisableAccept(true)
        if (isTextArea) {
            handleAccept(text)
        } else {
            handleAccept()
        }
    }

    return (
        <Modal
            size='sm'
            isOpen={isVisible}
            isBtnClose={false}
            headerContent={<div>{title}</div>}
            bodyContent={<div className="lnd-modal-accept__text-title">
                {content}
                {isTextArea
                    ? <Textarea
                        placeholder='Nhập ghi chú cho phiên bản mới'
                        onChange={(value) => setText(value)}
                        rows={5}
                        value={text}
                    />
                    : null}
            </div>}
            footerContent={<span>
                <Button status='link' onClick={handleOnClose}><span style={{ color: '#021337' }}>{textBtnClose || 'Đóng'}</span></Button>
                <Button status={statusAccept || 'danger'} disabled={disableAccept} onClick={handleClickAccept}>{textBtnAccept || 'Đồng ý'}</Button>
            </span>}
            footerDisabledCloseModal
            afterCloseModal={handleOnClose}
        >
        </Modal>
    )
}
