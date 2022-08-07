import * as React from 'react';
import * as XLSX from 'xlsx';
import './index.css';
import * as HrvComponents from '@haravan/hrw-react-components';
import Dropzone from 'react-dropzone';
import * as _ from 'lodash';
import { IsNullOrEmpty, urlQuery, firstLetterLower, getDataExport, getDateShort, removeAccents, partSpecificToDate2, api_call_get } from '../../../../utils/env';
import { ISVGImportTemplate, Icon_file, ISVGImportFile } from '../../IconSVG'
import * as Utils from '../../CommonHelp/UtilsLnD'
import { ModalConfirm } from '../ModalConfirm';

const make_cols = refStr => {
    let o = [], C = XLSX.utils.decode_range(refStr).e.c + 1;
    for (let i = 0; i < C; ++i) o[i] = { name: XLSX.utils.encode_col(i), key: i }
    return o;
};

interface IDataProps {
    code?: any;
    jsonData?: any;
    onCloseImport?: Function;
    entityJsonData?: any;
    isImportFailure?: any;
    handleImportData?: Function;
    ref: any,
    listStudent: any
}

interface IDataStates {
    data: any[];
    title: any[];
    cols: any[];
    errorMsg: any[];
    fieldData: any[];
    callBack: string;
    callBackName: string;
    header: string;
    description: string;
    active: boolean;
    name: string,
    size: number,
    isLoading: boolean,
    isNotCheckTemplate: boolean,
    apiURL: string;
    apiKey: string;
    templateFileName: string;
    jsonSheet: any;
    dataSheet: any;
    titleSheet: any;
    dataResultSheet: any;
    dataResult: any,
    typeModal: number,
    titleModal: string,
    modalSize: string,
    checkDataItem: any,
}

const initialState: IDataStates = {
    data: [],
    cols: [],
    title: [],
    errorMsg: [],
    fieldData: [],
    callBack: '',
    callBackName: '',
    header: '',
    description: '',
    active: false,
    name: null,
    size: 0,
    isLoading: false,
    isNotCheckTemplate: false,
    apiURL: "",
    apiKey: "",
    templateFileName: "",
    jsonSheet: [],
    dataSheet: [],
    titleSheet: [],
    dataResultSheet: [],
    dataResult: [],
    typeModal: 0,
    titleModal: '',
    modalSize: '',
    checkDataItem: {},
}

const stateReducer = (state: IDataStates, action: any) => {
    const { type, payload } = action;

    switch (type) {
        case 'INIT_DATA_IMPORT':
            return {
                ...state,
                ...payload,
            }
        case 'INIT_DATA_SHEET':
            return {
                ...state,
                dataSheet: [],
                titleSheet: [],
                dataResultSheet: [],
                data: [],
                title: [],
            }
        case 'SET_DATA_FILE':
            return {
                ...state,
                active: payload.active,
                name: payload.name,
                size: payload.size,
            }
        case 'SET_DATA_SHEET':
            return {
                ...state,
                data: payload.data,
                cols: payload.cols,
                title: payload.title,
                titleSheet: payload.titleSheet,
                dataSheet: payload.dataSheet,
            }
        default:
            return state;
    }
}

