import { Collapse, CropImage, Selection, } from '@haravan/hrw-react-components'
import * as React from 'react'
import { CustomInput } from '../CustomInput'
import { ContentEditor, CustomSelect, SearchEntityNew } from '../../../../components'
import {
    Icon_checkBox_checked,
    Icon_checkBox_none,
    Icon_collapse_down,
    Icon_collapse_up,
    Icon_download_banner,
    Icon_file,
    Icon_radio_check,
    Icon_radio_none,
    Icon_trash_banner
} from '../../IconSVG'
import { ListFileUpload } from '../ListFileUpload'
import {
    ConfigEditorLnD,
    EnumGeneralInfo,
    ERROR_GENERAL_INFO,
    LEARNING_TYPE_ARR,
    TIME_LINE_ARR
} from '../../CommonHelp/constants'
import { api_upload_file, IsNullOrEmpty, saveFile, specialCharacters } from '../../../../utils/env'
import { IGeneralInfo, IItemSubjectCreateNew } from '../../../../interfaces/LnD/ICreateNew'
import { CustomSelection } from '../CustomSelection'
import removeVietnameseTones from '../../CommonHelp/UtilsLnD'

interface IProps {
    generalObj: IGeneralInfo,
    onChangeGeneralInfo: Function
    listSubject: IItemSubjectCreateNew[]
    isPublished: boolean
    listSubjectPublish: IItemSubjectCreateNew[]
    isEdit: boolean
}

