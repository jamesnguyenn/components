import * as React from "react";
import * as HrvComponents from "@haravan/hrw-react-components";
import * as _ from "lodash";
import * as Utils from "../../../../utils/env";
import {
    Icon_save_craft,
    ISVGClose,
    ISVGLearningClassify,
    ISVGQuestionMark,
    ISVGQuestionMulti,
    ISVGQuestionTrueFalse,
} from "../../IconSVG";

import * as ApiLnD from "../../CommonHelp/ApiLnD";

import {
    EnumTypeLnDContent,
    EnumLnDExamType,
    EnumLnDExamItemType,
    EnumLnDExamQuestionType,
} from "../../CommonHelp/constants";

import "./index.css";
import { LnDContentClassify } from "../LnDContentClassify";
import { LnDExamQuestion } from "../LnDExamQuestion";
import { LnDExamBox } from "../LnDExamBox";
import * as UtilsLnD from "../../CommonHelp/UtilsLnD";
import useFixedLastItemWhenScroll from '../../../../hook/useFixedLastItemWhenScroll';

enum TypeModalDrawerExam {
    None = 0,
    Close,
    Delete,
    DeleteQuestion,
}
interface ILnDContentExamItem {
    id?: string;
    itemType?: EnumLnDExamItemType;
    name?: string;
    description?: string;
    attachment?: any;
    answer?: string;
    questionType?: EnumLnDExamQuestionType;
    listOption?: any;
    point?: number;
}

interface ILnDContentExam {
    name: string;
    description: string;
    refId?: string;
    examType?: EnumLnDExamType;
    testTime?: number;
    items?: ILnDContentExamItem[];
    setting?: any;
    isDraft?: boolean;
}

interface DrawerExamProps {
    subjectContentId?: string;
    isEdit?: boolean;
    itemEdit?: any;
    visible: boolean;
    onCloseDrawer: Function;
    onPushItemLnDContent: Function;
    isView?: boolean;
    listNameExam?: any[];
}

interface DrawerExamState {
    isLoading: boolean;
    isEdit: boolean;
    drawerDataDraft: ILnDContentExam;
    isOpenModal?: TypeModalDrawerExam;
    itemFocus?: string;
    itemEdit?: ILnDContentExamItem;
    totalScore?: number;
    itemQuestionDelete?: any;
}

const initialState: DrawerExamState = {
    isLoading: false,
    isEdit: false,
    drawerDataDraft: {
        name: "",
        description: "",
        refId: "",
        examType: EnumLnDExamType.Exam,
        testTime: 0,
        items: [],
        setting: null,
    },
    isOpenModal: TypeModalDrawerExam.None,
    itemFocus: null,
    itemEdit: null,
    totalScore: 0,
    itemQuestionDelete: null,
};

const stateReducer = (state: DrawerExamState, action: any) => {
    const { type, payload } = action;

    switch (type) {
        case "SET_IS_LOADING":
            return {
                ...state,
                isLoading: payload,
            };
        case "SET_DRAWER_DATA_DRAFT": {
            return {
                ...state,
                drawerDataDraft: _.cloneDeep(payload),
            };
        }
        case "CHANGE_DATA_DRAFF":
            return {
                ...state,
                drawerDataDraft: {
                    ...state.drawerDataDraft,
                    [payload.key]: payload.value,
                },
            };
        case "SET_ITEM_FOCUS":
            return {
                ...state,
                itemFocus: payload,
            };
        case "CHANGE_MODAL_STATE":
            return {
                ...state,
                isOpenModal: payload,
            };
        case "SET_TOTAL_SCORE":
            return {
                ...state,
                totalScore: payload,
            };
        case "SET_DELETE_QUESTION_ITEM":
            return {
                ...state,
                itemQuestionDelete: payload,
            };
        default:
            return state;
    }
};

