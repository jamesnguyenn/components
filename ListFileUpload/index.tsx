import * as React from 'react'
import { FileUpload, Modal, Notification } from '@haravan/hrw-react-components'
import { CreateSVG } from '../../../../lib_components';
import { api_upload_file, api_upload_file_multi_internal, isCheckFileImage, isCheckFileView, saveFile } from '../../../../utils/env';
import './index.css'

interface IProps {
    listFileUpload: IFileItem[]
    onChangeList?: Function
    isEdit: boolean
    classNameTitle?: any
    accept?: string
    maxSize?: number
    isHiddenUpload?: boolean
    isHiddenTitle?: boolean
    disableOpen?: boolean
    isMultiple?: boolean
    isDelete?: boolean
}

export interface IFileItem {
    ext: string
    id: number
    name: string
    orgId: number
    size: string
    url: string
    type?: any
}

export function ListFileUpload(props: IProps) {
    const { listFileUpload, isEdit, isHiddenUpload = false, isHiddenTitle, disableOpen, isMultiple } = props
    const [isShowModalImage, setIsShowModalImage] = React.useState(false)
    const [itemImage, setItemImage] = React.useState<IFileItem | null>(null)

    const handleActionViewFile = (url: string, item: IFileItem) => {
        if (!disableOpen) {
            if (isCheckFileImage(url)) {
                setIsShowModalImage(true)
                setItemImage(item)
            }
            if (isCheckFileView(url)) {
                let a = document.createElement('a');
                a.href = "https://docs.google.com/gview?url=" + url;
                a.download = item.name;
                a.target = '_blank'
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        }
    }

    const calcTotalSize = (newListFile) => {
        return newListFile.reduce((accummulate, current) => accummulate + current.size, 0)

    }

    const uploadFile = async (files: any[]) => {
        if (!(files.length > 0)) {
            Notification["error"]({
                message: "File không đúng định dạng cho phép. Vui lòng kiểm tra lại.",
            });
            return;
        }

        if (!isMultiple && files.length > 1) {
            files.splice(1, files.length - 1)
        }

        const totalSize = calcTotalSize(files)

        const maxSize = props.maxSize ? props.maxSize * 1000000 : 30000000
        if (totalSize > maxSize) {
            Notification["error"]({
                message: `Hệ thống chỉ chấp nhận ${files.length > 1 ? 'tổng dung lượng file' : 'file có dung lượng'} tối đa ${props.maxSize || 30}MB`,
            });
            return;
        }

        await api_upload_file_multi_internal(files).then((result) => {
            if (result) {
                let newListFile = [...listFileUpload, ...result]
                props.onChangeList(newListFile)
            }
        })
    }

    const deleteFileItem = (itemDelete: IFileItem) => {
        let newListFile = [...listFileUpload]
        newListFile = newListFile.filter(item => item.url !== itemDelete.url)
        props.onChangeList(newListFile)
    }

    const renderModal = () => {
        if (!itemImage) {
            return null
        }
        return <Modal
            className='content--popup-new__attachment__modal popup_img'
            isOpen={isShowModalImage}
            isBtnClose={false}
            headerContent={
                <React.Fragment>
                    <span className='text-center'>{itemImage.name}</span>
                    <span className='text-align-right' onClick={() => { saveFile(itemImage.url, itemImage.name) }}>
                        <CreateSVG className='svg-next-icon-size-14 mb-2' linkHref='#next-icon-filedownload' />&nbsp;Download
                    </span>
                </React.Fragment>}
            afterCloseModal={() => setIsShowModalImage(false)}
            size='md'
            bodyContent={(
                <div className="d-inline-block">
                    <div className="modal-close-outside" onClick={() => setIsShowModalImage(false)}></div>
                    <div className='text-center position-relative'>
                        <img src={itemImage.url}></img>
                    </div>
                </div>
            )}
        />
    }

    return (
        <div className="Custom__fileUpload padding-x-24px">
            {isHiddenTitle ? null : <div className={props?.classNameTitle ? props.classNameTitle : 'Custom__fileUpload__title'}
                style={{ margin: '0px 0px 8px' }}
            >
                File đính kèm
            </div>}
            {listFileUpload.length > 0 && <div className="ExTimeWork__viewListFile">
                {listFileUpload.map((item, index) => <ItemFile key={'item-file-upload' + index} item={item} isEdit={isEdit} handleActionViewFile={handleActionViewFile} deleteFileItem={deleteFileItem} isDelete={props.isDelete}/>)}
            </div>}
            {isEdit && !isHiddenUpload && <FileUpload
                onChange={uploadFile}
                type='drag'
                accept={props.accept ? props.accept : '.mp4,.rar,image/tif, application/octet-stream,application/zip, application/x-zip-compressed, .avi, .mp3, multipart/x-rar,  application/x-compressed, application/x-rar-compressed, application/pdf,image/gif,image/jpg,image/jpeg,image/png,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/x-zip-compressed,application/x-gzip-compressed.csv, .doc, .docx, .djvu, .odp, .ods, .odt, .pps, .ppsx, .ppt, .pptx, .pdf, .ps, .eps, .rtf, .txt, .wks, .wps, .xls, .xlsx, .xps ,.bmp ,.exr ,.gif ,.ico ,.jp2 ,.jpeg ,.pbm ,.pcx ,.pgm ,.png,.jpeg ,.ppm ,.psd ,.tiff ,.tga ,.7z ,.zip ,.jar ,.tar ,.tar ,.gz ,.cab ,.3gp ,.flv ,.m4v ,.mkv ,.mov ,.mpeg ,.ogv ,.wmv ,.webm ,.aac ,.ac3 ,.aiff ,.amr ,.ape ,.au ,.flac ,.m4a ,.mka ,.mpc ,.ogg ,.ra ,.wav ,.wma'}
                showNotify={false}
                multiple={isMultiple}
                maxSize={1000}
            >
                <div className='Custom__fileUpload__container'>
                    <div className='Custom__fileUpload__box'>
                        <Icon_file />
                        <div style={{ marginLeft: '16px' }}>
                            <div className="Custom__fileUpload__textTitle">Kéo thả file hoặc
                                <span style={{ color: '#2161CC', fontWeight: 400 }}> Chọn file từ máy tính</span>
                            </div>
                            <div className="Custom__fileUpload__textSecondary">Vui lòng sử dụng file có tổng dung lượng là 30MB</div>
                        </div>
                    </div>
                </div>
            </FileUpload>}
            {renderModal()}
        </div>
    )
}

const ItemFile = ({ item, handleActionViewFile, deleteFileItem, isEdit, isDelete = true }) => {
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        setTimeout(() => {
            setIsLoading(false)
        }, 2000);
    }, [])


    const checkTypeUrl = (url) => {
        if (url.match(/\.(jpg|jpeg|png|gif|PNG|JPG|bmp)$/) != null) {
            return "image";
        } else if (url.match(/\.(doc|docx)$/) != null) {
            return "word";
        } else if (url.match(/\.(xls|xlsx)$/) != null) {
            return "excel";
        } else if (url.match(/\.(pdf)$/) != null) {
            return "pdf";
        } else if (url.match(/\.(rar)$/) != null) {
            return "rar";
        } else if (url.match(/\.(zip)$/) != null) {
            return "zip";
        } else if (url.match(/\.(txt)$/) != null) {
            return "txt";
        } else if (url.match(/\.(mp3|mpeg|wav|ogg)$/) != null) {
            return "sound";
        } else if (url.match(/\.(webm|3gp|mov|avi|wmv|flv|mp4)$/) != null) {
            return "video";
        } else if (url.match(/\.(ppt|pptx)$/) != null) {
            return "ppt";
        } else {
            return "sketch";
        }
    }

    const checkIconFile = (type) => {
        switch (type) {
            case "word":
                return <Icon_word />;
            case "excel":
                return <Icon_excel />;
            case "pdf":
                return <Icon_pdf />;
            case "rar":
                return <Icon_rar />;
            case "zip":
                return <Icon_rar />;
            case "txt":
                return <Icon_form />;
            case "sketch":
                return <Icon_other />;
            case "image":
                return <Icon_image />;
            case "video":
                return <Icon_video />;
            case "sound":
                return <Icon_sound />;
            case "ppt":
                return <Icon_ppt />;
            default:
                return <Icon_other />;
        }
    }

    const name = item?.name ? item.name.substr(0, item.name.lastIndexOf('.')) : ''
    const type = item?.name ? item.name.substr(item.name.lastIndexOf('.') + 1) : ''
    const typeCheck = checkTypeUrl(item.name)
    const icon = checkIconFile(typeCheck)
    return <div className="fileUpload__viewItem" >
        <div onClick={() => handleActionViewFile(item.url, item)}>
            {icon}
        </div>
        <div className="fileUpload__fileInfo" onClick={() => handleActionViewFile(item.url, item)}>
            <div className='fileUpload__fileInfo__textName'>{name}</div>
            {isLoading && isEdit ?
                <div className="progress mt-2" style={{ height: '2px' }}>
                    <div className="progress-bar" role="progressbar" style={{ width: '50%' }}></div>
                </div> :
                <div className="fileUpload__typeFile">
                    {type.toLocaleUpperCase()}
                </div>}
        </div>
        {isEdit && <div className='d-flex'>
            <div className="fileUpload__deleteItem" onClick={() => saveFile(item.url, item.name)}>
                <Icon_download />
            </div>
            {isDelete && <div className="fileUpload__deleteItem" onClick={() => deleteFileItem(item)}>
                <Icon_delete_file />
            </div>}
        </div>}
    </div >
}

