import * as React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

export declare type optionSize = 'large' | 'medium' | 'small';

interface ModalConfirmProps {
    isOpen: boolean,
    popupSize?: optionSize,
    headerTitle: JSX.Element,
    headerHasClose?: boolean,
    bodyContent: JSX.Element,
    footerContent?: JSX.Element,
    handleCloseModal?: Function,
    customWidth?: any,
    className?: string,
    onEnterKeypress?: Function

}

export class ModalConfirm extends React.Component<ModalConfirmProps, any> {
    constructor(props: any) {
        super(props)

        this.state = {
        }
    }
    private _handleKeyDown = (e) => {
        switch (e.keyCode) {
            case 13:
                this.props.isOpen && this.props.onEnterKeypress ? this.props.onEnterKeypress() : null;
                break;
            default:
                break;
        }
    }
    componentDidMount() {
        document.addEventListener("keypress", this._handleKeyDown);
    }
    private onClickhidenDatePicker(e) {
        var x = document.getElementsByClassName("modal-open")[0] as any;
        var y = document.getElementsByClassName("datetime-picker datetime-picker-popup")as any;
        if (y != null && y.length > 0) {
            for (var i = 0; i < y.length; i++) {
                if (y[i].style.display == "block")
                    x.click();
            }
           
        }
    }

    componentWillReceiveProps(nextProp) {
        if (nextProp.isOpen) {
            //document.getElementsByClassName("modal-dialog")[0].addEventListener("click", this.onClickhidenDatePicker);
        }

    }

    componentWillUnmount() {
        document.removeEventListener("keypress", this._handleKeyDown);
    }

    private changePopupSize(size: string) {
        switch (size) {
            case 'large':
                size = 'lg';
                break;
            case 'medium':
                size = 'md';
                break;
            case 'small':
                size = 'sm';
                break;
            default:
                break;
        }
        return size;
    }

    public render() {
        let optionSize = this.changePopupSize(this.props.popupSize);
        let className = this.props.className ? this.props.className : 'modal-comfirm'
        return <Modal onClick={(e) => this.onClickhidenDatePicker(e)} isOpen={this.props.isOpen} className={className} toggle={this.props.handleCloseModal} size={optionSize} style={{ width: this.props.customWidth }}>
            {this.props.headerHasClose ?
                <ModalHeader toggle={this.props.handleCloseModal}>{this.props.headerTitle}</ModalHeader> :
                <ModalHeader>{this.props.headerTitle}</ModalHeader>
            }
            <ModalBody>{this.props.bodyContent}</ModalBody>
            {this.props.footerContent
                ? <ModalFooter>{this.props.footerContent}</ModalFooter>
                : null
            }
        </Modal>
    }
}