export const GeneralInfo = React.memo(({ generalObj, isEdit, listSubjectPublish, isPublished, onChangeGeneralInfo, listSubject }: IProps) => {
    const [searchEntity, setSearchEntity] = React.useState([])
    const [searchJobtitle, setSearchJobtitle] = React.useState([])
    const [collapseArr, setCollapseArr] = React.useState<string[]>(['1', '2', '3'])
    const [errorArr, setErrorArr] = React.useState([...ERROR_GENERAL_INFO])

    const isFirst = React.useRef(true)

    React.useEffect(() => {
        if (isFirst.current && generalObj?.authorHaraId && generalObj.authorHaraId?.haraId && searchEntity.length === 0) {
            let newSearchEntity = []
            newSearchEntity.push(generalObj.authorHaraId)
            setSearchEntity(newSearchEntity)
            setSearchJobtitle([...generalObj.jobTitleIds])
            if (isEdit) {
                handleOnBlur(EnumGeneralInfo.code, generalObj)
            }
            isFirst.current = false
        }
    }, [generalObj.authorHaraId])

    const uploadBanner = async (file) => {
        await api_upload_file(file, file.name).then((result) => {
            if (result) {
                onChangeGeneralInfo({ ...generalObj, attachment: { ...result } })
            }
        })
    }

    const onChangeData = (value, type: EnumGeneralInfo) => {
        let newGeneralObj: any = { ...generalObj }
        if (type === EnumGeneralInfo.authorHaraId) {
            setSearchEntity([...value])
            newGeneralObj[type] = value.length > 0 ? value[0] : null
        } else if (type === EnumGeneralInfo.jobTitleIds) {
            setSearchJobtitle([...value])
            newGeneralObj[type] = value.length > 0 ? [...value] : []
        } else if (type === EnumGeneralInfo.code) {
            if (!specialCharacters(value)) {
                newGeneralObj[type] = removeVietnameseTones(value).toUpperCase().trim()
            }
        } else if (type === EnumGeneralInfo.name) {
            newGeneralObj[type] = value
        } else if (type === EnumGeneralInfo.isAllJobtitle) {
            newGeneralObj[type] = value
            if (value) {
                newGeneralObj.jobTitleIds = []
                setSearchJobtitle([])
            }
        }
        else if (value?.length > 0 && value[0]?.id)
            newGeneralObj[type] = [...value]
        else if (value && !IsNullOrEmpty(value.id))
            newGeneralObj[type] = value.id
        else
            newGeneralObj[type] = value
        if (isFirst.current) {
            isFirst.current = false
        } else {
            handleOnBlur(type, newGeneralObj)
        }
        onChangeGeneralInfo(newGeneralObj)
    }

    const handleOnBlur = (type: EnumGeneralInfo, newGeneralObj = generalObj) => {
        let newErrorArr = [...errorArr]
        let message = ''
        let value = newGeneralObj[type]
        if (type === EnumGeneralInfo.code && value.length === 0) {
            message = 'Vui lòng nhập mã môn học'
        } else if (type === EnumGeneralInfo.code && value.length < 3) {
            message = 'Mã môn học phải chứa 3 ký tự'
        } else if (type === EnumGeneralInfo.code && value.length === 3) {
            const indexCodeChosen = listSubject.findIndex(subject => subject.code === value)
            if (indexCodeChosen > -1) {
                message = 'Mã môn học này đã được sử dụng'
            }
        } else if (type === EnumGeneralInfo.name && value.length === 0) {
            message = 'Vui lòng nhập tên môn học'
        } else if (type === EnumGeneralInfo.timeLine && (value === null || value === '')) {
            message = 'Vui lòng nhập thời lượng môn học'
        } else if (type === EnumGeneralInfo.timeLine && Number(value) === 0) {
            message = 'Thời lượng môn học phải lớn hơn 0'
        } else if (type === EnumGeneralInfo.timeLine && (value > 999)) {
            message = 'Thời lượng môn học phải nhỏ hơn 1000'
        } else if (type === EnumGeneralInfo.name && value.length === 0) {
            message = 'Vui lòng nhập tên môn học'
        } else if (type === EnumGeneralInfo.learningType && value === null) {
            message = 'Vui lòng chọn hình thức học'
        } else if (!newGeneralObj.isAllJobtitle && (type === EnumGeneralInfo.jobTitleIds || type === EnumGeneralInfo.isAllJobtitle) && !newGeneralObj?.jobTitleIds) {
            message = 'Vui lòng chọn vị trí công việc cho môn học'
        } else if (type === EnumGeneralInfo.descriptions && value.length === 0) {
            message = 'Vui lòng nhập giới thiệu cho môn học'
        } else if (type === EnumGeneralInfo.authorHaraId && !value?.haraId) {
            message = 'Vui lòng chọn tác giả'
        }
        let indexError = newErrorArr.findIndex((item) => item.type === type)
        if (indexError > -1) {
            newErrorArr[indexError] = { type, errorString: message, isError: message.length > 0 }
            setErrorArr(newErrorArr)
        }
    }

    const checkErrorByType = (type: EnumGeneralInfo) => {
        let indexError = errorArr.findIndex((item) => item.type === type)
        if (indexError > -1) return errorArr[indexError]
        return null
    }

    const _renderCode = () => {
        const error = checkErrorByType(EnumGeneralInfo.code)
        return <>
            <CustomInput
                onChangeText={(value) => onChangeData(value, EnumGeneralInfo.code)}
                label='Mã môn học (3 ký tự)'
                isRequire
                value={generalObj.code}
                maxLength={3}
                isError={error.isError}
                InputStyle={{ textTransform: 'uppercase' }}
                onBlur={() => handleOnBlur(EnumGeneralInfo.code)}
                disable={isPublished}
            />
            {(error && error.isError && !isPublished) && <div className='Lnd__code__error'>{error.errorString}</div>}
        </>
    }

    const _renderName = () => {
        const error = checkErrorByType(EnumGeneralInfo.name)
        return <>
            <CustomInput
                onChangeText={(value) => onChangeData(value, EnumGeneralInfo.name)}
                label='Tên môn học'
                isRequire
                value={generalObj.name}
                maxLength={50}
                isError={error.isError}
                onBlur={() => handleOnBlur(EnumGeneralInfo.name)}
            />
            {(error && error.isError) && <div className='Lnd__code__error'>{error.errorString}</div>}
        </>
    }

    const _renderSearchEntity = () => {
        const error = checkErrorByType(EnumGeneralInfo.authorHaraId)
        return <>
            <div className={`margin__top__8px search__entity LnD__authorId ${error.isError ? 'border-error' : ''}`}>
                <div className="title__search__entity">Tác giả <span style={{ color: "#CA4E4A" }}>*</span></div>
                <SearchEntityNew
                    isTypeShowInput={true}
                    disabledChooseGroup
                    locale={{ placeholder: '' }}
                    disabledChooseOrg
                    disabledChooseDepartment
                    disabledChooseJobtitle
                    disabledChooseWorkPosition
                    value={searchEntity}
                    mutilple={false}
                    onChange={value => onChangeData(value, EnumGeneralInfo.authorHaraId)}
                />
            </div>
            {(error && error.isError) && <div className='Lnd__code__error'>{error.errorString}</div>}
        </>
    }

    const _renderBanner = () => {
        return <div className='Lnd__banner__upload'>
            <div className='Lnd__title__field'>Ảnh đại diện <span style={{ color: '#CA4E4A' }}>*</span></div>
            {generalObj.attachment && generalObj.attachment.url ? <div className='Lnd__banner__img'>
                <img
                    src={generalObj.attachment.url}
                    className='image__banner__chosen'
                />
                <div className='view__action'>
                    <div className="btn__action" onClick={() => saveFile(generalObj.attachment.url, generalObj.attachment.name)}>
                        <Icon_download_banner />
                    </div>
                    <div className="btn__action" onClick={() => onChangeGeneralInfo({ ...generalObj, attachment: null })}>
                        <Icon_trash_banner />
                    </div>
                </div>
            </div> :
                <CropImage
                    onChange={uploadBanner}
                    type='drag'
                    maxSize={30}
                    width={352}
                    height={198}
                    accept={'image/jpg,image/jpeg,image/png'}
                >
                    <div className='Lnd__banner__upload__container'>
                        <div className='Lnd__banner__upload__box'>
                            <Icon_file />
                            <div style={{ marginLeft: '16px' }}>
                                <div className="Lnd__banner__upload__textTitle">Kéo thả file hoặc
                                    <span style={{ color: '#2161CC', fontWeight: 400 }}> Chọn file từ máy tính</span>
                                </div>
                                <div className="Lnd__banner__upload__textSecondary">Sử dụng file có định dạng (.jpeg, .png) và có kích thước 352 x 198px</div>
                            </div>
                        </div>
                    </div>
                </CropImage>}
        </div>
    }

    const _renderDescription = () => {
        const error = checkErrorByType(EnumGeneralInfo.descriptions)
        return <div className='Lnd__createNew__description'>
            <div className='Lnd__title__field'>Giới thiệu <span style={{ color: '#CA4E4A' }}>*</span></div>
            <ContentEditor
                config={ConfigEditorLnD}
                value={generalObj.descriptions}
                onChange={(value) => onChangeData(value, EnumGeneralInfo.descriptions)}
                onBlur={() => handleOnBlur(EnumGeneralInfo.descriptions)}
                className={error.isError ? 'border-error' : null}
            />
            <div
                className="Lnd__description__subtitle"
                style={{ color: error.isError ? '#FDA19E' : '#677187' }}
            >
                {error.isError ? error.errorString : 'Hãy giới thiệu rõ môn học này đem lại giá trị gì cho người học, các lưu ý khi học...'}
            </div>
        </div>
    }

    const _renderTimeLine = () => {
        const error = checkErrorByType(EnumGeneralInfo.timeLine)
        return <div className="col-2 Lnd__paddingRight12px CustomSelect__position__relative">
            <CustomInput
                onChangeText={(value) => onChangeData(value, EnumGeneralInfo.timeLine)}
                label='Thời lượng'
                isRequire
                value={generalObj.timeLine}
                type='number'
                isError={error.isError}
                onBlur={() => handleOnBlur(EnumGeneralInfo.timeLine)}
            />
            {(error && error.isError) && <div className='Lnd__code__error'>{error.errorString}</div>}
        </div>
    }

    const _renderLearningType = () => {
        const error = checkErrorByType(EnumGeneralInfo.learningType)
        const learningType = LEARNING_TYPE_ARR.find(type => type.id === generalObj.learningType)
        return <div className="col-4 CustomSelect__position__relative" style={{ marginTop: '12px' }}>
            <CustomSelect
                onChange={(value: any) => onChangeData(value, EnumGeneralInfo.learningType)}
                label='Hình thức học'
                listData={LEARNING_TYPE_ARR}
                value={learningType}
                isRequired
                disableClearable
                isError={error.isError}
                handleOnBlur={() => handleOnBlur(EnumGeneralInfo.learningType)}
            />
            {(error && error.isError) && <div className='Lnd__code__error'>{error.errorString}</div>}
        </div>
    }

    const _renderBasicInfo = () => {
        return <div style={{ padding: '4px' }}>
            <div className="row mx-0">
                <div className="col-4 px-0">
                    {_renderCode()}
                </div>
                <div className="col-8 pr-0">
                    {_renderName()}
                </div>
            </div>
            <div className="row mx-0 Lnd__marginTop24px">
                <div className="col-4 px-0 Lnd__paddingRight12px">
                    {_renderSearchEntity()}
                </div>
                {_renderLearningType()}

                {_renderTimeLine()}
                <div className="col-2  px-0 CustomSelect__position__relative">
                    <CustomSelection
                        defaultValue={generalObj.timeLineType}
                        onChange={(value) => onChangeData(value, EnumGeneralInfo.timeLineType)}
                    >
                        {TIME_LINE_ARR.map((item, index) => (<Selection.Option value={item.id} key={'custom-selection' + index}>
                            {item.name}
                        </Selection.Option>))}
                    </CustomSelection>
                </div>
            </div>

            {_renderBanner()}
            {_renderDescription()}

            <div style={{ marginTop: '24px' }}>
                <ListFileUpload
                    listFileUpload={generalObj.attachmentFiles}
                    onChangeList={(newList) => onChangeData(newList, EnumGeneralInfo.attachmentFiles)}
                    isEdit
                    isMultiple
                    accept={'.mp4,.rar,image/tif, application/octet-stream,application/zip, application/x-zip-compressed, .avi, .mp3, multipart/x-rar,  application/x-compressed, application/x-rar-compressed, application/pdf,image/gif,image/jpg,image/jpeg,image/png,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/x-zip-compressed,application/x-gzip-compressed.csv, .doc, .docx, .djvu, .odp, .ods, .odt, .pps, .ppsx, .ppt, .pptx, .pdf, .ps, .eps, .rtf, .txt, .wks, .wps, .xls, .xlsx, .xps ,.bmp ,.exr ,.gif ,.ico ,.jp2 ,.jpeg ,.pbm ,.pcx ,.pgm ,.png,.jpeg ,.ppm ,.psd ,.tiff ,.tga ,.7z ,.zip ,.jar ,.tar ,.tar ,.gz ,.cab ,.3gp ,.flv ,.m4v ,.mkv ,.mov ,.mpeg ,.ogv ,.wmv ,.webm ,.aac ,.ac3 ,.aiff ,.amr ,.ape ,.au ,.flac ,.m4a ,.mka ,.mpc ,.ogg ,.ra ,.wav ,.wma'}
                />
            </div>
        </div>
    }

    const _renderInfoCondition = () => {
        return <div style={{ padding: '4px' }}>
            <div className=" mx-0 Lnd__marginTop26px CustomSelect__position__relative">
                <CustomSelect
                    onChange={(value: any) => onChangeData(value, EnumGeneralInfo.subJectIds)}
                    label='Đã hoàn tất những môn học'
                    listData={listSubjectPublish}
                    value={generalObj.subJectIds}
                    isMulti
                    disableClearable
                />
            </div>
            <div className="row mx-0 Lnd__directManager__info" onClick={() => onChangeData(!generalObj.isManagerAssigned, EnumGeneralInfo.isManagerAssigned)}>
                {generalObj.isManagerAssigned ? <Icon_checkBox_checked /> : <Icon_checkBox_none />}
                <div className='Lnd__directManager__info__textContent'>Cần có trực tiếp quản lý chỉ định đi học</div>
            </div>
        </div>
    }

    const _renderOptionJobtitle = (isCheck: boolean, content: string, status: boolean) => {
        return <div className='LnD-jobtitle-item' onClick={() => onChangeData(status, EnumGeneralInfo.isAllJobtitle)}>
            {isCheck ? <Icon_radio_check /> : <Icon_radio_none />}
            <div className="jobtitle-content">
                {content}
            </div>
        </div>
    }

    const _renderEntityJobtitle = () => {
        const error = checkErrorByType(EnumGeneralInfo.jobTitleIds)
        return <>
            <div className={`margin__top__8px search__entity ${error.isError ? 'border-error' : ''}`}>
                <div className="title__search__entity">Các vị trí công việc<span style={{ color: "#CA4E4A" }}>*</span></div>
                <SearchEntityNew
                    isTypeShowInput={true}
                    disabledChooseGroup
                    locale={{ placeholder: 'Vui lòng chọn' }}
                    disabledChooseOrg
                    disabledChooseDepartment
                    disabledChooseWorkPosition
                    disabledChooseUser
                    value={searchJobtitle}
                    mutilple={true}
                    onChange={value => onChangeData(value, EnumGeneralInfo.jobTitleIds)}
                />
            </div>
            {(error && error.isError) && <div className='Lnd__code__error'>{error.errorString}</div>}
        </>
    }

    const _renderJobtitle = () => {
        return <div className='LnD-jobtitle-list'>
            {_renderOptionJobtitle(generalObj?.isAllJobtitle, 'Tất cả vị trí công việc', true)}
            {_renderOptionJobtitle(!generalObj?.isAllJobtitle, 'Tùy chỉnh', false)}
            {!generalObj.isAllJobtitle && _renderEntityJobtitle()}
        </div>
    }

    const isCollapseBasic = collapseArr.some(collapse => collapse === "1")
    const isCollapseJobtitle = collapseArr.some(collapse => collapse === "2")
    const isCollapseCondition = collapseArr.some(collapse => collapse === "3")
    return (
        <div className='Lnd__general__info'>
            <Collapse defaultActiveKey={['1', '2', '3']} onChange={(value: string[]) => setCollapseArr(value)}>
                <Collapse.Panel
                    showArrow={false}
                    header={<div style={{ padding: '4px' }}>Thông tin cơ bản</div>}
                    key="1"
                    extra={<div>
                        {isCollapseBasic ? <Icon_collapse_up /> : <Icon_collapse_down />}
                    </div>}
                    className='Lnd__collapse__view'
                >
                    {_renderBasicInfo()}
                </Collapse.Panel>
                <div style={{ height: '16px', width: '100%', backgroundColor: '#F7F8F9' }}></div>
                <Collapse.Panel
                    showArrow={false}
                    header={<div style={{ padding: '4px' }}>Hiển thị đến các vị trí công việc</div>}
                    key="2"
                    extra={<div>
                        {isCollapseJobtitle ? <Icon_collapse_up /> : <Icon_collapse_down />}
                    </div>}
                    className='Lnd__collapse__view'
                >
                    {_renderJobtitle()}
                </Collapse.Panel>
                <div style={{ height: '16px', width: '100%', backgroundColor: '#F7F8F9' }}></div>
                <Collapse.Panel
                    showArrow={false}
                    header={<div style={{ padding: '4px' }}>Điều kiện để học môn này</div>}
                    key="3"
                    extra={<div>
                        {isCollapseCondition ? <Icon_collapse_up /> : <Icon_collapse_down />}
                    </div>}
                    className='Lnd__collapse__view'
                >
                    {_renderInfoCondition()}
                </Collapse.Panel>
            </Collapse>
        </div>
    )
})