const Icon_download = () => {
    return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.667 13.332H3.33366C3.15685 13.332 2.98728 13.4023 2.86225 13.5273C2.73723 13.6523 2.66699 13.8219 2.66699 13.9987C2.66699 14.1755 2.73723 14.3451 2.86225 14.4701C2.98728 14.5951 3.15685 14.6654 3.33366 14.6654H12.667C12.8438 14.6654 13.0134 14.5951 13.1384 14.4701C13.2634 14.3451 13.3337 14.1755 13.3337 13.9987C13.3337 13.8219 13.2634 13.6523 13.1384 13.5273C13.0134 13.4023 12.8438 13.332 12.667 13.332ZM7.52699 11.8054C7.59039 11.8661 7.66516 11.9136 7.74699 11.9454C7.82679 11.9806 7.91308 11.9989 8.00033 11.9989C8.08757 11.9989 8.17386 11.9806 8.25366 11.9454C8.33549 11.9136 8.41026 11.8661 8.47366 11.8054L11.1403 9.1387C11.2659 9.01316 11.3364 8.8429 11.3364 8.66536C11.3364 8.48783 11.2659 8.31757 11.1403 8.19203C11.0148 8.0665 10.8445 7.99597 10.667 7.99597C10.4895 7.99597 10.3192 8.0665 10.1937 8.19203L8.66699 9.72536V1.9987C8.66699 1.82189 8.59675 1.65232 8.47173 1.52729C8.34671 1.40227 8.17714 1.33203 8.00033 1.33203C7.82351 1.33203 7.65394 1.40227 7.52892 1.52729C7.4039 1.65232 7.33366 1.82189 7.33366 1.9987V9.72536L5.80699 8.19203C5.74483 8.12987 5.67104 8.08056 5.58983 8.04692C5.50861 8.01328 5.42156 7.99597 5.33366 7.99597C5.24575 7.99597 5.15871 8.01328 5.07749 8.04692C4.99628 8.08056 4.92248 8.12987 4.86033 8.19203C4.79817 8.25419 4.74886 8.32798 4.71522 8.4092C4.68158 8.49041 4.66426 8.57746 4.66426 8.66536C4.66426 8.75327 4.68158 8.84032 4.71522 8.92153C4.74886 9.00275 4.79817 9.07654 4.86033 9.1387L7.52699 11.8054Z" fill="#021337" />
    </svg>

}