export const ImportData = (props: IDataProps) => {
    let totalPost = 0;
    let totalCurrent = 0;
    let isPause = false;
    let totalError = 0;
    let indexSheetCurrent = 0;
    let indexCurrent = 0;
    let dataSheetResult = [];
    let keyChildId = 0;
    let keyFieldId = 0;

    const [state, dispatch] = React.useReducer(stateReducer, initialState);

    React.useLayoutEffect(() => {
        const code = urlQuery('code');
        const callBack = urlQuery('callBack');
        let callBackName = urlQuery('callBackName');

        callBackName = decodeURI(callBackName);

        if (props.jsonData) {
            getJsonData(props.jsonData);
        }

        window.scrollTo(0, 0);

    }, [props.jsonData]);

    React.useEffect(() => {
        if (state.dataSheet && state.dataSheet.length) {
            const fileImport = {
                name: state.name,
                dataSheet: state.dataSheet,
            }
            console.log('🚀 ~ file: index.tsx ~ line 153 ~ dataSheet', state.dataSheet);
            props.handleImportData(fileImport, state.dataSheet[0])
        }

    }, [state.dataSheet])

    const testAlert = () => {
        alert("123")
    }

    const getJsonData = (code: any) => {
        let jsonData = props.jsonData;

        if (IsNullOrEmpty(jsonData.jsonSheet) || jsonData.jsonSheet.length <= 0) {
            jsonData.jsonSheet = [];
            jsonData.jsonSheet.push(jsonData)
        }

        dispatch({
            type: "INIT_DATA_IMPORT",
            payload: {
                fieldData: jsonData.jsonSheet[0].data,
                jsonSheet: jsonData.jsonSheet,
                header: jsonData.header,
                description: jsonData.description,
                apiURL: jsonData.apiURL,
                apiKey: jsonData.apiKey,
                templateFileName: jsonData.templateFileName,
                isNotCheckTemplate: jsonData.isNotCheckTemplate == null ? false : jsonData.isNotCheckTemplate,
            }
        })
    }

    const checkFileImportFail = () => {
        if (props.isImportFailure)
            props.isImportFailure(true);

        dispatch({
            type: "SET_DATA_FILE",
            payload: {
                active: false,
                name: null,
                size: 0,
            }
        })

        HrvComponents.Notification.error({
            message: "File không đúng mẫu định dạng cho phép. Vui lòng kiểm tra lại!",
        })
    }

    const checkFileNotContainSheet = (jsonData, data) => {
        const cols = data[0];
        const jsonDataLen = jsonData.length;

        if (cols.length !== jsonDataLen) {
            return true;
        }

        for (let i = 0; i < jsonDataLen; i++) {
            if (jsonData[i].isShow == false) {
                continue;
            }
            const fieldName = jsonData[i].name;
            const colName = jsonData[i].colName;
            const findFieldName = cols.find(a => fieldName === a.trim() || removeAccents(colName.trim()) === removeAccents(a.trim()))
            if (!findFieldName) return true;
            else if (jsonData[i].childField) {
                const lengthChild = jsonData[i].childField.length;
                const fieldColName = jsonData[i].colName;
                const convertColName = removeAccents(fieldColName.trim());
                const findIndex = cols.findIndex(a => convertColName == removeAccents(a.trim()))
                const childFieldColName = cols.filter(a => convertColName == removeAccents(a.trim()))
                const getAllColNameChild = cols.filter((a, index) => index > findIndex && jsonData[i].childField.find(x => removeAccents(x.colName.trim()) == removeAccents(a.trim())))

                if ((lengthChild * childFieldColName.length) != getAllColNameChild.length)
                    return true;
            }
        }

        return false;
    }

    const getMapName = (name, dataJson) => {
        if (!dataJson) return '';
        const findNameFiled = dataJson.find(a => (!keyFieldId || a.keyId != keyFieldId) && (a.name == name || removeAccents(a.colName.trim()) == name));
        if (findNameFiled) {
            if (findNameFiled.keyId)
                keyFieldId = findNameFiled.keyId;
            return findNameFiled.name;
        }
        else {
            const findChildField = dataJson.find(a => a.childField);
            if (findChildField) {
                let childField = findChildField.childField;
                const findNameChild = childField.find(a => (!keyChildId || a.keyId != keyChildId) && (a.name == name || removeAccents(a.colName.trim()) == name));
                if (findNameChild) {
                    if (findNameChild.keyId)
                        keyChildId = findNameChild.keyId;
                    return findNameChild.name;
                }
            }
        }
        return "";
    }

    const setStateHeaderTitle = (dataJson, data, cols) => {
        let titleSheet = state.titleSheet;
        let dataSheet = [];
        let title = [];
        let check = true;
        let errorMsg = state.errorMsg;
        let header = data[0].map((a, index) => {
            let name = removeAccents(a.trim());
            title.push(name);
            return a = {
                name: a,
                mapName: getMapName(name, dataJson),

            };
        });
        if (check) {
            titleSheet.push(header);
            for (let y = 1; y < data.length; y++) {
                for (let i = 0; i < dataJson.length; i++) {
                    if (dataJson[i]["Field"].isDate == true) {
                        data[y][i] = partSpecificToDate2(data[y][i], dataJson[i]["Field"].formatExport);
                    }
                }
            }
            dataSheet.push(data);
            totalPost += data.length - 1;

            dispatch({
                type: "SET_DATA_SHEET",
                payload: {
                    data: dataSheet[0],
                    cols: cols,
                    title: titleSheet[0],
                    titleSheet: titleSheet,
                    dataSheet: dataSheet,
                }
            })
        }
        else {
            return;
        }
    }

    const handleExportTemplate = async () => {
        let jsonSheet = state.jsonSheet;
        const wb = XLSX.utils.book_new();

        for (let i = 0; i < jsonSheet.length; i++) {
            let merges = [];
            let widthHeight = [];
            let header = null;
            if (IsNullOrEmpty(jsonSheet[i].apiURL)) {
                let data = [];
                let objectdata = {};
                let dataCallAPi = [];
                for (let index = 0; index < jsonSheet[i].data.length; index++) {
                    let itemSheet = jsonSheet[i].data[index];
                    objectdata[firstLetterLower(jsonSheet[i].data[index].name)] = jsonSheet[i].data[index].Field.defaultValue;
                    if (itemSheet.data_sheet != null) {
                        if (itemSheet.data_sheet.columns != null && itemSheet.data_sheet.columns.length > 0) {
                            if (data[0] == null)
                                data[0] = {};
                            data[0][firstLetterLower(jsonSheet[i].data[index].name)] = itemSheet.data_sheet.columns;
                        }
                        else if (itemSheet.data_sheet.data_default != null && itemSheet.data_sheet.data_default.length > 0) {
                            itemSheet.data_sheet.data_default.forEach((item, inde) => {
                                inde = itemSheet.data_sheet.start_row != null ? inde + itemSheet.data_sheet.start_row : inde; //row bắt đầu
                                if (data[inde] == null)
                                    data[inde] = {};
                                data[inde][firstLetterLower(jsonSheet[i].data[index].name)] = item;
                            })

                        }
                        if (itemSheet.data_sheet.api != null) {
                            let checkdataApi = dataCallAPi.filter(item => item.api == itemSheet.data_sheet.api)[0];
                            if (checkdataApi == null) {
                                checkdataApi = await api_call_get('hr_api', itemSheet.data_sheet.api, "")
                                    .then((rsp) => {
                                        if (!rsp || rsp.error == true) {
                                            return [];
                                        }
                                        if (!rsp.error && rsp.data && rsp.data.length != null) {
                                            return rsp.data;
                                        }
                                        else if (!rsp.error && rsp.data.data) {
                                            return rsp.data.data;
                                        }
                                        else {
                                            return [];
                                        }
                                    });
                                dataCallAPi.push({ [itemSheet.data_sheet.api]: checkdataApi })
                            }
                            checkdataApi.forEach((item, inde) => {
                                inde = itemSheet.data_sheet.start_row != null ? inde + itemSheet.data_sheet.start_row : inde; //row bắt đầu
                                if (data[inde] == null)
                                    data[inde] = {};
                                data[inde][firstLetterLower(jsonSheet[i].data[index].name)] = { id: item.id, name: item.name, code: item.code };
                            })
                        }
                        if (itemSheet.Field.merges != null)
                            merges.push(itemSheet.Field.merges);
                        widthHeight.push(itemSheet.Field.widthHeight);
                        if (data[0] == null)
                            data[0] = {};
                    }
                    if (index + 1 == jsonSheet[i].data.length) {
                        data.push(objectdata)
                    }

                }

                header = getDataExport(data, jsonSheet[i].data);
            }
            else {
                header = getDataExport([], jsonSheet[i].data);
            }

            /* convert state to workbook */
            const ws = XLSX.utils.aoa_to_sheet(header);
            if (!ws['!merges']) ws['!merges'] = [];
            ws['!merges'] = merges;
            ws['!cols'] = widthHeight;
            ws['!rows'] = widthHeight;

            XLSX.utils.book_append_sheet(
                wb,
                ws,
                jsonSheet[i].sheetName
            );

        }

        XLSX.writeFile(wb, state.templateFileName + "_" + getDateShort(new Date(), "DD_MM_YYYY_HH_mm") + ".xlsx");
    }

    const handleFile = (file, rejectedFiles?: any) => {
        console.log('🚀 ~ file: index.tsx ~ line 403 ~ rejectedFiles', rejectedFiles);
        console.log('🚀 ~ file: index.tsx ~ line 403 ~ file', file);
        totalCurrent = 0;
        totalError = 0;
        totalPost = 0;
        dataSheetResult = [];
        isPause = false;
        indexSheetCurrent = 0;
        indexCurrent = 0;

        dispatch({
            type: "INIT_DATA_SHEET",
            payload: {},
        });

        if(rejectedFiles){
            HrvComponents.Notification.error({
                message: "File không đúng định dạng cho phép. Vui lòng kiểm tra lại. ",
            });

            return;
        }

        if (IsNullOrEmpty(file)) return;

        if (file.size > 3145728) {
            HrvComponents.Notification.error({
                message: "File vượt quá dung lượng tối đa cho phép. Vui lòng kiểm tra lại.",
            });

            return;
        }

        const extFile = file.name.split(".")[file.name.split(".").length - 1];

        if (extFile !== "xlsx" && extFile !== "xls") {
            HrvComponents.Notification.error({
                message: "File không đúng định dạng cho phép. Vui lòng kiểm tra lại. ",
            });

            return;
        }

        dispatch({
            type: "SET_DATA_FILE",
            payload: {
                active: true,
                name: file.name,
                size: file.size,
            }
        });

        const reader = new FileReader();
        const rABS = !!reader.readAsBinaryString;

        reader.onload = (e) => {
            const bstr = e.target.result;
            const wb = XLSX.read(bstr, { type: rABS ? "binary" : "array", cellDates: false, cellNF: false, cellText: false });

            wb.SheetNames.forEach((sheetName, index) => {
                const wsName = sheetName;
                const ws = wb.Sheets[wsName];

                let data = [];
                data = XLSX.utils.sheet_to_json(ws, { header: 1, dateNF: "DD/MM/YYYY", raw: true });
                const cols = make_cols(ws['!ref']);

                const isNotCheckTemplate = state.jsonSheet[index].isNotCheckTemplate;
                if (!state.jsonSheet[index]) return checkFileImportFail();

                if (!isNotCheckTemplate && checkFileNotContainSheet(state.jsonSheet[index].data, data))
                    return checkFileImportFail();
                else if (state.jsonSheet && state.jsonSheet.length) {
                    if (!IsNullOrEmpty(state.jsonSheet[index].apiURL)) {
                        data = data.filter(a => a?.length > 0);
                        setStateHeaderTitle(state.jsonSheet[index].data, data, cols);
                        dataSheetResult.push(_.cloneDeep(data));
                    }

                    if (state.jsonSheet[index]?.entityExportResult) {
                        for (let en = 0; en < state.jsonSheet[index]?.entityExportResult.length; en++) {
                            dataSheetResult[index][0].push(state.jsonSheet[index].entityExportResult[en].nameExport);
                        }

                    }
                    if (props.isImportFailure) props.isImportFailure(false)
                } else {
                    setStateHeaderTitle(_.cloneDeep(state.fieldData), data, cols);
                }
            })
        }

        if (rABS) reader.readAsBinaryString(file);
        else reader.readAsArrayBuffer(file);

    }

    const renderBody = () => {
        const { templateFileName, name, size } = state;

        return <div className="import-data-body mt-0">
            <div className="import-data-body__section">
                <div className="number">1</div>
                <div className="title">Tải về template mẫu</div>
            </div>
            <div className="import-data-body__template" onClick={() => handleExportTemplate()}>
                <div className="icon">{ISVGImportTemplate()}</div>
                <div className="info">
                    <div className="name text-ellipsis">{templateFileName || 'Du lieu template'}</div>
                    <div className="subtitle">Excel Spreadsheet</div>
                </div>
            </div>
            <div className="import-data-body__section">
                <div className="number">2</div>
                <div className="title">Tải lên file dữ liệu</div>
            </div>
            <div className="import-data-body__dropzone">
                {name ? <div className="import__file-container">
                    <div className="import__file-wrapper">
                        <div className="icon">{ISVGImportFile()}</div>
                        <div className="content">
                            <div className="file-name">{name ? name : '-'}</div>
                            <div className="file-size">{Utils.formatBytes(size)}</div>
                            <div className='import_file__btn-upload'>
                                <div>Tải lên file khác</div>
                                <input type='file' accept=".xls,.xlsx" onChange={(fileUpload) => {
                                    if (fileUpload.target?.files?.length > 0) {
                                        handleFile(fileUpload.target.files[0])
                                    }
                                }} />
                            </div>
                        </div>
                    </div>
                </div> :
                    <Dropzone
                        maxSize={30000000}
                        onDrop={(acceptedFiles, rejectedFiles) => handleFile(acceptedFiles[0], rejectedFiles[0])}
                        accept={".xls,.xlsx"}
                    >
                        {({ getRootProps, getInputProps }) => {
                            return (
                                <div className='import-data-body__dropzone-wrapper' {...getRootProps()}>
                                    <div className='import__upload-icon'>{Icon_file()}</div>
                                    <div className="import__upload-desc">Kéo thả file hoặc
                                        <span style={{ color: '#2161CC' }}> Chọn file từ máy tính</span>
                                    </div>
                                    <div className='import__upload-sub'>Kích thước tối đa 30MB</div>
                                    <input type='file' accept=".xls,.xlsx" {...getInputProps()} />
                                </div>
                            )
                        }}
                    </Dropzone>
                }
            </div>
        </div>
    }

    const exportResultImport = () => {
        let jsonSheet = state.jsonSheet;
        let dataSheet = _.cloneDeep(dataSheetResult);
        const wb = XLSX.utils.book_new();
        for (let i = 0; i < dataSheet.length; i++) {
            if (dataSheet[i].length > 0) {
                dataSheet[i][0].push('Thông báo');
            }
            const ws = XLSX.utils.aoa_to_sheet(dataSheet[i]);
            XLSX.utils.book_append_sheet(
                wb,
                XLSX.utils.aoa_to_sheet(dataSheet[i]),
                jsonSheet[i].sheetName
            );
        }

        /* generate XLSX file and send to client */
        XLSX.writeFile(wb, state.templateFileName + " Result.xlsx");
    }

    const renderBodyModal = () => {
        if (state.typeModal == 1) {
            return <div style={{ padding: '10px', paddingTop: '5px' }}>
                <span className='text-center' style={{
                    fontStyle: 'normal',
                    fontWeight: 'normal',
                    lineHeight: '14px',
                    fontSize: '12px',
                    color: '#757575',
                    display: 'inherit'
                }}>Đã thực hiện dòng </span>
                <div>
                    {/* <Line strokeColor='#00C853' className='line-progess-import' percent={(this.totalCurent) / this.totalPost * 100} /> */}
                </div>
                <div style={{ display: 'inherit', paddingTop: '14px' }}>
                    <h3 className='text-import-waiting'>Vui lòng chờ trong giây lát.</h3>
                    <h4 className='text-import-waiting' style={{ fontSize: 13 }}>Hệ thống sẽ vẫn lưu những dữ liệu đã được thực hiện kể cả khi bạn bấm dừng xử lý.</h4>
                </div>
                {/* <div className='col-auto float-right pr-0 pl-0'>
                    <HrvComponents.Button status='default' disabled={false} onClick={e => handleClickPause()}>Dừng xử lý </HrvComponents.Button>
                </div> */}
            </div>
        }
        else if (state.typeModal == 2) {
            return <div style={{ padding: '10px', paddingBottom: '0px' }}>
                <a className='d-block text-fontsize-import'>Nhập dữ liệu thành công</a>
                <a className='d-block text-fontsize-import'> Thông tin chi tiết:</a>
                <div className='d-block' style={{
                    padding: '20px', paddingTop: '10px', paddingBottom
                        : '0px'
                }}>
                    <div>
                        <div>
                            {/* <div className='d-inline-block'><Components.FontAwesome linkHref='#success' className='svg-next-icon-size-14' /></div>
                            <div style={{ lineHeight: 'none !important', paddingLeft: '17px' }} className='d-inline-block text-fontsize-import'>{this.totalCurent - this.totalError} dòng dữ liệu xử lý thành công</div> */}
                        </div>
                        <div>
                            {/* <div className='d-inline-block'><Components.FontAwesome linkHref='#error' className='svg-next-icon-size-14' /></div>
                            <div style={{ lineHeight: 'none !important', paddingLeft: '17px' }} className='d-inline-block text-fontsize-import'>{this.totalError} dòng dữ liệu xử lý thất bại</div> */}
                        </div>
                        {/* {
                            (this.totalPost - this.totalCurent) != 0 ?
                                <div>
                                    <div className='d-inline-block'><Components.FontAwesome linkHref='#waiting' className='svg-next-icon-size-14' /></div>
                                    <div style={{ lineHeight: 'none !important', paddingLeft: '17px' }} className='d-inline-block text-fontsize-import'>
                                        {this.totalPost - this.totalCurent + ' dòng dữ liệu chưa được xử lý '}
                                        <span style={{ textDecoration: 'underline', color: '#0279C7', fontWeight: 'bold' }} className='pl-2 pointer' onClick={e => this.handleClickContinue()}><ins>Tiếp tục?</ins> </span>
                                    </div>
                                </div>
                                : null
                        } */}

                        {/* } */}
                    </div>
                </div>
                <a className='d-block text-fontsize-import'>Vui lòng tải file kết quả bên dưới:</a>

            </div>
        }
    }

    const renderFooterModal = () => {
        if (state.typeModal == 1) {
            return null
        }
        else if (state.typeModal == 2) {
            return <span>
                {/* <HrvComponents.Button status='default' className='mr-3' disabled={false} onClick={e => handleCloseModal()}>Đóng</HrvComponents.Button> */}
                {/* <HrvComponents.Button status='primary' className='hrv-primary-button-ha' disabled={false} onClick={e => this.ExportResultImport()}>Tải kết quả</HrvComponents.Button> */}
            </span>
        }
    }


    return (
        <div className="import-data-container">
            {renderBody()}
            <ModalConfirm
                onEnterKeypress={state.typeModal == 1 ?
                    null
                    :
                    state.typeModal == 2 ? () => exportResultImport() : null}
                className={state.typeModal == 1 ? 'import-modal-type-1' : ''}
                isOpen={state.typeModal == 0 ? false : true}
                headerTitle={<div className='fontsize-title' style={{ textTransform: 'uppercase', paddingLeft: '10px', lineHeight: '23px', color: '#474747' }}>{state.titleModal}</div>}
                headerHasClose={false}
                popupSize={state.modalSize == 'medium' ? 'medium' : (state.modalSize == 'small' ? 'small' : 'large')}
                bodyContent={renderBodyModal()}
                footerContent={
                    renderFooterModal()
                }
            />
        </div>
    )
}

