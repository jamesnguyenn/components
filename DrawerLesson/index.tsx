import * as React from "react";
import * as HrvComponents from "@haravan/hrw-react-components";
import * as _ from "lodash";
import * as Utils from "../../../../utils/env";
import { ContentEditor, CustomSelect } from "../../../../components";
import {
  Icon_save_craft,
  ISVGClose,
  ISVGQuestionMark,
  ISVGQuestionMulti,
  ISVGQuestionTrueFalse,
} from "../../IconSVG";
import {
  ConfigEditorLnD,
  EnumContentLesson,
  EnumTypeLnDContent,
  listTypeContentLesson,
  EnumLnDExamItemType,
  EnumLnDExamQuestionType,
  EnumLnDExamViewAnswerType,
  EnumLnDExamSettingPassType,
  EnumLnDExamType,
} from "../../CommonHelp/constants";
import "./index.css";
import { ListFileUpload } from "../ListFileUpload";
import { LnDExamQuestion } from "../LnDExamQuestion";
import * as ApiLnD from "../../CommonHelp/ApiLnD";
import * as UtilsLnD from "../../CommonHelp/UtilsLnD";

enum TypeModalDrawerLesson {
  None = 0,
  ChangeTypeContent = 1,
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

interface ILnDContentLesson {
  id?: string;
  name: string;
  description: string;
  contentType: EnumContentLesson;
  attachment: {
    ext: string;
    id: number;
    name: string;
    orgId: number;
    size: string;
    url: string;
    type?: any;
  };
  content?: string;
}

interface DrawerLessonProps {
  subjectContentId?: string;
  isEdit?: boolean;
  isView?: boolean;
  itemEdit?: any;
  visible: boolean;
  onCloseDrawer: Function;
  onPushItemLnDContent: Function;
}

interface DrawerLessonState {
  isLoading: boolean;
  isEdit: boolean;
  drawerDataDraft: ILnDContentLesson;
  draftExamLesson?: ILnDContentExam;
  itemExamFocus?: string;
  isOpenModal?: TypeModalDrawerLesson;
  typeContentActive?: EnumContentLesson;
  typeContentChange?: EnumContentLesson;
  itemQuestionDelete?: any;
}

const initialState: DrawerLessonState = {
  isLoading: false,
  isEdit: false,
  isOpenModal: TypeModalDrawerLesson.None,
  drawerDataDraft: {
    name: "",
    description: "",
    contentType: EnumContentLesson.Video,
    attachment: null,
    content: "",
  },
  draftExamLesson: {
    name: "",
    description: "",
    refId: "",
    examType: EnumLnDExamType.TestInLesson,
    testTime: null,
    items: [],
    setting: {
      checkPass: EnumLnDExamSettingPassType.AllQuestion,
      lockTime: 5,
      viewAnswer: EnumLnDExamViewAnswerType.OnlyCountResult,
      questionsToPass: 0,
    },
  },
  itemExamFocus: "",
  typeContentActive: EnumContentLesson.Video,
  typeContentChange: null,
  itemQuestionDelete: null,
};

const stateReducer = (state: DrawerLessonState, action: any) => {
  const { type, payload } = action;

  switch (type) {
    case "SET_DATA_SAVE_DRAFT_LESSON":
      return {
        ...state,
        drawerDataDraft: _.cloneDeep(payload),
      };
    case "SET_DATA_SAVE_DRAFT_EXAM":
      return {
        ...state,
        draftExamLesson: _.cloneDeep(payload),
      };
    case "SET_DRAWER_DATA_DRAFT":
      return {
        ...state,
        drawerDataDraft: payload,
        draftExamLesson: payload.exam
          ? _.cloneDeep(payload.exam)
          : _.cloneDeep(initDraftExamLesson),
      };
    case "SET_IS_EDIT":
      return {
        ...state,
        isEdit: payload,
      };
    case "SET_IS_LOADING":
      return {
        ...state,
        isLoading: payload,
      };
    case "SET_TYPE_CONTENT_ACTIVE":
      return {
        ...state,
        typeContentActive: payload,
        drawerDataDraft: {
          ...state.drawerDataDraft,
          contentType: payload,
          attachment: null,
          content: "",
        },
      };
    case "SET_TYPE_CONTENT_CHANGE":
      return {
        ...state,
        typeContentChange: payload,
      };
    case "SET_VIEW_CONTENT_ACTIVE":
      return {
        ...state,
        typeContentActive: payload,
      };
    case "CHANGE_DATA_DRAFF":
      return {
        ...state,
        drawerDataDraft: {
          ...state.drawerDataDraft,
          [payload.key]: payload.value,
        },
      };
    case "CHANGE_DATA_DRAFF_EXAM":
      return {
        ...state,
        draftExamLesson: {
          ...state.draftExamLesson,
          [payload.key]: payload.value,
        },
      };
    case "SET_ITEM_EXAM_FOCUS":
      return {
        ...state,
        itemExamFocus: payload,
      };
    case "CHANGE_MODAL_STATE":
      return {
        ...state,
        isOpenModal: payload,
      };
    case "SET_ITEM_QUESTION_DELETE":
      return {
        ...state,
        itemQuestionDelete: payload,
      };
    default:
      return state;
  }
};

export const DrawerLesson: React.FC<DrawerLessonProps> = (props) => {
  const [state, dispatch] = React.useReducer(stateReducer, initialState);
  const [timeSaveDraft, setTimeSaveDraft] = React.useState("");
  const [error, setError] = React.useState({});
  const [isHaveSaveDraft, setIsHaveSaveDraft] = React.useState(false);
  const examLessonExamRef = React.useRef<any>(null);
  const lessonRef = React.useRef<any>(null);
  // const ref_Popover = React.useRef<any>(null);
  // const [isShowPopover, setIsShowPopover] = React.useState(false);

  const {
    visible,
    onCloseDrawer,
    isEdit,
    itemEdit,
    onPushItemLnDContent,
    isView,
  } = props;

  const { draftExamLesson } = state;

  // React.useLayoutEffect(() => {
  //   if (ref_Popover && ref_Popover.current) {
  //     setIsShowPopover(ref_Popover.current)
  //   }
  // }, [])

  React.useEffect(() => {
    if (isEdit || isView) {
      getDataSubjectLesson();
    } else {
      dispatch({
        type: "SET_DRAWER_DATA_DRAFT",
        payload: {
          ...initDraffValue,
        },
      });
    }
  }, [visible]);

  React.useEffect(() => {
    if (isHaveSaveDraft) {
      onSaveLesson(false);
    } else if (!isHaveSaveDraft) {
      handleSaveDraft();
    }
  }, [isHaveSaveDraft]);

  React.useEffect(() => {
    if (props.isEdit && state.drawerDataDraft) {
      const lesson = state.drawerDataDraft;
      const exam = state.drawerDataDraft?.exam;
      let errorCheck = {};

      switch (lesson.contentType) {
        case EnumContentLesson.Video:
          if (!lesson.content) {
            errorCheck["linkYoutube"] = "Vui lòng nhập link video";
          } else if (!UtilsLnD.checkValidLinkYoutube(lesson.content)) {
            errorCheck["linkYoutube"] = "Đường dẫn video không hợp lệ";
          } else {
            errorCheck = null
          }
          break;
        case EnumContentLesson.Editor:
          if (!lesson.content) {
            errorCheck["contentEditor"] = "Vui lòng nhập nội dung môn học";
          } else {
            errorCheck = null;
          }
          break;
        case EnumContentLesson.FilePDF:
          if (!lesson.attachment && !lesson.attachment?.url) {
            errorCheck["filePDF"] = "Vui lòng nhập file pdf (.pdf)";
          } else {
            errorCheck = null;
          }
          break;
        case EnumContentLesson.FilePPT:
          if (!lesson.attachment && !lesson.attachment?.url) {
            errorCheck["filePPT"] =
              "Vui lòng nhập file power point (.ptt, .pptx)";
          } else {
            errorCheck = null;
          }
          break;
        default:
          break;
      }

      // if(lesson.content && !checkValidLinkYoutube(lesson.content)){
      //   errorCheck = {
      //     ...errorCheck,
      //     linkYoutube: "",
      //   }
      // }

      //check questionToPass
      const setting = exam?.setting || null;
      if (
        setting &&
        setting.checkPass === EnumLnDExamSettingPassType.LimitQuestion &&
        !exam.setting.questionsToPass
      ) {
        errorCheck["questionsToPass"] =
          "Vui lòng nhập số lượng câu hỏi cần đạt";
      }

      if (errorCheck) {
        setError({ ...error, ...errorCheck });
      } else {
        setError({
          ...error,
          linkYoutube: "",
          contentEditor: "",
          filePDF: "",
          filePPT: "",
        });
      }
    }
  }, [props.isEdit, state.drawerDataDraft]);

  const handleSaveDraft = () => {
    if (isView) return;

    setTimeout(() => {
      setIsHaveSaveDraft(true);
    }, 30000);
  };

  const getDataSubjectLesson = async () => {
    dispatch({
      type: "SET_IS_LOADING",
      payload: true,
    })

    const result = await ApiLnD.getSubjectLessonDetail(itemEdit.itemId);

    if (result && !result.error) {
      if (!lessonRef.current) lessonRef.current = result.data.id;

      if (!examLessonExamRef.current)
        examLessonExamRef.current = result.data.exam?.id;

      dispatch({
        type: "SET_DRAWER_DATA_DRAFT",
        payload: {
          ...result.data,
        },
      });

      dispatch({
        type: "SET_VIEW_CONTENT_ACTIVE",
        payload: result.data.contentType,
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

  const handleOutFocusField = (key: string, value: any) => {
    switch (key) {
      case "name":
        if (!value) setError({ ...error, name: "Vui lòng nhập tên bài học" });
        else {
          setError({ ...error, name: "" });
        }
        break;
      case "linkYoutube":
        if (!value) {
          setError({ ...error, linkYoutube: "Vui lòng nhập link video" });
        } else {
          let isValid = UtilsLnD.checkValidLinkYoutube(value);

          if (!isValid)
            setError({ ...error, linkYoutube: "Đường dẫn video không hợp lệ" });
          else setError({ ...error, linkYoutube: "" });
        }
        break;
      case "lockTime":
        if (!value) {
          setError({
            ...error,
            lockTime: "Vui lòng nhập tên thời gian bị khoá",
          });
        } else {
          if (+value <= 0)
            setError({
              ...error,
              lockTime: "Thời gian bị khóa phải lớn hơn 0",
            });
          else if (+value >= 1000)
            setError({
              ...error,
              lockTime: "Thời gian bị khóa phải nhỏ hơn 1000",
            });
          else setError({ ...error, lockTime: "" });
        }
        break;
      case "contentEditor":
        if (!value) {
          setError({
            ...error,
            contentEditor: "Vui lòng nhập nội dung môn học",
          });
        } else {
          setError({ ...error, contentEditor: "" });
        }
        break;
      case "filePDF":
        if (!value) {
          setError({
            ...error,
            filePDF: "Vui lòng nhập file pdf (.pdf)",
          });
        } else {
          setError({ ...error, filePDF: "" });
        }
        break;
      case "filePPT":
        if (!value) {
          setError({
            ...error,
            filePPT: "Vui lòng nhập file power point (.ptt, .pptx)",
          });
        } else {
          setError({ ...error, filePPT: "" });
        }
        break;
      case "questionsToPass":
        const { draftExamLesson } = state;

        if (
          draftExamLesson.setting.checkPass ===
          EnumLnDExamSettingPassType.LimitQuestion &&
          !draftExamLesson.setting.questionsToPass
        ) {
          setError({
            ...error,
            questionsToPass: "Vui lòng nhập số lượng câu hỏi cần đạt",
          });
        } else {
          setError({ ...error, questionsToPass: "" });
        }
        break;
      default:
        break;
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
      type: "CHANGE_DATA_DRAFF_EXAM",
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
    questionType: EnumLnDExamQuestionType
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
    let newItem = UtilsLnD.initQuestionExam(
      type,
      questionType,
      indexQuestion,
      EnumLnDExamType.TestInLesson
    );

    listData.splice(indexItem + 1, 0, newItem);

    dispatch({
      type: "CHANGE_DATA_DRAFF_EXAM",
      payload: {
        key: "items",
        value: [...listData],
      },
    });

    dispatch({ type: "SET_ITEM_EXAM_FOCUS", payload: newItem.id });
  };

  const onCloneItem = (
    item: ILnDContentExamItem,
    listData: ILnDContentExamItem[]
  ) => {
    let newItem = {} as ILnDContentExamItem;
    let indexItem = listData.findIndex((it) => it.id === item.id);

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

    listData.splice(indexItem + 1, 0, newItem);

    dispatch({
      type: "CHANGE_DATA_DRAFF_EXAM",
      payload: {
        key: "items",
        value: [...listData],
      },
    });

    dispatch({ type: "SET_ITEM_EXAM_FOCUS", payload: newItem.id });
  };

  const handleDeleteQuestion = (item?: any) => {
    dispatch({
      type: "SET_ITEM_QUESTION_DELETE",
      payload: item,
    });

    dispatch({
      type: "CHANGE_MODAL_STATE",
      payload: TypeModalDrawerLesson.DeleteQuestion,
    });
  };

  const onDeleteItem = () => {
    const listData = draftExamLesson?.items;
    const item = state.itemQuestionDelete;

    let indexItem = listData.findIndex((it) => it.id === item.id);

    listData.splice(indexItem, 1);

    dispatch({
      type: "CHANGE_DATA_DRAFF_EXAM",
      payload: {
        key: "items",
        value: [...listData],
      },
    });

    dispatch({ type: "SET_ITEM_EXAM_FOCUS", payload: "" });
    dispatch({
      type: "CHANGE_MODAL_STATE",
      payload: TypeModalDrawerLesson.None,
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

  const onChangeDataLine = (
    key: string,
    data: any,
    it: ILnDContentExamItem
  ) => {
    const { draftExamLesson } = state;

    let itemsClone = [...draftExamLesson.items];
    let indexItemChange = itemsClone.findIndex((item) => item.id === it.id);

    switch (key) {
      default:
        if (indexItemChange > -1) {
          itemsClone[indexItemChange][key] = data;
        }

        dispatch({
          type: "CHANGE_DATA_DRAFF_EXAM",
          payload: {
            key: "items",
            value: [...itemsClone],
          },
        });
    }
  };

  const onChangeExamConfig = (key: string, value: any) => {
    const settings = { ...draftExamLesson.setting };
    let newSetting = null;

    switch (key) {
      case "questionsToPass":
        newSetting = {
          ...settings,
          questionsToPass: value?.id,
        };
        break;
      case "checkPass":
        if (value === EnumLnDExamSettingPassType.AllQuestion) {
          setError({
            ...error,
            questionsToPass: "",
          });
        }

        newSetting = {
          ...settings,
          [key]: value,
        };
        break;
      default:
        newSetting = {
          ...settings,
          [key]: value,
        };
        break;
    }

    dispatch({
      type: "CHANGE_DATA_DRAFF_EXAM",
      payload: {
        key: "setting",
        value: newSetting,
      },
    });
  };

  const checkHaveDataDraff = () => {
    let isHaveData = false;

    if (!_.isEqual(state.drawerDataDraft, initialState.drawerDataDraft)) {
      isHaveData = true;
    }

    if (!_.isEqual(state.draftExamLesson, initialState.draftExamLesson)) {
      isHaveData = true;
    }

    return isHaveData;
  };

  const checkDisableSaveLesson = () => {
    const { drawerDataDraft, draftExamLesson } = state;
    const testCheck = UtilsLnD.checkValidLessonContent(
      drawerDataDraft,
      draftExamLesson
    );
    // console.log("🚀 ~ file: index.tsx ~ line 633 ~ testCheck", testCheck);
    let isDisable = false;

    if (!drawerDataDraft.name) {
      isDisable = true;
    }

    //check have lesson content
    if (
      drawerDataDraft.contentType === EnumContentLesson.Video ||
      drawerDataDraft.contentType === EnumContentLesson.Editor
    ) {
      !drawerDataDraft.content ? (isDisable = true) : null;
    }

    if (
      drawerDataDraft.contentType === EnumContentLesson.FilePDF ||
      drawerDataDraft.contentType === EnumContentLesson.FilePPT
    ) {
      !drawerDataDraft.attachment && !drawerDataDraft.attachment?.url
        ? (isDisable = true)
        : null;
    }

    //have error => true
    Object.keys(error).forEach((item) => {
      if (error[item]) {
        isDisable = true;
        return;
      }
    });

    const { items, setting } = draftExamLesson;

    items &&
      items.forEach((item) => {
        if (!item.name || !item.answer) {
          isDisable = true;
          return;
        }

        const listNameOption = new Set();

        //check list Option
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

    //check config lock time
    if (items && items.length && !setting.lockTime) {
      isDisable = true;
    }

    //check config questions to pass
    if (
      items &&
      items.length &&
      setting.checkPass === EnumLnDExamSettingPassType.LimitQuestion &&
      !setting.questionsToPass
    ) {
      isDisable = true;
    }

    return isDisable;
  };

  const onSaveExamLesson = async (refId?: string) => {
    const { draftExamLesson, drawerDataDraft } = state;

    const body = {
      ...draftExamLesson,
      refId: refId || lessonRef.current,
      subjectContentId:
        props.subjectContentId || drawerDataDraft.subjectContentId,
    };

    if (isEdit || examLessonExamRef.current) {
      if (!examLessonExamRef.current) return true;

      const result = await ApiLnD.putSubjectExam({
        ...body,
        id: examLessonExamRef.current,
      });

      if (result && !result.error) {
        //set id Exam Lesson

        return true;
      } else {
        HrvComponents.Notification["error"]({
          message: `${result.message ? result.message : "Có lỗi xảy ra. Vui lòng thử lại"
            }`,
        });
        return false;
      }
    } else {
      const result = await ApiLnD.postSubjectExam(body);

      if (result && !result.error) {
        examLessonExamRef.current = result.data.id;

        return true;
      } else {
        HrvComponents.Notification["error"]({
          message: `${result.message ? result.message : "Có lỗi xảy ra. Vui lòng thử lại"
            }`,
        });
        return false;
      }
    }
  };

  const onSaveDraftLesson = async (callBack?: Function) => {
    await onSaveLesson(false);

    if (callBack) callBack();
  };

  const onSaveLesson = async (isCloseDrawer: boolean = true) => {
    const { drawerDataDraft, draftExamLesson, typeContentActive } = state;
    const isValidItem = !checkDisableSaveLesson();

    const body = {
      ...drawerDataDraft,
      subjectContentId:
        props.subjectContentId || drawerDataDraft.subjectContentId,
    };

    if (isEdit || lessonRef.current) {
      const result = await ApiLnD.putSubjectLesson({
        ...body,
        id: lessonRef.current,
      });

      if (result && !result.error) {
        onPushItemLnDContent({
          itemId: lessonRef.current,
          name: body.name,
          description: body.description,
          type: EnumTypeLnDContent.TypeLesson,
          isValidItem,
          lesson: {
            contentType: typeContentActive,
          },
        });

        const isSuccess = await onSaveExamLesson(lessonRef.current);

        if (isSuccess && isCloseDrawer) {
          onCloseDrawer();
        } else {
          setTimeSaveDraft(Utils.getDateShort(new Date(), "HH:mm:ss"));
          setIsHaveSaveDraft(false);
          return;
        }
      } else {
        console.log("res Error on Save Lesson", result?.error);

        HrvComponents.Notification["error"]({
          message: `${result.message ? result.message : "Có lỗi xảy ra. Vui lòng thử lại"
            }`,
        });
        setIsHaveSaveDraft(false);
        return;
      }
    } else {
      let itemSubjectContent = null;
      const result = await ApiLnD.postSubjectLesson(body);

      if (result && !result.error) {
        const { data } = result;

        lessonRef.current = data.id;

        itemSubjectContent = {
          itemId: data.id,
          name: data.name,
          description: data.description,
          type: EnumTypeLnDContent.TypeLesson,
          isValidItem,
          lesson: {
            contentType: typeContentActive,
          },
        };

        onPushItemLnDContent(itemSubjectContent);

        //call api save exam ref to subject lesson

        const isSuccess = await onSaveExamLesson(data.id);
        if (isSuccess && isCloseDrawer) {
          onCloseDrawer();
        } else {
          setTimeSaveDraft(Utils.getDateShort(new Date(), "HH:mm:ss"));
          setIsHaveSaveDraft(false);
          return;
        }
      } else {
        console.log("res Error on Save Lesson", result?.error);

        Notification["error"]({
          message: `${result.message ? result.message : "Có lỗi xảy ra. Vui lòng thử lại"
            }`,
        });
        setIsHaveSaveDraft(false);
        return;
      }
    }
  };

  const onDeleteLesson = async () => {
    const id = lessonRef.current;

    if (!id) {
      onCloseDrawer();
      return;
    }

    const result = await ApiLnD.deleteSubjectLesson(id);

    if (result && !result.error) {
      onPushItemLnDContent({ itemId: id }, true);
      onCloseDrawer();
    } else {
      console.log("res Error on Delete Lesson", result?.error);

      Notification["error"]({
        message: `${result.message ? result.message : "Có lỗi xảy ra. Vui lòng thử lại"
          }`,
      });
      return;
    }
  };

  const handleCloseDrawer = () => {
    if (isView) {
      onCloseDrawer();
      return;
    }
    const isHaveDataDraff = checkHaveDataDraff();

    if (isHaveDataDraff) {
      //render Modal
      dispatch({
        type: "CHANGE_MODAL_STATE",
        payload: TypeModalDrawerLesson.Close,
      });
    } else {
      onCloseDrawer();
    }
  };

  const handleChangeTabContent = (type: EnumContentLesson) => {
    const { typeContentActive, drawerDataDraft } = state;

    if (typeContentActive !== type) {
      if (drawerDataDraft.content || drawerDataDraft.attachment) {
        //have data show modal
        dispatch({
          type: "CHANGE_MODAL_STATE",
          payload: TypeModalDrawerLesson.ChangeTypeContent,
        });

        dispatch({
          type: "SET_TYPE_CONTENT_CHANGE",
          payload: type,
        });
      } else {
        setError({ ...error, linkYoutube: "" });
        dispatch({
          type: "SET_TYPE_CONTENT_ACTIVE",
          payload: type,
        });
      }
    } else {
      return null;
    }
  };

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

    switch (typeContent) {
      case EnumLnDExamItemType.Question:
        clsName = isEdit
          ? "lnd-exam-content-item is-Edit"
          : "lnd-exam-content-item is-View";

        return (
          <LnDExamQuestion
            indexItem={index}
            className={clsName}
            key={item.id}
            isEdit={isEdit}
            item={item}
            provided={provided}
            typeContent={EnumLnDExamType.TestInLesson}
            onChangeData={(key: string, data: any) =>
              onChangeDataLine(key, data, item)
            }
            onAddItem={(type: EnumLnDExamItemType) =>
              onAddItem(item.itemType, index, listData, item.questionType)
            }
            onCloneItem={() => onCloneItem(item, listData)}
            onRemoveItem={() => handleDeleteQuestion(item)}
            onChangeView={() =>
              dispatch({ type: "SET_ITEM_EXAM_FOCUS", payload: item.id })
            }
            // onClickOutside={() => {
            //   dispatch({ type: "SET_ITEM_EXAM_FOCUS", payload: "" });
            // }}
            typeQuestion={item.questionType}
            isView={isView}
          />
        );
      //Check type question
      default:
        return null;
    }
  };

  const renderLnDContentExamList = () => {
    const { draftExamLesson, itemExamFocus } = state;
    const { items } = draftExamLesson;

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
                      let isEdit = itemExamFocus === it.id;
                      let clsName = isEdit
                        ? "lnd-exam-item is-Edit"
                        : "lnd-exam-item is-View";

                      return (
                        <React.Fragment>
                          {renderLnDContentExamItem(
                            index,
                            isEdit,
                            it,
                            items,
                            provided,
                            clsName,
                            it.itemType
                          )}
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

  const renderHeaderModal = (type: TypeModalDrawerLesson) => {
    switch (type) {
      case TypeModalDrawerLesson.ChangeTypeContent:
        return <div>Xác nhận chuyển loại nội dung</div>;
      case TypeModalDrawerLesson.Close:
        return <div>Xác nhận hủy</div>;
      case TypeModalDrawerLesson.Delete:
        return <div>Xác nhận xóa</div>;
      case TypeModalDrawerLesson.DeleteQuestion:
        return <div>Xác nhận xóa</div>;
      default:
        return null;
    }
  };

  const renderBodyModal = (type: TypeModalDrawerLesson) => {
    switch (type) {
      case TypeModalDrawerLesson.ChangeTypeContent:
        return (
          <div className="lnd-modal-goBack__text-title">
            Mỗi bài học chỉ được chọn 1 loại nội dung học. Nếu chuyển loại khác,
            dữ liệu đã thiết lập của nội dung học hiện tại sẽ bị{" "}
            <span style={{ color: "#CA4E4A" }}>xóa</span>.
            <br />
            Bạn có muốn chuyển loại nội dung?
          </div>
        );
      case TypeModalDrawerLesson.Close:
        return (
          <div className="lnd-modal-goBack__text-title">
            Nếu bạn thoát bây giờ, hệ thống sẽ xóa các dữ liệu đã nhập của bài
            học. Bạn có chắc chắn muốn hủy không?
          </div>
        );
      case TypeModalDrawerLesson.Delete:
        return <div>Bạn có muốn xóa bài học này?</div>;
      case TypeModalDrawerLesson.DeleteQuestion:
        return <div>Bạn có muốn xóa câu hỏi này?</div>;
      default:
        return null;
    }
  };

  const renderFooterModal = (type: TypeModalDrawerLesson) => {
    switch (type) {
      case TypeModalDrawerLesson.ChangeTypeContent:
        return (
          <React.Fragment>
            <span>
              <HrvComponents.Button
                status="link"
                onClick={() =>
                  dispatch({
                    type: "CHANGE_MODAL_STATE",
                    payload: TypeModalDrawerLesson.None,
                  })
                }
              >
                <span style={{ color: "#021337" }}>Đóng</span>
              </HrvComponents.Button>
              <HrvComponents.Button
                status="danger"
                onClick={() => {
                  dispatch({
                    type: "SET_TYPE_CONTENT_ACTIVE",
                    payload: state.typeContentChange,
                  });

                  dispatch({
                    type: "CHANGE_MODAL_STATE",
                    payload: TypeModalDrawerLesson.None,
                  });

                  //Set Error null
                  setError({
                    ...error,
                    linkYoutube: "",
                    filePDF: "",
                    contentEditor: "",
                    filePPT: "",
                  });
                }}
              >
                Đồng ý
              </HrvComponents.Button>
            </span>
          </React.Fragment>
        );
      case TypeModalDrawerLesson.Close:
        return (
          <React.Fragment>
            <span>
              <HrvComponents.Button
                status="link"
                onClick={() =>
                  dispatch({
                    type: "CHANGE_MODAL_STATE",
                    payload: TypeModalDrawerLesson.None,
                  })
                }
              >
                <span style={{ color: "#021337" }}>Đóng</span>
              </HrvComponents.Button>
              <HrvComponents.Button
                status="danger"
                onClick={() => {
                  !isEdit && onDeleteLesson();
                  onCloseDrawer();
                }}
              >
                Đồng ý
              </HrvComponents.Button>
            </span>
          </React.Fragment>
        );
      case TypeModalDrawerLesson.Delete:
        return (
          <React.Fragment>
            <HrvComponents.Button
              status="link"
              onClick={() =>
                dispatch({
                  type: "CHANGE_MODAL_STATE",
                  payload: TypeModalDrawerLesson.None,
                })
              }
            >
              <span style={{ color: "#021337" }}>Đóng</span>
            </HrvComponents.Button>
            <HrvComponents.Button
              status="danger"
              onClick={() => onDeleteLesson()}
            >
              Đồng ý
            </HrvComponents.Button>
          </React.Fragment>
        );
      case TypeModalDrawerLesson.DeleteQuestion:
        return (
          <React.Fragment>
            <HrvComponents.Button
              status="link"
              onClick={() =>
                dispatch({
                  type: "CHANGE_MODAL_STATE",
                  payload: TypeModalDrawerLesson.None,
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
        isOpen={state.isOpenModal !== TypeModalDrawerLesson.None}
        isBtnClose={false}
        headerContent={renderHeaderModal(state.isOpenModal)}
        bodyContent={renderBodyModal(state.isOpenModal)}
        footerContent={renderFooterModal(state.isOpenModal)}
        footerDisabledCloseModal
        afterCloseModal={() =>
          dispatch({
            type: "CHANGE_MODAL_STATE",
            payload: TypeModalDrawerLesson.None,
          })
        }
      ></HrvComponents.Modal>
    );
  };

  const renderTypeLessonContent = () => {
    const { typeContentActive, drawerDataDraft } = state;

    const linkYoutubeFormat =
      drawerDataDraft.contentType === EnumContentLesson.Video
        ? UtilsLnD.checkValidLinkYoutube(drawerDataDraft.content)
        : "";

    switch (typeContentActive) {
      case EnumContentLesson.Video:
        return (
          <div className="lnd-content-lesson__link">
            {!isView && (
              <div
                className={`lnd-content-lesson__link-input ${error["linkYoutube"] ? "error" : ""
                  }`}
              >
                <input
                  placeholder="Nhập link video, ví dụ: https://www.youtube.com/watch?v=sELwQ4ADFGE"
                  value={drawerDataDraft.content}
                  type="text"
                  onChange={(e: any) => {
                    handleOutFocusField("linkYoutube", e.target.value);
                    dispatch({
                      type: "CHANGE_DATA_DRAFF",
                      payload: {
                        key: "content",
                        value: e.target.value,
                      },
                    });
                  }}
                  className=""
                  maxLength={200}
                  // onFocus={() => setIsFocus(true)}
                  onBlur={(e) =>
                    handleOutFocusField("linkYoutube", e.target.value)
                  }
                  disabled={isView || false}
                />
              </div>
            )}

            {error["linkYoutube"] ? (
              <div className="input-validate-error-field">
                {error["linkYoutube"]}
              </div>
            ) : null}
            {drawerDataDraft.content && !error["linkYoutube"] && (
              <div className="lnd-content-lesson__link-iframe">
                <iframe
                  width="100%"
                  height="100%"
                  // src="https://www.youtube.com/embed/sELwQ4ADFGE"
                  // src={`https://www.youtube.com/embed/${drawerDataDraft.content}`}
                  src={`${linkYoutubeFormat}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            )}
          </div>
        );
      case EnumContentLesson.FilePDF:
        return (
          <div className="lnd-content-lesson__file">
            <div className="lnd-content-lesson__file-input">
              {!isView && (
                <ListFileUpload
                  accept="application/pdf, .pdf"
                  listFileUpload={
                    drawerDataDraft.attachment
                      ? [{ ...drawerDataDraft.attachment }]
                      : []
                  }
                  onChangeList={(newList) => {
                    if (!newList[0]) handleOutFocusField("filePDF", false);
                    else handleOutFocusField("filePDF", true);

                    dispatch({
                      type: "CHANGE_DATA_DRAFF",
                      payload: {
                        key: "attachment",
                        value: newList[0],
                      },
                    });
                  }}
                  isEdit={true}
                  isHiddenUpload={
                    drawerDataDraft.attachment &&
                      drawerDataDraft.attachment?.url
                      ? true
                      : false
                  }
                />
              )}
            </div>
            {error["filePDF"] ? (
              <div className="input-validate-error-field mt-2">
                {error["filePDF"]}
              </div>
            ) : null}
            <div className="lnd-content-lesson__file-file">
              {drawerDataDraft.attachment?.url && (
                // <embed
                //   src={drawerDataDraft.attachment?.url}
                //   style={{ width: "100%", height: "800px" }}
                //   type="application/pdf"
                // />
                <iframe
                  src={`${drawerDataDraft.attachment?.url}`}
                  style={{ width: "100%", height: "473px" }}
                  frameBorder="0"
                >
                </iframe>
              )}
            </div>
          </div>
        );
      case EnumContentLesson.Editor:
        return (
          <div className="lnd-content-lesson__file">
            <div className="lnd-content-lesson__file-input">
              <ContentEditor
                config={ConfigEditorLnD}
                value={drawerDataDraft.content}
                onChange={(value: any) => {
                  handleOutFocusField("contentEditor", value);
                  dispatch({
                    type: "CHANGE_DATA_DRAFF",
                    payload: {
                      key: "content",
                      value,
                    },
                  });
                }}
                // onBlur={() => handleOnBlur(EnumGeneralInfo.descriptions)}
                // className={error.isError ? "border-error" : null}
                readOnly={isView || false}
                onBlur={() =>
                  handleOutFocusField("contentEditor", drawerDataDraft.content)
                }
              />
            </div>
            {error["contentEditor"] ? (
              <div className="input-validate-error-field mt-2">
                {error["contentEditor"]}
              </div>
            ) : null}
          </div>
        );
      case EnumContentLesson.FilePPT:
        return (
          <div className="lnd-content-lesson__file">
            <div className="lnd-content-lesson__file-input">
              {!isView && (
                <ListFileUpload
                  maxSize={50}
                  accept=".ppt,.pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                  listFileUpload={
                    drawerDataDraft.attachment
                      ? [{ ...drawerDataDraft.attachment }]
                      : []
                  }
                  onChangeList={(newList) => {
                    if (!newList[0]) handleOutFocusField("filePPT", false);
                    else handleOutFocusField("filePPT", true);

                    dispatch({
                      type: "CHANGE_DATA_DRAFF",
                      payload: {
                        key: "attachment",
                        value: newList[0],
                      },
                    });
                  }}
                  isEdit={true}
                  isHiddenUpload={
                    drawerDataDraft.attachment &&
                      drawerDataDraft.attachment?.url
                      ? true
                      : false
                  }
                />
              )}
            </div>
            {error["filePPT"] ? (
              <div className="input-validate-error-field mt-2">
                {error["filePPT"]}
              </div>
            ) : null}
            <div className="lnd-content-lesson__file-file">
              {drawerDataDraft.attachment?.url && (
                <iframe
                  src={`https://view.officeapps.live.com/op/embed.aspx?src=${drawerDataDraft.attachment?.url}`}
                  width="100%"
                  height="800px"
                  frameBorder="0"
                ></iframe>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderLessonExam = () => {
    return (
      <React.Fragment>
        <div className="lnd-lesson-exam__title">Bài tập kiểm tra</div>
        {draftExamLesson &&
          draftExamLesson.items &&
          draftExamLesson.items?.length > 0 ? (
          renderLnDContentExamList()
        ) : isView ? (
          <div>Không có bài tập kiểm tra</div>
        ) : null}
        {!isView && (
          <React.Fragment>
            <HrvComponents.Popover
              key={Utils.getNewGuid()}
              content={
                <div className="lnd-content-lesson_exam-popover">
                  <div
                    className="lesson_exam-popover__item"
                    onMouseDown={() => 
                        onAddLnDContentExamItem(
                        draftExamLesson.items,
                        EnumLnDExamItemType.Question,
                        EnumLnDExamQuestionType.MultiChoice
                      )
                    }
                    // onClick={(e) => {
                    //   alert("onclick")
                    //   onAddLnDContentExamItem(
                    //     draftExamLesson.items,
                    //     EnumLnDExamItemType.Question,
                    //     EnumLnDExamQuestionType.MultiChoice
                    //   )
                    // }}
                  >
                    <div className="icon">{ISVGQuestionMulti()}</div>
                    <div className="text">Trắc nghiệm</div>
                  </div>
                  <div
                    className="lesson_exam-popover__item"
                    onMouseDown={() => 
                      onAddLnDContentExamItem(
                        draftExamLesson.items,
                        EnumLnDExamItemType.Question,
                        EnumLnDExamQuestionType.TrueFalse
                      )
                    }
                    // onClick={() =>{
                    //   alert("abc")
                    //   onAddLnDContentExamItem(
                    //     draftExamLesson.items,
                    //     EnumLnDExamItemType.Question,
                    //     EnumLnDExamQuestionType.TrueFalse
                    //   )
                    // }}
                  >
                    <div className="icon">{ISVGQuestionTrueFalse()}</div>
                    <div className="text">Đúng/Sai</div>
                  </div>
                </div>
              }
              placement="bottom"
              trigger="hover"
            // visible={isShowPopover}
            >
              <div className="lnd-lesson-exam__button" onMouseDown={() => {
                // setIsShowPopover(!isShowPopover)
                // ref_Popover.current = !isShowPopover;
              }}>
                <div className="lnd-lesson-exam__button-icon">
                  {ISVGQuestionMark()}
                </div>
                {/* onClick={(e) => e.stopPropagation()} */}
                <div className="lnd-lesson-exam__button-text">Thêm câu hỏi</div>
              </div>
            </HrvComponents.Popover>
          </React.Fragment>
        )}
      </React.Fragment>
    );
  };

  const renderLessonExamConfig = () => {
    const { items } = draftExamLesson;
    const listQuestionPassed =
      items && items.length
        ? items.map((item, index) => ({
          id: index + 1,
          name: `${index + 1}`,
        }))
        : [];

    const questionToPassVal = listQuestionPassed.find(
      (item) => item.id === draftExamLesson.setting.questionsToPass
    );

    return (
      <React.Fragment>
        <div className="lnd-lesson-exam__title">Cấu hình bài kiểm tra</div>
        <div className="lnd-lesson-exam__config">
          <div className="lnd-lesson-exam__config__item">
            <div className="config__title">
              Người học cần trả lời đúng bao nhiêu câu hỏi để ĐẠT bài kiểm tra
            </div>
            <div className="config-option">
              <div className="config-option__item">
                <HrvComponents.InputRadio
                  disabled={isView || false}
                  checked={
                    draftExamLesson.setting.checkPass ===
                    EnumLnDExamSettingPassType.AllQuestion
                  }
                  onChange={(value) =>
                    onChangeExamConfig(
                      "checkPass",
                      EnumLnDExamSettingPassType.AllQuestion
                    )
                  }
                ></HrvComponents.InputRadio>
                <div className="config-option__item__desc">Tất cả câu hỏi</div>
              </div>
              <div className="config-option__item">
                <HrvComponents.InputRadio
                  disabled={isView || false}
                  checked={
                    draftExamLesson.setting.checkPass ===
                    EnumLnDExamSettingPassType.LimitQuestion
                  }
                  onChange={(value) =>
                    onChangeExamConfig(
                      "checkPass",
                      EnumLnDExamSettingPassType.LimitQuestion
                    )
                  }
                ></HrvComponents.InputRadio>
                <div className="config-option__item__desc">Số lượng cụ thể</div>
              </div>
              {draftExamLesson.setting.checkPass ===
                EnumLnDExamSettingPassType.LimitQuestion && (
                  <React.Fragment>
                    <div className="config-option__item-select">
                      <CustomSelect
                        onChange={(value: any) =>
                          onChangeExamConfig("questionsToPass", value)
                        }
                        label="Số câu hỏi cần đạt"
                        listData={[...listQuestionPassed]}
                        value={questionToPassVal}
                        // isMulti
                        disableClearable={true}
                        isReadOnly={isView}
                        isError={error["questionsToPass"] ? true : false}
                        handleOnBlur={() => {
                          handleOutFocusField("questionsToPass", "");
                        }}
                      />
                    </div>
                    {error["questionsToPass"] ? (
                      <div
                        className="input-validate-error-field"
                        style={{ marginTop: "-16px", marginBottom: "16px" }}
                      >
                        {error["questionsToPass"]}
                      </div>
                    ) : (
                      <></>
                    )}
                  </React.Fragment>
                )}
            </div>
          </div>

          <div className="lnd-lesson-exam__config__item">
            <div className="config__title">
              Nếu kết quả kiểm tra KHÔNG ĐẠT, người dùng sẽ bị khóa bao lâu mới
              cho phép trả lời lại các câu hỏi này
            </div>
            <div
              className={`lnd-exam-config__body_time ${error["lockTime"] ? "error" : ""
                } ${isView ? "disable" : ""}`}
            >
              <input
                placeholder="Thời gian bị khóa"
                value={draftExamLesson.setting.lockTime}
                type="text"
                onChange={(e: any) => {
                  handleOutFocusField("lockTime", e.target.value);
                  onChangeExamConfig("lockTime", +e.target.value);
                }}
                className=""
                maxLength={10}
                // maxLength={maxLength ? maxLength : null}
                // onFocus={() => setIsFocus(true)}
                onBlur={(e) => handleOutFocusField("lockTime", e.target.value)}
                disabled={isView || false}
              />
              <span>phút</span>
            </div>
            {error["lockTime"] ? (
              <div className="input-validate-error-field">
                {error["lockTime"]}
              </div>
            ) : (
              <></>
            )}
          </div>

          <div className="lnd-lesson-exam__config__item">
            <div className="config__title" style={{ marginTop: "24px" }}>
              Cấu hình hiển thị kết quả sau khi ĐẠT bài kiểm tra
            </div>
            <div className="config-option">
              <div className="config-option__item">
                <HrvComponents.InputRadio
                  disabled={isView || false}
                  checked={
                    draftExamLesson.setting.viewAnswer ===
                    EnumLnDExamViewAnswerType.OnlyCountResult
                  }
                  onChange={(value) =>
                    onChangeExamConfig(
                      "viewAnswer",
                      EnumLnDExamViewAnswerType.OnlyCountResult
                    )
                  }
                  id={EnumLnDExamViewAnswerType.OnlyCountResult.toString()}
                ></HrvComponents.InputRadio>
                <div className="config-option__item__desc">
                  Chỉ hiển thị số lượng câu trả lời đúng/sai cho người học
                </div>
              </div>
              <div className="config-option__item">
                <HrvComponents.InputRadio
                  disabled={isView || false}
                  checked={
                    draftExamLesson.setting.viewAnswer ===
                    EnumLnDExamViewAnswerType.AnswerQuestion
                  }
                  onChange={(value) =>
                    onChangeExamConfig(
                      "viewAnswer",
                      EnumLnDExamViewAnswerType.AnswerQuestion
                    )
                  }
                  id={EnumLnDExamViewAnswerType.AnswerQuestion.toString()}
                ></HrvComponents.InputRadio>
                <div className="config-option__item__desc">
                  Hiển thị đáp án đúng để người học đối chiếu
                </div>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  };

  const renderBodyLessonContent = () => {
    return (
      <React.Fragment>
        <div className="lnd-lesson__title">Nội dung học</div>
        <div className="lnd-lesson__type">
          {!isView &&
            listTypeContentLesson.map((item, index) => {
              return (
                <div
                  key={`lnd-lesson__type-item-${index}`}
                  className={`lnd-lesson__type-item ${state.typeContentActive === item.id && !error[item.type]
                    ? "type-item-active"
                    : state.typeContentActive === item.id && error[item.type]
                      ? "error"
                      : ""
                    }`}
                  onClick={() => {
                    isView ? null : handleChangeTabContent(item.id);
                  }}
                >
                  <div className="icon">
                    {item.id === state.typeContentActive && !error[item.type]
                      ? item.iconActive
                      : item.id === state.typeContentActive && error[item.type]
                        ? item.iconError
                        : item.icon}
                  </div>
                  <div className="name">{item.name}</div>
                </div>
              );
            })}
        </div>
        <div className="lnd-lesson__content">{renderTypeLessonContent()}</div>
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
              placeholder="Tên bài học"
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
              autoFocus={true}
              // maxLength={maxLength ? maxLength : null}
              // onFocus={() => setIsFocus(true)}
              onBlur={(e) => handleOutFocusField("name", e.target.value)}
              disabled={isView || false}
            />
            {error["name"] && (
              <div className="input-validate-error-field">{error["name"]}</div>
            )}
            {error["name"] && (
              <span className="span-validate-empty-field">*</span>
            )}
          </div>
          {!(isView && drawerDataDraft.description.length === 0) && (
            <div className="lnd-learning-drawer__general-desc">
              <input
                placeholder="Mô tả ngắn (không quá 200 ký tự)"
                value={drawerDataDraft.description}
                type="text"
                onChange={(e: any) => {
                  dispatch({
                    type: "CHANGE_DATA_DRAFF",
                    payload: {
                      key: "description",
                      value: e.target.value,
                    },
                  });
                }}
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
        <div className="lnd-learning-drawer__body__content">
          {renderBodyLessonContent()}
        </div>
        <div className="lnd-learning-drawer-body__exam">
          {renderLessonExam()}
        </div>

        {draftExamLesson.items && draftExamLesson.items.length > 0
          ? renderLessonExamConfig()
          : null}
      </div>
    );
  };

  const renderDrawerContent = () => {
    const title =
      isEdit && !isView
        ? "Chỉnh sửa bài học"
        : isView
          ? "Xem bài học"
          : "Tạo bài học";

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
            onClick={() => onSaveDraftLesson(onCloseDrawer)}
          >
            {ISVGClose(20)}
          </div>
          <div className="lnd-learning-drawer__header-title">{title}</div>
        </div>
        {/* Body */}
        <div className="lnd-learning-drawer__body">{renderDrawerBody()}</div>


        {/* Footer */}
        {!isView && (
          <div className="lnd-learning-drawer__footer">
            <div className="lnd-learning-drawer__footer-content">
              <div className="left d-flex align-items-center">
                {isEdit ? (
                  <HrvComponents.Button
                    disabled={false}
                    status="link"
                    onClick={() =>
                      dispatch({
                        type: "CHANGE_MODAL_STATE",
                        payload: TypeModalDrawerLesson.Delete,
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
                  onClick={() => onSaveDraftLesson()}
                  size={"medium"}
                >
                  <Icon_save_craft />
                  <span className="text__btn ml-2">Lưu nháp</span>
                </HrvComponents.Button>
                {timeSaveDraft && (
                  <span className="text__noti__save__craft">{`Đã lưu nháp thành công vào lúc ${timeSaveDraft}`}</span>
                )}
              </div>

              <HrvComponents.Button
                loading={false}
                disabled={checkDisableSaveLesson()}
                status="primary"
                onClick={() => {
                  onSaveLesson(true);
                }}
                size={"medium"}
                className=""
              >
                <span className="text__btn m-0">
                  {isEdit ? "Cập nhật bài học" : "Tạo bài học"}
                </span>
              </HrvComponents.Button>
            </div>
          </div>
        )}
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

const initDraffValue = {
  name: "",
  description: "",
  contentType: EnumContentLesson.Video,
  attachment: null,
  content: "",
  isDraft: true,
};

const initDraftExamLesson = {
  name: "",
  description: "",
  refId: "",
  examType: EnumLnDExamType.TestInLesson,
  testTime: null,
  items: [],
  setting: {
    checkPass: EnumLnDExamSettingPassType.AllQuestion,
    lockTime: 5,
    viewAnswer: EnumLnDExamViewAnswerType.OnlyCountResult,
    questionsToPass: 0,
  },
};