const Icon_delete_file = () => {
    return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13.3333 3.99999H10.6667V3.33333C10.6667 2.8029 10.456 2.29419 10.0809 1.91911C9.70581 1.54404 9.1971 1.33333 8.66667 1.33333H7.33333C6.8029 1.33333 6.29419 1.54404 5.91912 1.91911C5.54405 2.29419 5.33333 2.8029 5.33333 3.33333V3.99999H2.66667C2.48986 3.99999 2.32029 4.07023 2.19526 4.19526C2.07024 4.32028 2 4.48985 2 4.66666C2 4.84347 2.07024 5.01304 2.19526 5.13807C2.32029 5.26309 2.48986 5.33333 2.66667 5.33333H3.33333V12.6667C3.33333 13.1971 3.54405 13.7058 3.91912 14.0809C4.29419 14.4559 4.8029 14.6667 5.33333 14.6667H10.6667C11.1971 14.6667 11.7058 14.4559 12.0809 14.0809C12.456 13.7058 12.6667 13.1971 12.6667 12.6667V5.33333H13.3333C13.5101 5.33333 13.6797 5.26309 13.8047 5.13807C13.9298 5.01304 14 4.84347 14 4.66666C14 4.48985 13.9298 4.32028 13.8047 4.19526C13.6797 4.07023 13.5101 3.99999 13.3333 3.99999ZM6.66667 3.33333C6.66667 3.15652 6.7369 2.98695 6.86193 2.86192C6.98695 2.7369 7.15652 2.66666 7.33333 2.66666H8.66667C8.84348 2.66666 9.01305 2.7369 9.13807 2.86192C9.2631 2.98695 9.33333 3.15652 9.33333 3.33333V3.99999H6.66667V3.33333ZM11.3333 12.6667C11.3333 12.8435 11.2631 13.013 11.1381 13.1381C11.013 13.2631 10.8435 13.3333 10.6667 13.3333H5.33333C5.15652 13.3333 4.98695 13.2631 4.86193 13.1381C4.7369 13.013 4.66667 12.8435 4.66667 12.6667V5.33333H11.3333V12.6667Z" fill="#021337" />
    </svg>
}