export const DrawerExam: React.FC<DrawerExamProps> = (props) => {
    const [state, dispatch] = React.useReducer(stateReducer, initialState);
    const [timeSaveDraft, setTimeSaveDraft] = React.useState("");
    const [error, setError] = React.useState({});
    const [listNameExam, setListNameExam] = React.useState([]);
    const [isHaveSaveDraft, setIsHaveSaveDraft] = React.useState(false);
    const examRef = React.useRef<any>(null);
    const [isFixedLastItem, setIsFixedLastItem] = useFixedLastItemWhenScroll({
        idFixed: "lnd_exam_box__info-fix",
        idBaseScroll: 'lnd-learning-drawer__wrapper-outer',
        oldWidth: '100%',
        minusHeader: 144
    })

    const refs = state.drawerDataDraft.items.reduce(
        (acc: ILnDContentExamItem, value: ILnDContentExamItem) => {
            acc[value.id] = React.createRef();
            return acc;
        },
        {}
    );

    const {
        visible,
        onCloseDrawer,
        isEdit,
        itemEdit,
        onPushItemLnDContent,
        isView,
    } = props;

    const { drawerDataDraft } = state;

    React.useEffect(() => {
        if (isEdit || isView) {
            getDataSubjectExam();
        } else {
            dispatch({
                type: "SET_DRAWER_DATA_DRAFT",
                payload: {
                    ...initDraftValue,
                },
            });
        }

        setIsFixedLastItem();
    }, [visible]);

    React.useEffect(() => {
        if (isHaveSaveDraft) {
            onSaveExam(false);
        } else if (!isHaveSaveDraft) {
            handleSaveDraft();
        }
    }, [isHaveSaveDraft]);

    React.useEffect(() => {
        if (isEdit) {
            const listName = props.listNameExam
                .filter(
                    (it) =>
                        it.type === EnumTypeLnDContent.TypeExam &&
                        it.itemId !== props.itemEdit.itemId
                )
                .map((it) => it.name);

            setListNameExam(listName);
        } else {
            const listName = props.listNameExam
                .filter((it) => it.type === EnumTypeLnDContent.TypeExam)
                .map((it) => it.name);

            setListNameExam(listName);
        }
    }, []);

    const handleSaveDraft = () => {
        if (isView) return;

        setTimeout(() => {
            setIsHaveSaveDraft(true);
        }, 30000);
    };

    const getDataSubjectExam = async () => {
        dispatch({
            type: "SET_IS_LOADING",
            payload: true,
        })

        const result = await ApiLnD.getSubjectExamDetail(itemEdit.itemId);

        if (result && !result.error) {
            if (!examRef.current) examRef.current = result.data.id;

            dispatch({
                type: "SET_DRAWER_DATA_DRAFT",
                payload: {
                    ...result.data,
                },
            });

            dispatch({
                type: "SET_IS_LOADING",
                payload: false,
            });
        } else {
            dispatch({
                type: "SET_IS_LOADING",
                payload: false,
            });
            HrvComponents.Notification.error({
                message: "Có lỗi xảy ra. Vui lòng thử lại",
            });
        }
    };

    const onDeleteExam = async () => {
        const id = examRef.current;

        if (!id) {
            onCloseDrawer();
            return;
        }

        const result = await ApiLnD.deleteSubjectExam(id);

        if (result && !result.error) {
            onPushItemLnDContent({ itemId: id }, true);
            onCloseDrawer();
        } else {
            Notification["error"]({
                message: `${result.message ? result.message : "Có lỗi xảy ra. Vui lòng thử lại"
                }`,
            });
            return;
        }
    };

    const checkHaveDataDraft = () => {
        let isHaveData = false;

        if (!_.isEqual(state.drawerDataDraft, initialState.drawerDataDraft)) {
            isHaveData = true;
        }

        return isHaveData;
    };

    const handleOutFocusField = (key: string, value: any) => {
        switch (key) {
            case "name":
                if (!value) setError({ ...error, name: "Vui lòng nhập tên bài thi" });
                else {
                    const valueQuery = value.replace(/\s/g, "");
                    const isExist = listNameExam.findIndex(
                        (item) => item.replace(/\s/g, "") === valueQuery
                    );

                    if (isExist !== -1) {
                        setError({
                            ...error,
                            name: "Tên bài thi đã được sử dụng",
                        });
                    } else {
                        setError({ ...error, name: "" });
                    }
                }
                break;
            case "testTime":
                if (!value) {
                    setError({
                        ...error,
                        testTime: "Vui lòng nhập thời gian làm bài thi",
                    });
                } else {
                    if (+value <= 0)
                        setError({
                            ...error,
                            testTime: "Thời gian làm bài thi phải lớn hơn 0",
                        });
                    else if (+value >= 1000)
                        setError({
                            ...error,
                            testTime: " Thời gian làm bài thi phải nhỏ hơn 1000",
                        });
                    else setError({ ...error, testTime: "" });
                }
                break;
            default:
                break;
        }
    };

    const onChangeDataLine = (
        key: string,
        data: any,
        it: ILnDContentExamItem
    ) => {
        const { drawerDataDraft } = state;

        let itemsClone = [...drawerDataDraft.items];
        let indexItemChange = itemsClone.findIndex((item) => item.id === it.id);

        switch (key) {
            default:
                if (indexItemChange > -1) {
                    itemsClone[indexItemChange][key] = data;
                }

                dispatch({
                    type: "CHANGE_DATA_DRAFF",
                    payload: {
                        key: "items",
                        value: [...itemsClone],
                    },
                });
        }
    };

    const onDragEnd = (items: ILnDContentExamItem[], result: any) => {
        const { source, destination } = result;

        if (
            !destination ||
            (destination.index === source.index &&
                destination.draggableId === source.draggableId)
        ) {
            return;
        }

        let itemSource = items[source.index];
        items.splice(source.index, 1);
        items.splice(destination.index, 0, itemSource);

        dispatch({
            type: "CHANGE_DATA_DRAFF",
            payload: {
                key: "items",
                value: [...items],
            },
        });
    };

    const onAddItem = (
        type: EnumLnDExamItemType,
        indexItem: number,
        listData: ILnDContentExamItem[],
        questionType = EnumLnDExamQuestionType.MultiChoice
    ) => {
        let indexQuestion = 0;
        if (type === EnumLnDExamItemType.Question) {
            indexQuestion =
                listData && listData.length
                    ? listData.filter(
                        (it) => it.itemType === EnumLnDExamItemType.Question
                    ).length
                    : 0;
        }

        let newItem = UtilsLnD.initQuestionExam(type, questionType, indexQuestion);

        listData.splice(indexItem + 1, 0, newItem);

        dispatch({
            type: "CHANGE_DATA_DRAFF",
            payload: {
                key: "items",
                value: [...listData],
            },
        });

        dispatch({ type: "SET_ITEM_FOCUS", payload: newItem.id });
    };

    const onCloneItem = (
        item: ILnDContentExamItem,
        listData: ILnDContentExamItem[]
    ) => {
        let newItem = {} as ILnDContentExamItem;
        let indexItem = listData.findIndex((it) => it.id === item.id);

        if (item.itemType === EnumLnDExamItemType.Segment) {
            newItem = {
                ...item,
                id: Utils.getNewGuid(),
            };
        } else {
            //clone list Option
            let listOptionClone = item.listOption.map((item) => {
                return {
                    ...item,
                    id: Utils.getNewGuid(),
                };
            });

            //clone answer
            let answerItem = item.listOption.find((it) => it.id === item.answer);
            let answerClone = answerItem
                ? listOptionClone.find((it) => it.name === answerItem.name)
                : "";

            newItem = {
                ...item,
                id: Utils.getNewGuid(),
                listOption: [...listOptionClone],
                answer: answerClone ? answerClone.id : "",
            };
        }

        listData.splice(indexItem + 1, 0, newItem);

        dispatch({
            type: "CHANGE_DATA_DRAFF",
            payload: {
                key: "items",
                value: [...listData],
            },
        });

        dispatch({ type: "SET_ITEM_FOCUS", payload: newItem.id });
    };

    const handleDeleteQuestion = (item: any) => {
        dispatch({
            type: "SET_DELETE_QUESTION_ITEM",
            payload: item,
        });

        if (item.itemType === EnumLnDExamItemType.Segment) {
            onDeleteItem();

            return;
        }

        dispatch({
            type: "CHANGE_MODAL_STATE",
            payload: TypeModalDrawerExam.DeleteQuestion,
        });
    };

    const onDeleteItem = () => {
        const listData = [...state.drawerDataDraft?.items];
        const item = state.itemQuestionDelete;

        let indexItem = listData.findIndex((it) => it.id === item.id);

        listData.splice(indexItem, 1);

        dispatch({
            type: "CHANGE_DATA_DRAFF",
            payload: {
                key: "items",
                value: [...listData],
            },
        });

        dispatch({ type: "SET_ITEM_FOCUS", payload: "" });
        dispatch({
            type: "CHANGE_MODAL_STATE",
            payload: TypeModalDrawerExam.None,
        });
    };

    const onAddLnDContentExamItem = (
        listItemData: ILnDContentExamItem[],
        type: EnumLnDExamItemType,
        questionType?: EnumLnDExamQuestionType
    ) => {
        let indexItem =
            listItemData && listItemData.length ? listItemData.length - 1 : -1;

        onAddItem(type, indexItem, listItemData, questionType);
    };

    const handleCloseDrawer = () => {
        if (isView) {
            onCloseDrawer();
            return;
        }

        const isHaveDataDraft = checkHaveDataDraft();

        if (isHaveDataDraft) {
            //render Modal
            dispatch({
                type: "CHANGE_MODAL_STATE",
                payload: TypeModalDrawerExam.Close,
            });
        } else {
            onCloseDrawer();
        }
    };

    const checkDisableSaveExam = () => {
        const { drawerDataDraft } = state;
        const { name, testTime, items } = drawerDataDraft;

        const testCheck = UtilsLnD.checkValidExamContent(drawerDataDraft);

        let isDisable = false;

        if (!name || !testTime || !items || !items.length) {
            return true;
        }

        Object.keys(error).forEach((item) => {
            if (error[item]) {
                isDisable = true;
                return;
            }
        });

        //check item question itemType EnumLnDExamItemType Segments
        const listQuestions = [],
            listSegments = [];

        let totalScore = 0;

        items.forEach((item: any) => {
            if (item.itemType === EnumLnDExamItemType.Question) {
                listQuestions.push(item);
                totalScore += Number(item.point);
            } else listSegments.push(item);
        });

        if (!listQuestions.length || totalScore !== 100) {
            return true;
        }

        //check list Question
        listSegments.forEach((item: any) => {
            if (!item.name) {
                isDisable = true;
                return;
            }
        });

        listQuestions.forEach((item: any) => {
            if (!item.name || !item.answer || item.point === null) {
                isDisable = true;
                return;
            }

            const listNameOption = new Set();

            item.listOption.forEach((option) => {
                if (!option.name) {
                    isDisable = true;
                    return;
                } else {
                    listNameOption.add(option.name.replace(/\s/g, ""));
                }
            });

            if (item.listOption.length !== listNameOption.size) {
                isDisable = true;
            }
        });

        return isDisable;
    };

    const handleSetError = (key: string, value: string) => {
        setError({ ...error, [key]: value });
    };

    const onSaveDraftExam = async (callBack?: Function) => {
        await onSaveExam(false);

        if (callBack) callBack();
    };

    const onSaveExam = async (isCloseDrawer: boolean = true) => {
        const { drawerDataDraft } = state;
        const isValidItem = !checkDisableSaveExam();

        const body = {
            subjectContentId: props.subjectContentId,
            ...drawerDataDraft,
        };

        if (isEdit || examRef.current) {
            const result = await ApiLnD.putSubjectExam({
                ...body,
                id: examRef.current,
            });

            if (result && !result.error) {
                onPushItemLnDContent({
                    itemId: examRef.current,
                    name: body.name,
                    description: body.description,
                    type: EnumTypeLnDContent.TypeExam,
                    isValidItem,
                });

                if (isCloseDrawer) {
                    onCloseDrawer();
                } else {
                    setTimeSaveDraft(Utils.getDateShort(new Date(), "HH:mm:ss"));
                    setIsHaveSaveDraft(false);
                    return;
                }
            } else {
                Notification["error"]({
                    message: `${result.message ? result.message : "Có lỗi xảy ra. Vui lòng thử lại"
                    }`,
                });
                setIsHaveSaveDraft(false);
                return;
            }
        } else {
            const result = await ApiLnD.postSubjectExam(body);

            if (result && !result.error) {
                const { data } = result;

                examRef.current = data.id;

                let itemSubjectContent = null;

                itemSubjectContent = {
                    itemId: data.id,
                    name: data.name,
                    description: data.description,
                    type: EnumTypeLnDContent.TypeExam,
                    isValidItem,
                };

                onPushItemLnDContent(itemSubjectContent);

                if (isCloseDrawer) onCloseDrawer();
                else {
                    setTimeSaveDraft(Utils.getDateShort(new Date(), "HH:mm:ss"));
                    setIsHaveSaveDraft(false);
                    return;
                }
            } else {
                Notification["error"]({
                    message: `${result.message ? result.message : "Có lỗi xảy ra. Vui lòng thử lại"
                    }`,
                });
                setIsHaveSaveDraft(false);
                return;
            }
        }
    };

    const onScrollToItem = (id) => {
        refs[id].current.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    };

    /* Render UI here */
    const renderLnDContentExamItem = (
        index: number,
        isEdit: boolean,
        item: ILnDContentExamItem,
        listData: ILnDContentExamItem[],
        provided: any,
        className?: string,
        typeContent?: EnumLnDExamItemType
    ) => {
        let clsName = "";
        const listQuestion = listData.filter(
            (item) => item.itemType === EnumLnDExamItemType.Question
        );
        const indexItem = listQuestion.findIndex((it) => it.id === item.id);

        switch (typeContent) {
            case EnumLnDExamItemType.Segment:
                clsName = isEdit
                    ? "lnd-content-item__classify-item is-Edit"
                    : "lnd-content-item__classify-item is-View";

                return (
                    <LnDContentClassify
                        className={clsName}
                        key={item.id}
                        isEdit={isEdit}
                        item={item}
                        provided={provided}
                        typeContent={0}
                        onChangeData={(key: string, data: any) =>
                            onChangeDataLine(key, data, item)
                        }
                        onAddItem={(type: EnumLnDExamItemType) =>
                            onAddItem(type, index, listData)
                        }
                        onCloneItem={() => onCloneItem(item, listData)}
                        onRemoveItem={() => handleDeleteQuestion(item)}
                        onChangeView={() =>
                            dispatch({ type: "SET_ITEM_FOCUS", payload: item.id })
                        }
                        // onClickOutside={() => {
                        //   dispatch({ type: "SET_ITEM_FOCUS", payload: "" });
                        // }}
                        isView={isView}
                    />
                );
            case EnumLnDExamItemType.Question:
                clsName = isEdit
                    ? "lnd-exam-content-item is-Edit"
                    : "lnd-exam-content-item is-View";

                return (
                    <LnDExamQuestion
                        indexItem={indexItem}
                        className={clsName}
                        key={index}
                        isEdit={isEdit}
                        isView={isView}
                        item={item}
                        provided={provided}
                        typeContent={EnumLnDExamType.Exam}
                        onChangeData={(key: string, data: any) =>
                            onChangeDataLine(key, data, item)
                        }
                        onAddItem={(type: EnumLnDExamItemType) =>
                            onAddItem(item.itemType, index, listData)
                        }
                        onCloneItem={() => onCloneItem(item, listData)}
                        onRemoveItem={() => handleDeleteQuestion(item)}
                        onChangeView={() =>
                            dispatch({ type: "SET_ITEM_FOCUS", payload: item.id })
                        }
                        // onClickOutside={() => {
                        //   dispatch({ type: "SET_ITEM_FOCUS", payload: "" });
                        // }}
                        typeQuestion={item.questionType}
                        handleError={handleSetError}
                    />
                );
            //Check type question
            default:
                return null;
        }
    };

    const renderLnDContentExamList = () => {
        const { itemFocus, drawerDataDraft } = state;
        const { items } = drawerDataDraft;

        return (
            <HrvComponents.DragDropContext
                onDragEnd={(result) => onDragEnd(items, result)}
            >
                <div className="lnd-content-list__droppable">
                    <HrvComponents.Droppable droppableId="droppable">
                        {(items || []).map((it, index) => {
                            return (
                                <HrvComponents.Draggable
                                    key={index}
                                    draggableId={it.id}
                                    index={index}
                                    isCustomDragHandle={true}
                                >
                                    <HrvComponents.UseConsumer>
                                        {({ provided, snapshot }: HrvComponents.IValueProvider) => {
                                            let isEdit = itemFocus === it.id;
                                            let clsName = isEdit
                                                ? "lnd-exam-item is-Edit"
                                                : "lnd-exam-item is-View";

                                            return (
                                                <React.Fragment>
                                                    <div id={it.id} ref={refs[it.id]}>
                                                        {renderLnDContentExamItem(
                                                            index,
                                                            isEdit,
                                                            it,
                                                            items,
                                                            provided,
                                                            clsName,
                                                            it.itemType
                                                        )}
                                                    </div>
                                                </React.Fragment>
                                            );
                                        }}
                                    </HrvComponents.UseConsumer>
                                </HrvComponents.Draggable>
                            );
                        })}
                    </HrvComponents.Droppable>
                </div>
            </HrvComponents.DragDropContext>
        );
    };

    const renderHeaderModal = (type: TypeModalDrawerExam) => {
        switch (type) {
            case TypeModalDrawerExam.Delete:
            case TypeModalDrawerExam.DeleteQuestion:
                return <div>Xác nhận xóa</div>;
            case TypeModalDrawerExam.Close:
                return <div>Xác nhận hủy</div>;
            default:
                return null;
        }
    };

    const renderBodyModal = (type: TypeModalDrawerExam) => {
        switch (type) {
            case TypeModalDrawerExam.Delete:
                return <div>Bạn có muốn xóa bài thi này?</div>;
            case TypeModalDrawerExam.DeleteQuestion:
                return <div>Bạn có muốn xóa câu hỏi này?</div>;
            case TypeModalDrawerExam.Close:
                return (
                    <div className="lnd-modal-goBack__text-title">
                        Nếu bạn thoát bây giờ, hệ thống sẽ xóa các dữ liệu đã nhập của bài
                        thi. Bạn có chắc chắn muốn hủy không?
                    </div>
                );
            default:
                return null;
        }
    };

    const renderFooterModal = (type: TypeModalDrawerExam) => {
        switch (type) {
            case TypeModalDrawerExam.Close:
                return (
                    <React.Fragment>
            <span>
              <HrvComponents.Button
                  status="link"
                  onClick={() =>
                      dispatch({
                          type: "CHANGE_MODAL_STATE",
                          payload: TypeModalDrawerExam.None,
                      })
                  }
              >
                <span style={{ color: "#021337" }}>Đóng</span>
              </HrvComponents.Button>
              <HrvComponents.Button
                  status="danger"
                  onClick={() => onCloseDrawer()}
              >
                Đồng ý
              </HrvComponents.Button>
            </span>
                    </React.Fragment>
                );
            case TypeModalDrawerExam.Delete:
                return (
                    <React.Fragment>
            <span>
              <HrvComponents.Button
                  status="link"
                  onClick={() =>
                      dispatch({
                          type: "CHANGE_MODAL_STATE",
                          payload: TypeModalDrawerExam.None,
                      })
                  }
              >
                <span style={{ color: "#021337" }}>Đóng</span>
              </HrvComponents.Button>
              <HrvComponents.Button
                  status="danger"
                  onClick={() => onDeleteExam()}
              >
                Đồng ý
              </HrvComponents.Button>
            </span>
                    </React.Fragment>
                );
            case TypeModalDrawerExam.DeleteQuestion:
                return (
                    <React.Fragment>
            <span>
              <HrvComponents.Button
                  status="link"
                  onClick={() =>
                      dispatch({
                          type: "CHANGE_MODAL_STATE",
                          payload: TypeModalDrawerExam.None,
                      })
                  }
              >
                <span style={{ color: "#021337" }}>Đóng</span>
              </HrvComponents.Button>
              <HrvComponents.Button
                  status="danger"
                  onClick={() => onDeleteItem()}
              >
                Đồng ý
              </HrvComponents.Button>
            </span>
                    </React.Fragment>
                );
            default:
                return null;
        }
    };

    const renderModal = () => {
        return (
            <HrvComponents.Modal
                size="sm"
                isOpen={state.isOpenModal !== TypeModalDrawerExam.None}
                isBtnClose={false}
                headerContent={renderHeaderModal(state.isOpenModal)}
                bodyContent={renderBodyModal(state.isOpenModal)}
                footerContent={renderFooterModal(state.isOpenModal)}
                footerDisabledCloseModal
                afterCloseModal={() =>
                    dispatch({
                        type: "CHANGE_MODAL_STATE",
                        payload: TypeModalDrawerExam.None,
                    })
                }
            />
        );
    };

    const renderBodyExamContent = () => {
        return (
            <React.Fragment>
                <div className="lnd-exam__title">Nội dung thi</div>
                {/* render list content exam */}
                {drawerDataDraft &&
                drawerDataDraft.items &&
                drawerDataDraft.items.length
                    ? renderLnDContentExamList()
                    : null}

                {/* render button action add content exam */}
                {!isView && (
                    <div className="lnd-exam-content__action">
                        <div
                            className="lnd-exam-content__action-item mr-3"
                            onClick={() =>
                                onAddLnDContentExamItem(
                                    drawerDataDraft.items,
                                    EnumLnDExamItemType.Segment
                                )
                            }
                        >
                            <div className="icon mr-2">{ISVGLearningClassify()}</div>
                            <div className="text">Thêm phân đoạn</div>
                        </div>
                        <HrvComponents.Popover
                            key={Utils.getNewGuid()}
                            trigger='hover'
                            content={
                                <div className="lnd-content-lesson_exam-popover">
                                    <div
                                        className="lesson_exam-popover__item"
                                        onMouseDown={() =>
                                            onAddLnDContentExamItem(
                                                drawerDataDraft.items,
                                                EnumLnDExamItemType.Question,
                                                EnumLnDExamQuestionType.MultiChoice
                                            )
                                        }
                                    >
                                        <div className="icon">{ISVGQuestionMulti()}</div>
                                        <div className="text">Trắc nghiệm</div>
                                    </div>
                                    <div
                                        className="lesson_exam-popover__item"
                                        onMouseDown={() =>
                                            onAddLnDContentExamItem(
                                                drawerDataDraft.items,
                                                EnumLnDExamItemType.Question,
                                                EnumLnDExamQuestionType.TrueFalse
                                            )
                                        }
                                    >
                                        <div className="icon">{ISVGQuestionTrueFalse()}</div>
                                        <div className="text">Đúng/Sai</div>
                                    </div>
                                </div>
                            }
                            placement="bottom"
                        >
                            <div className="lnd-exam-content__action-item">
                                <div className="icon mr-2">{ISVGQuestionMark()}</div>
                                <div className="text">Thêm câu hỏi</div>
                            </div>
                        </HrvComponents.Popover>
                    </div>
                )}
            </React.Fragment>
        );
    };

    const renderExamConfig = () => {
        return (
            <React.Fragment>
                <div className="lnd-exam__title">Cấu hình bài thi</div>
                {/* render body config */}
                <div className="lnd-exam-config__body">
                    <div className="lnd-exam-config__body_text">
                        Thời gian làm bài thi
                    </div>
                    <div
                        className={`lnd-exam-config__body_time ${error["testTime"] ? "error" : ""
                        } ${isView ? "disable" : ""}`}
                    >
                        <input
                            placeholder="Thời gian làm bài thi"
                            type="text"
                            value={drawerDataDraft.testTime || ""}
                            onChange={(e: any) => {
                                handleOutFocusField("testTime", e.target.value);
                                dispatch({
                                    type: "CHANGE_DATA_DRAFF",
                                    payload: {
                                        key: "testTime",
                                        value: +e.target.value,
                                    },
                                });
                            }}
                            className=""
                            maxLength={10}
                            // maxLength={maxLength ? maxLength : null}
                            // onFocus={() => setIsFocus(true)}
                            onBlur={(e: any) =>
                                handleOutFocusField("testTime", e.target.value)
                            }
                            disabled={isView || false}
                        />
                        <span>phút</span>
                    </div>
                    {error["testTime"] ? (
                        <div className="input-validate-error-field">
                            {error["testTime"]}
                        </div>
                    ) : (
                        <></>
                    )}
                </div>
            </React.Fragment>
        );
    };

    const renderDrawerBody = () => {
        const { drawerDataDraft } = state;

        return (
            <div className="lnd-learning-drawer__body__wrapper">
                <div className="lnd-learning-drawer__body__general">
                    <div className="lnd-learning-drawer__general-name">
                        <input
                            placeholder="Tên bài thi"
                            value={drawerDataDraft.name}
                            type="text"
                            onChange={(e: any) => {
                                if (e.target.value) setError({ ...error, name: "" });
                                dispatch({
                                    type: "CHANGE_DATA_DRAFF",
                                    payload: {
                                        key: "name",
                                        value: e.target.value,
                                    },
                                });
                            }}
                            className={`lnd-content-item__input-name ${error["name"] ? "error" : ""
                            }`}
                            maxLength={200}
                            autoFocus
                            onBlur={(e) => handleOutFocusField("name", e.target.value)}
                            // maxLength={maxLength ? maxLength : null}
                            // onFocus={() => setIsFocus(true)}
                            // onBlur={() => setIsFocus(false)}
                            disabled={isView || false}
                        />
                        {error["name"] && (
                            <div className="input-validate-error-field">{error["name"]}</div>
                        )}
                        {error["name"] === "Vui lòng nhập tên bài thi" && (
                            <span
                                className="span-validate-empty-field"
                                style={{ left: "10.5%" }}
                            >
                *
              </span>
                        )}
                    </div>
                    {!(isView && drawerDataDraft.description.length === 0) && (
                        <div className="lnd-learning-drawer__general-desc">
                            <input
                                placeholder="Mô tả ngắn (không quá 200 ký tự)"
                                value={drawerDataDraft.description}
                                type="text"
                                onChange={(e: any) =>
                                    dispatch({
                                        type: "CHANGE_DATA_DRAFF",
                                        payload: {
                                            key: "description",
                                            value: e.target.value,
                                        },
                                    })
                                }
                                className="lnd-content-item__input-description"
                                maxLength={200}
                                disabled={isView || false}
                                // maxLength={maxLength ? maxLength : null}
                                // onFocus={() => setIsFocus(true)}
                                // onBlur={() => setIsFocus(false)}
                            />
                        </div>
                    )}
                </div>
                <div className="lnd-exam-drawer__body__content">
                    {renderBodyExamContent()}
                </div>
                <div className="lnd-learning-drawer-body__exam">
                    {renderExamConfig()}
                </div>
            </div>
        );
    };

    const renderExamBoxInfo = () => {
        const { drawerDataDraft, itemFocus } = state;
        let totalQuestion = 0;
        let totalScore = 0;

        drawerDataDraft.items.forEach((item) => {
            if (item.itemType === EnumLnDExamItemType.Question) {
                totalQuestion++;
                item.point ? (totalScore += Number(item.point)) : null;
            }
        });

        return (
            <LnDExamBox
                totalQuestion={totalQuestion}
                totalScore={totalScore}
                listData={drawerDataDraft.items}
                isView={isView}
                onScrollToItem={onScrollToItem}
                itemFocus={itemFocus}
            />
        );
    };

    const renderDrawerContent = () => {
        // console.log("render Drawer content");
        const title =
            isEdit && !isView
                ? "Chỉnh sửa bài thi"
                : isView
                    ? "Xem bài thi"
                    : "Tạo bài thi";

        if (state.isLoading) {
            return <div className="lnd-learning-drawer__wrapper">
                {renderLoading()}
            </div>
        }

        return (
            <div className="lnd-learning-drawer__wrapper">
                {/* Header */}
                <div className="lnd-learning-drawer__header">
                    <div
                        className="lnd-learning-drawer__header-delete"
                        onClick={() => onSaveDraftExam(onCloseDrawer)}
                    >
                        {ISVGClose(20)}
                    </div>
                    <div className="lnd-learning-drawer__header-title">{title}</div>
                </div>
                {/* Body */}
                <div className="lnd-learning-drawer__body">
                    <div className="lnd-learning-drawer__wrapper-content">
                        <div className="lnd-learning-drawer__wrapper-outer" id={'lnd-learning-drawer__wrapper-outer'}>
                            {renderDrawerBody()}
                        </div>
                        <div className="lnd_exam_box__info">
                            <div className="lnd_exam_box__info-fix" id={'lnd_exam_box__info-fix'}>
                                {renderExamBoxInfo()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                {!isView && (
                    <div className="lnd-learning-drawer__footer">
                        <div className="lnd-learning-drawer__footer-content-exam">
                            <div className="left d-flex align-items-center">
                                {isEdit ? (
                                    <HrvComponents.Button
                                        disabled={false}
                                        status="link"
                                        onClick={() =>
                                            dispatch({
                                                type: "CHANGE_MODAL_STATE",
                                                payload: TypeModalDrawerExam.Delete,
                                            })
                                        }
                                        size={"medium"}
                                        className="lnd-btn__secondary mr-3"
                                    >
                    <span
                        className="text__btn m-0"
                        style={{ color: "#CA4E4A" }}
                    >
                      Xóa
                    </span>
                                    </HrvComponents.Button>
                                ) : (
                                    <HrvComponents.Button
                                        disabled={false}
                                        status="link"
                                        onClick={() => handleCloseDrawer()}
                                        size={"medium"}
                                        className="lnd-btn__secondary mr-3"
                                    >
                                        <span className="text__btn m-0">Hủy</span>
                                    </HrvComponents.Button>
                                )}
                                <HrvComponents.Button
                                    status="default"
                                    onClick={() => onSaveDraftExam()}
                                    size={"medium"}
                                    className="ml-2"
                                >
                                    <Icon_save_craft />
                                    <span className="text__btn">Lưu nháp</span>
                                </HrvComponents.Button>
                                {timeSaveDraft && (
                                    <span className="text__noti__save__craft">{`Đã lưu nháp thành công vào lúc ${timeSaveDraft}`}</span>
                                )}
                            </div>

                            <HrvComponents.Button
                                loading={false}
                                disabled={checkDisableSaveExam()}
                                status="primary"
                                onClick={() => {
                                    onSaveExam();
                                }}
                                size={"medium"}
                                className=""
                            >
                <span className="text__btn m-0">
                  {isEdit ? "Cập nhật bài thi" : "Tạo bài thi"}
                </span>
                            </HrvComponents.Button>
                        </div>
                    </div>
                )}
                {/* Box Info */}
            </div>
        );
    };

    const renderLoading = () => {
        return (
            <div
                className="d-flex align-items-center justify-content-center w-100"
                style={{ height: "calc(100vh - 60px)" }}
            >
                <HrvComponents.Loading size="thumb" />
            </div>
        );
    };

    return (
        <React.Fragment>
            <HrvComponents.Drawer
                placement="right"
                closable={false}
                visible={visible}
                width={"100vw"}
                className="new-learning-content__drawer"
            >
                <React.Fragment>{renderDrawerContent()}</React.Fragment>
            </HrvComponents.Drawer>
            {renderModal()}
        </React.Fragment>
    );
};

const initDraftValue = {
    name: "",
    description: "",
    refId: "",
    examType: EnumLnDExamType.Exam,
    testTime: 0,
    items: [],
    setting: null,
};