const Icon_pdf = () => {
    return <svg width="30" height="36" viewBox="0 0 30 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 0H2.8125C1.26562 0 0 1.10455 0 2.45455V33.5455C0 34.8955 1.26562 36 2.8125 36H27.1875C28.7344 36 30 34.8955 30 33.5455V11L23.4375 5.72727L19 0Z" fill="#81899B" />
        <path d="M23.7466 25.2773C23.6334 25.3474 23.3101 25.3905 23.1054 25.3905C22.4372 25.3905 21.6181 25.0833 20.4596 24.5876C20.9068 24.5553 21.311 24.5391 21.6774 24.5391C22.3456 24.5391 22.5396 24.5391 23.197 24.7061C23.849 24.8678 23.8544 25.2073 23.7466 25.2773ZM12.1558 25.3797C12.4144 24.9271 12.6785 24.4475 12.9479 23.9356C13.6053 22.6908 14.0256 21.7101 14.3328 20.9072C14.9524 22.0334 15.723 22.9872 16.6229 23.7524C16.7361 23.8494 16.8546 23.941 16.9839 24.038C15.1464 24.4044 13.5568 24.8462 12.1558 25.3797ZM14.3004 13.5841C14.6668 13.5841 14.877 14.5034 14.8932 15.371C14.9093 16.2331 14.71 16.8367 14.4567 17.2893C14.2465 16.6211 14.1495 15.5757 14.1495 14.8914C14.1495 14.8914 14.1334 13.5841 14.3004 13.5841ZM7.11206 30.1378C7.32222 29.572 8.14128 28.4512 9.35371 27.4543C9.42915 27.395 9.61775 27.2172 9.79019 27.0556C8.52387 29.0817 7.67248 29.8846 7.11206 30.1378ZM24.0969 24.0865C23.7304 23.7254 22.9114 23.5368 21.672 23.5207C20.8314 23.5099 19.8237 23.5853 18.7568 23.7308C18.2826 23.456 17.7922 23.1596 17.4042 22.7986C16.3696 21.8286 15.5075 20.4869 14.9686 19.0104C15.0009 18.8703 15.0333 18.7518 15.0602 18.6278C15.0602 18.6278 15.6422 15.3139 15.4859 14.193C15.4644 14.0368 15.4536 13.9937 15.4105 13.8751L15.362 13.7404C15.2057 13.3761 14.8932 12.9881 14.4028 13.0092L14.1172 13H14.1118C13.5676 13 13.1203 13.2786 13.0072 13.6919C12.6515 15.0013 13.0179 16.952 13.6807 19.4792L13.5083 19.8941C13.0341 21.0473 12.4414 22.2112 11.9187 23.2351L11.8486 23.3698C11.299 24.4475 10.7979 25.3635 10.3452 26.1395L9.8764 26.3874C9.84407 26.4089 9.04117 26.8292 8.85257 26.9424C7.25756 27.8962 6.19708 28.9793 6.02142 29.8415C5.96538 30.1109 6.00741 30.4611 6.29138 30.6282L6.74402 30.8545C6.93963 30.9515 7.14978 31 7.35994 31C8.49693 31 9.81713 29.5882 11.6331 26.4143C13.7346 25.73 16.1272 25.1588 18.2233 24.8462C19.8183 25.7461 21.7798 26.3712 23.0191 26.3712C23.2401 26.3712 23.4287 26.3497 23.5849 26.3066C23.822 26.2473 24.0214 26.1126 24.1454 25.924C24.3825 25.5629 24.4363 25.0672 24.3663 24.5553C24.3501 24.4044 24.2262 24.2158 24.0969 24.0865Z" fill="white" />
        <path d="M19 0V8.25C19 9.76937 20.2134 11 21.7115 11H30L19 0Z" fill="#B8BDC7" />
    </svg>
}

const Icon_excel = () => {
    return <svg width="30" height="36" viewBox="0 0 30 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 0H2.8125C1.26562 0 0 1.10455 0 2.45455V33.5455C0 34.8955 1.26562 36 2.8125 36H27.1875C28.7344 36 30 34.8955 30 33.5455V11L23.4375 5.72727L19 0Z" fill="#81899B" />
        <path d="M21.75 15.5H8.25C8.05109 15.5 7.86032 15.579 7.71967 15.7197C7.57902 15.8603 7.5 16.0511 7.5 16.25V29.75C7.5 29.9489 7.57902 30.1397 7.71967 30.2803C7.86032 30.421 8.05109 30.5 8.25 30.5H21.75C21.9489 30.5 22.1397 30.421 22.2803 30.2803C22.421 30.1397 22.5 29.9489 22.5 29.75V16.25C22.5 16.0511 22.421 15.8603 22.2803 15.7197C22.1397 15.579 21.9489 15.5 21.75 15.5ZM14.25 29H9V26H14.25V29ZM14.25 24.5H9V21.5H14.25V24.5ZM21 29H15.75V26H21V29ZM21 24.5H15.75V21.5H21V24.5ZM21 20H9V17H21V20Z" fill="white" />
        <path d="M19 0V8.25C19 9.76937 20.2134 11 21.7115 11H30L19 0Z" fill="#B8BDC7" />
    </svg>
}

const Icon_word = () => {
    return <svg width="30" height="36" viewBox="0 0 30 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 0H2.8125C1.26562 0 0 1.10455 0 2.45455V33.5455C0 34.8955 1.26562 36 2.8125 36H27.1875C28.7344 36 30 34.8955 30 33.5455V11L23.4375 5.72727L19 0Z" fill="#81899B" />
        <path d="M8.25 19.25H21.75C21.9489 19.25 22.1397 19.171 22.2803 19.0303C22.421 18.8897 22.5 18.6989 22.5 18.5C22.5 18.3011 22.421 18.1103 22.2803 17.9697C22.1397 17.829 21.9489 17.75 21.75 17.75H8.25C8.05109 17.75 7.86032 17.829 7.71967 17.9697C7.57902 18.1103 7.5 18.3011 7.5 18.5C7.5 18.6989 7.57902 18.8897 7.71967 19.0303C7.86032 19.171 8.05109 19.25 8.25 19.25ZM8.25 22.25H18.75C18.9489 22.25 19.1397 22.171 19.2803 22.0303C19.421 21.8897 19.5 21.6989 19.5 21.5C19.5 21.3011 19.421 21.1103 19.2803 20.9697C19.1397 20.829 18.9489 20.75 18.75 20.75H8.25C8.05109 20.75 7.86032 20.829 7.71967 20.9697C7.57902 21.1103 7.5 21.3011 7.5 21.5C7.5 21.6989 7.57902 21.8897 7.71967 22.0303C7.86032 22.171 8.05109 22.25 8.25 22.25ZM21.75 23.75H8.25C8.05109 23.75 7.86032 23.829 7.71967 23.9697C7.57902 24.1103 7.5 24.3011 7.5 24.5C7.5 24.6989 7.57902 24.8897 7.71967 25.0303C7.86032 25.171 8.05109 25.25 8.25 25.25H21.75C21.9489 25.25 22.1397 25.171 22.2803 25.0303C22.421 24.8897 22.5 24.6989 22.5 24.5C22.5 24.3011 22.421 24.1103 22.2803 23.9697C22.1397 23.829 21.9489 23.75 21.75 23.75ZM18.75 26.75H8.25C8.05109 26.75 7.86032 26.829 7.71967 26.9697C7.57902 27.1103 7.5 27.3011 7.5 27.5C7.5 27.6989 7.57902 27.8897 7.71967 28.0303C7.86032 28.171 8.05109 28.25 8.25 28.25H18.75C18.9489 28.25 19.1397 28.171 19.2803 28.0303C19.421 27.8897 19.5 27.6989 19.5 27.5C19.5 27.3011 19.421 27.1103 19.2803 26.9697C19.1397 26.829 18.9489 26.75 18.75 26.75Z" fill="white" />
        <path d="M19 0V8.25C19 9.76937 20.2134 11 21.7115 11H30L19 0Z" fill="#B8BDC7" />
    </svg>
}

const Icon_image = () => {
    return <svg width="30" height="36" viewBox="0 0 30 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 0H2.8125C1.26562 0 0 1.10455 0 2.45455V33.5455C0 34.8955 1.26562 36 2.8125 36H27.1875C28.7344 36 30 34.8955 30 33.5455V11L23.4375 5.72727L19 0Z" fill="#81899B" />
        <path d="M22.3879 27.1026L18.6379 21.1026C18.5706 20.9941 18.4768 20.9045 18.3652 20.8424C18.2536 20.7803 18.1281 20.7477 18.0004 20.7477C17.8727 20.7477 17.7471 20.7803 17.6356 20.8424C17.524 20.9045 17.4301 20.9941 17.3629 21.1026L16.6129 22.3251L14.1454 18.1251C14.079 18.0132 13.9846 17.9205 13.8715 17.8561C13.7584 17.7917 13.6305 17.7578 13.5004 17.7578C13.3702 17.7578 13.2423 17.7917 13.1293 17.8561C13.0162 17.9205 12.9218 18.0132 12.8554 18.1251L7.60537 27.1251C7.53973 27.2388 7.50508 27.3677 7.50488 27.499C7.50468 27.6302 7.53894 27.7593 7.60424 27.8731C7.66953 27.987 7.76357 28.0818 7.87695 28.1479C7.99034 28.2141 8.1191 28.2493 8.25037 28.2501H21.7504C21.8844 28.2504 22.016 28.2147 22.1316 28.1469C22.2471 28.079 22.3424 27.9815 22.4075 27.8643C22.4726 27.7472 22.5051 27.6147 22.5016 27.4808C22.4982 27.3468 22.4589 27.2162 22.3879 27.1026ZM13.8379 26.7501H9.55537L13.5004 20.0001L15.6979 23.7501L13.8379 26.7501ZM15.6004 26.7501L17.2504 24.1776L18.0004 22.9176L20.4004 26.7501H15.6004Z" fill="white" />
        <path d="M19 0V8.25C19 9.76937 20.2134 11 21.7115 11H30L19 0Z" fill="#B8BDC7" />
    </svg>
}

const Icon_sound = () => {
    return <svg width="30" height="36" viewBox="0 0 30 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 0H2.8125C1.26562 0 0 1.10455 0 2.45455V33.5455C0 34.8955 1.26562 36 2.8125 36H27.1875C28.7344 36 30 34.8955 30 33.5455V11L23.4375 5.72727L19 0Z" fill="#81899B" />
        <path fillRule="evenodd" clipRule="evenodd" d="M13.7728 16.25C14.1117 16.25 14.3865 16.5247 14.3865 16.8636V27.9091C14.3865 28.248 14.1117 28.5227 13.7728 28.5227C13.4339 28.5227 13.1592 28.248 13.1592 27.9091V16.8636C13.1592 16.5247 13.4339 16.25 13.7728 16.25Z" fill="white" />
        <path fillRule="evenodd" clipRule="evenodd" d="M11.3187 19.9336C11.6576 19.9336 11.9324 20.2083 11.9324 20.5472V25.4563C11.9324 25.7952 11.6576 26.07 11.3187 26.07C10.9798 26.07 10.7051 25.7952 10.7051 25.4563V20.5472C10.7051 20.2083 10.9798 19.9336 11.3187 19.9336Z" fill="white" />
        <path fillRule="evenodd" clipRule="evenodd" d="M8.86364 21.7734C9.20254 21.7734 9.47727 22.0482 9.47727 22.3871V23.6143C9.47727 23.9532 9.20254 24.228 8.86364 24.228C8.52473 24.228 8.25 23.9532 8.25 23.6143V22.3871C8.25 22.0482 8.52473 21.7734 8.86364 21.7734Z" fill="white" />
        <path fillRule="evenodd" clipRule="evenodd" d="M16.2269 17.4766C16.5658 17.4766 16.8406 17.7513 16.8406 18.0902V29.1357C16.8406 29.4746 16.5658 29.7493 16.2269 29.7493C15.888 29.7493 15.6133 29.4746 15.6133 29.1357V18.0902C15.6133 17.7513 15.888 17.4766 16.2269 17.4766Z" fill="white" />
        <path fillRule="evenodd" clipRule="evenodd" d="M18.682 19.9336C19.0209 19.9336 19.2956 20.2083 19.2956 20.5472V25.4563C19.2956 25.7952 19.0209 26.07 18.682 26.07C18.3431 26.07 18.0684 25.7952 18.0684 25.4563V20.5472C18.0684 20.2083 18.3431 19.9336 18.682 19.9336Z" fill="white" />
        <path fillRule="evenodd" clipRule="evenodd" d="M21.1361 21.7734C21.475 21.7734 21.7497 22.0482 21.7497 22.3871V23.6143C21.7497 23.9532 21.475 24.228 21.1361 24.228C20.7972 24.228 20.5225 23.9532 20.5225 23.6143V22.3871C20.5225 22.0482 20.7972 21.7734 21.1361 21.7734Z" fill="white" />
        <path d="M19 0V8.25C19 9.76937 20.2134 11 21.7115 11H30L19 0Z" fill="#B8BDC7" />
    </svg>
}

const Icon_video = () => {
    return <svg width="30" height="36" viewBox="0 0 30 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 0H2.8125C1.26562 0 0 1.10455 0 2.45455V33.5455C0 34.8955 1.26562 36 2.8125 36H27.1875C28.7344 36 30 34.8955 30 33.5455V11L23.4375 5.72727L19 0Z" fill="#81899B" />
        <path d="M19.9052 20.7487L12.6602 16.5937C12.2681 16.3674 11.8232 16.2488 11.3705 16.25C10.9178 16.2513 10.4734 16.3723 10.0827 16.6008C9.69187 16.8293 9.36853 17.1572 9.14547 17.5512C8.92241 17.9451 8.80759 18.3911 8.81266 18.8437V27.1837C8.81266 27.864 9.0829 28.5164 9.56393 28.9975C10.045 29.4785 10.6974 29.7487 11.3777 29.7487C11.828 29.748 12.2702 29.629 12.6602 29.4037L19.9052 25.2487C20.2945 25.0234 20.6177 24.6997 20.8424 24.3101C21.067 23.9204 21.1853 23.4785 21.1853 23.0287C21.1853 22.5789 21.067 22.1371 20.8424 21.7474C20.6177 21.3578 20.2945 21.034 19.9052 20.8087V20.7487ZM19.1552 23.8912L11.9102 28.1062C11.7478 28.1983 11.5643 28.2466 11.3777 28.2466C11.191 28.2466 11.0075 28.1983 10.8452 28.1062C10.6832 28.0127 10.5488 27.8783 10.4553 27.7163C10.3618 27.5544 10.3126 27.3707 10.3127 27.1837V18.8137C10.3126 18.6268 10.3618 18.4431 10.4553 18.2811C10.5488 18.1192 10.6832 17.9847 10.8452 17.8912C11.0082 17.8006 11.1911 17.7517 11.3777 17.7487C11.5641 17.7526 11.7468 17.8015 11.9102 17.8912L19.1552 22.0762C19.3171 22.1697 19.4517 22.3041 19.5452 22.4661C19.6387 22.628 19.688 22.8117 19.688 22.9987C19.688 23.1857 19.6387 23.3695 19.5452 23.5314C19.4517 23.6933 19.3171 23.8278 19.1552 23.9212V23.8912Z" fill="white" />
        <path d="M19 0V8.25C19 9.76937 20.2134 11 21.7115 11H30L19 0Z" fill="#B8BDC7" />
    </svg>
}

const Icon_ppt = () => {
    return <svg width="30" height="36" viewBox="0 0 30 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 0H2.8125C1.26562 0 0 1.10455 0 2.45455V33.5455C0 34.8955 1.26562 36 2.8125 36H27.1875C28.7344 36 30 34.8955 30 33.5455V11L23.4375 5.72727L19 0Z" fill="#81899B" />
        <path d="M20.5938 16H8.40625C7.63281 16 7 16.6328 7 17.4062V29.5938C7 30.3672 7.63281 31 8.40625 31H20.5938C21.3672 31 22 30.3672 22 29.5938V17.4062C22 16.6328 21.3672 16 20.5938 16ZM20.125 26.7812H8.875V20.2187H20.125V26.7812Z" fill="white" />
        <path d="M19 0V8.25C19 9.76937 20.2134 11 21.7115 11H30L19 0Z" fill="#B8BDC7" />
    </svg>
}

const Icon_other = () => {
    return <svg width="30" height="36" viewBox="0 0 30 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 0H2.8125C1.26562 0 0 1.10455 0 2.45455V33.5455C0 34.8955 1.26562 36 2.8125 36H27.1875C28.7344 36 30 34.8955 30 33.5455V11L23.4375 5.72727L19 0Z" fill="#81899B" />
        <path d="M8.25 19.25H21.75C21.9489 19.25 22.1397 19.171 22.2803 19.0303C22.421 18.8897 22.5 18.6989 22.5 18.5C22.5 18.3011 22.421 18.1103 22.2803 17.9697C22.1397 17.829 21.9489 17.75 21.75 17.75H8.25C8.05109 17.75 7.86032 17.829 7.71967 17.9697C7.57902 18.1103 7.5 18.3011 7.5 18.5C7.5 18.6989 7.57902 18.8897 7.71967 19.0303C7.86032 19.171 8.05109 19.25 8.25 19.25ZM8.25 22.25H18.75C18.9489 22.25 19.1397 22.171 19.2803 22.0303C19.421 21.8897 19.5 21.6989 19.5 21.5C19.5 21.3011 19.421 21.1103 19.2803 20.9697C19.1397 20.829 18.9489 20.75 18.75 20.75H8.25C8.05109 20.75 7.86032 20.829 7.71967 20.9697C7.57902 21.1103 7.5 21.3011 7.5 21.5C7.5 21.6989 7.57902 21.8897 7.71967 22.0303C7.86032 22.171 8.05109 22.25 8.25 22.25ZM21.75 23.75H8.25C8.05109 23.75 7.86032 23.829 7.71967 23.9697C7.57902 24.1103 7.5 24.3011 7.5 24.5C7.5 24.6989 7.57902 24.8897 7.71967 25.0303C7.86032 25.171 8.05109 25.25 8.25 25.25H21.75C21.9489 25.25 22.1397 25.171 22.2803 25.0303C22.421 24.8897 22.5 24.6989 22.5 24.5C22.5 24.3011 22.421 24.1103 22.2803 23.9697C22.1397 23.829 21.9489 23.75 21.75 23.75ZM18.75 26.75H8.25C8.05109 26.75 7.86032 26.829 7.71967 26.9697C7.57902 27.1103 7.5 27.3011 7.5 27.5C7.5 27.6989 7.57902 27.8897 7.71967 28.0303C7.86032 28.171 8.05109 28.25 8.25 28.25H18.75C18.9489 28.25 19.1397 28.171 19.2803 28.0303C19.421 27.8897 19.5 27.6989 19.5 27.5C19.5 27.3011 19.421 27.1103 19.2803 26.9697C19.1397 26.829 18.9489 26.75 18.75 26.75Z" fill="white" />
        <path d="M19 0V8.25C19 9.76937 20.2134 11 21.7115 11H30L19 0Z" fill="#B8BDC7" />
    </svg>
}

const Icon_rar = () => {
    return <svg width="30" height="36" viewBox="0 0 30 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 0H2.8125C1.26562 0 0 1.10455 0 2.45455V33.5455C0 34.8955 1.26562 36 2.8125 36H27.1875C28.7344 36 30 34.8955 30 33.5455V11L23.4375 5.72727L19 0Z" fill="#81899B" />
        <path d="M17 1H15V2.33333H17V1Z" fill="white" />
        <path d="M15 2.33203H13V3.66536H15V2.33203Z" fill="white" />
        <path d="M17 3.66797H15V5.0013H17V3.66797Z" fill="white" />
        <path d="M15 5H13V6.33333H15V5Z" fill="white" />
        <path d="M17 6.33203H15V7.66536H17V6.33203Z" fill="white" />
        <path d="M15 7.66797H13V9.0013H15V7.66797Z" fill="white" />
        <path d="M17 9H15V10.3333H17V9Z" fill="white" />
        <path d="M15 10.332H13V11.6654H15V10.332Z" fill="white" />
        <path d="M17 11.668H15V13.0013H17V11.668Z" fill="white" />
        <path d="M15 13H13V14.3333H15V13Z" fill="white" />
        <path d="M13 15.668V19.0013C13 20.106 13.8953 21.0013 15 21.0013C16.1047 21.0013 17 20.106 17 19.0013V15.668H13ZM15.6667 19.0013H14.3333V17.668H15.6667V19.0013Z" fill="white" />
        <path d="M19 0V8.25C19 9.76937 20.2134 11 21.7115 11H30L19 0Z" fill="#B8BDC7" />
    </svg>
}

const Icon_form = () => {
    return <svg width="30" height="36" viewBox="0 0 30 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 0H2.8125C1.26562 0 0 1.10455 0 2.45455V33.5455C0 34.8955 1.26562 36 2.8125 36H27.1875C28.7344 36 30 34.8955 30 33.5455V11L23.4375 5.72727L19 0Z" fill="#81899B" />
        <path d="M8.78267 26.2175C8.71135 26.1492 8.62724 26.0957 8.53517 26.06C8.35258 25.985 8.14777 25.985 7.96517 26.06C7.87311 26.0957 7.789 26.1492 7.71767 26.2175C7.64939 26.2888 7.59587 26.3729 7.56017 26.465C7.50274 26.6016 7.48705 26.7521 7.51508 26.8976C7.54311 27.0431 7.61361 27.177 7.71767 27.2825C7.79058 27.3487 7.87429 27.402 7.96517 27.44C8.05495 27.4797 8.15202 27.5002 8.25017 27.5002C8.34833 27.5002 8.4454 27.4797 8.53517 27.44C8.62606 27.402 8.70977 27.3487 8.78267 27.2825C8.88674 27.177 8.95724 27.0431 8.98527 26.8976C9.0133 26.7521 8.99761 26.6016 8.94017 26.465C8.90448 26.3729 8.85095 26.2888 8.78267 26.2175ZM11.2502 20H21.7502C21.9491 20 22.1399 19.921 22.2805 19.7803C22.4212 19.6397 22.5002 19.4489 22.5002 19.25C22.5002 19.0511 22.4212 18.8603 22.2805 18.7197C22.1399 18.579 21.9491 18.5 21.7502 18.5H11.2502C11.0513 18.5 10.8605 18.579 10.7198 18.7197C10.5792 18.8603 10.5002 19.0511 10.5002 19.25C10.5002 19.4489 10.5792 19.6397 10.7198 19.7803C10.8605 19.921 11.0513 20 11.2502 20ZM8.78267 22.4675C8.67721 22.3634 8.54328 22.2929 8.39778 22.2649C8.25229 22.2369 8.10176 22.2526 7.96517 22.31C7.87429 22.348 7.79058 22.4013 7.71767 22.4675C7.64939 22.5388 7.59587 22.6229 7.56017 22.715C7.5205 22.8048 7.5 22.9018 7.5 23C7.5 23.0982 7.5205 23.1952 7.56017 23.285C7.59816 23.3759 7.65143 23.4596 7.71767 23.5325C7.79058 23.5987 7.87429 23.652 7.96517 23.69C8.05495 23.7297 8.15202 23.7502 8.25017 23.7502C8.34833 23.7502 8.4454 23.7297 8.53517 23.69C8.62606 23.652 8.70977 23.5987 8.78267 23.5325C8.84892 23.4596 8.90219 23.3759 8.94017 23.285C8.97985 23.1952 9.00035 23.0982 9.00035 23C9.00035 22.9018 8.97985 22.8048 8.94017 22.715C8.90448 22.6229 8.85095 22.5388 8.78267 22.4675ZM21.7502 22.25H11.2502C11.0513 22.25 10.8605 22.329 10.7198 22.4697C10.5792 22.6103 10.5002 22.8011 10.5002 23C10.5002 23.1989 10.5792 23.3897 10.7198 23.5303C10.8605 23.671 11.0513 23.75 11.2502 23.75H21.7502C21.9491 23.75 22.1399 23.671 22.2805 23.5303C22.4212 23.3897 22.5002 23.1989 22.5002 23C22.5002 22.8011 22.4212 22.6103 22.2805 22.4697C22.1399 22.329 21.9491 22.25 21.7502 22.25ZM8.78267 18.7175C8.71135 18.6492 8.62724 18.5957 8.53517 18.56C8.39859 18.5026 8.24806 18.4869 8.10256 18.5149C7.95707 18.5429 7.82314 18.6134 7.71767 18.7175C7.65143 18.7904 7.59816 18.8741 7.56017 18.965C7.5205 19.0548 7.5 19.1518 7.5 19.25C7.5 19.3482 7.5205 19.4452 7.56017 19.535C7.59816 19.6259 7.65143 19.7096 7.71767 19.7825C7.79058 19.8487 7.87429 19.902 7.96517 19.94C8.10176 19.9974 8.25229 20.0131 8.39778 19.9851C8.54328 19.9571 8.67721 19.8866 8.78267 19.7825C8.84892 19.7096 8.90219 19.6259 8.94017 19.535C8.97985 19.4452 9.00035 19.3482 9.00035 19.25C9.00035 19.1518 8.97985 19.0548 8.94017 18.965C8.90219 18.8741 8.84892 18.7904 8.78267 18.7175ZM21.7502 26H11.2502C11.0513 26 10.8605 26.079 10.7198 26.2197C10.5792 26.3603 10.5002 26.5511 10.5002 26.75C10.5002 26.9489 10.5792 27.1397 10.7198 27.2803C10.8605 27.421 11.0513 27.5 11.2502 27.5H21.7502C21.9491 27.5 22.1399 27.421 22.2805 27.2803C22.4212 27.1397 22.5002 26.9489 22.5002 26.75C22.5002 26.5511 22.4212 26.3603 22.2805 26.2197C22.1399 26.079 21.9491 26 21.7502 26Z" fill="white" />
        <path d="M19 0V8.25C19 9.76937 20.2134 11 21.7115 11H30L19 0Z" fill="#B8BDC7" />
    </svg>
}

const Icon_file = () => {
    return <svg width={31} height={36} fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#prefix__clip0_836:284350)">
            <path
                d="M19.5 0H3.312C1.766 0 .5 1.105.5 2.455v31.09C.5 34.895 1.766 36 3.313 36h24.375c1.546 0 2.812-1.105 2.812-2.455V11l-6.563-5.273L19.5 0z"
                fill="#2979FF"
            />
            <path
                d="M19.783 22.467l-3.75-3.75a.75.75 0 00-.248-.157.75.75 0 00-.57 0 .751.751 0 00-.247.157l-3.75 3.75a.754.754 0 001.065 1.065l2.467-2.475v5.693a.75.75 0 001.5 0v-5.693l2.468 2.475A.751.751 0 0020.005 23a.75.75 0 00-.222-.533z"
                fill="#fff"
            />
            <path
                d="M19.5 0v8.25c0 1.52 1.213 2.75 2.712 2.75H30.5l-11-11z"
                fill="#5494FF"
            />
        </g>
        <defs>
            <clipPath id="prefix__clip0_836:284350">
                <path fill="#fff" transform="translate(.5)" d="M0 0h30v36H0z" />
            </clipPath>
        </defs>
    </svg>
}