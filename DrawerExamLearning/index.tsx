import * as React from "react";
import * as HrvComponents from "@haravan/hrw-react-components";
import * as _ from "lodash";
import {
  Icon_background_modal_bottom,
  Icon_background_modal_right,
  Icon_reward_completed,
  Icon_timer_learning,
  ISVGArrowQuestion,
  ISVGClose,
} from "../../IconSVG";
import { EnumLnDExamItemType, EnumTypeLnDContent, LIST_OPTION_QUESTION } from "../../CommonHelp/constants";
import CircularProgress from "@material-ui/core/CircularProgress";
import { completeTheExam } from "../../CommonHelp/ApiLnD";

import "./index.css";
import { CounterTimer } from "../CounterTimer";

enum TypeModalDrawerLearningExam {
  None = 0,
  Close = 1,
  MissingAnswer,
  TimeoutExam,
  MissingAnswerExam,
}

interface DrawerExamLearningProps {
  learningTurnManagerId: string;
  typeLnDContent?: EnumTypeLnDContent;
  visible?: boolean;
  isView?: boolean;
  onChangeAnswer?: Function;
  handleOpenDrawer?: Function;
  examContent?: any;
  handleSubmit?: Function;
  resultLesson?: any;
  handleCompleteExam?: Function;
  handleSubmitExam?: Function;
  isContinueExam?: boolean;
}

interface DrawerExamLearningState {
  isLoading?: boolean;
  isOpenModal?: TypeModalDrawerLearningExam;
  examContent?: any;
  listQuestions?: any;
  timerTarget?: number;
  warningTimerLeft?: boolean;
  dataDraftExam?: any;
}

const initialState: DrawerExamLearningState = {
  isLoading: false,
  isOpenModal: TypeModalDrawerLearningExam.None,
  examContent: {},
  listQuestions: [],
  timerTarget: 1,
  warningTimerLeft: false,
};

const stateReducer = (state: DrawerExamLearningState, action: any) => {
  const { type, payload } = action;

  switch (type) {
    case "SET_IS_LOADING":
      return {
        ...state,
        isLoading: payload,
      };
    case "SET_EXAM_CONTENT":
      return {
        ...state,
        examContent: _.cloneDeep(payload),
      };
    case "SET_LIST_QUESTIONS":
      return {
        ...state,
        listQuestions: _.cloneDeep(payload),
      };
    case "CHANGE_MODAL_STATE":
      return {
        ...state,
        isOpenModal: payload,
      };
    case "SET_TIMER_TARGET":
      return {
        ...state,
        timerTarget: payload,
      };
    case "SET_WARNING_TIME_LEFT":
      return {
        ...state,
        warningTimerLeft: payload,
      };
    case "SET_DATA_DRAFF_EXAM":
      return {
        ...state,
        dataDraftExam: _.cloneDeep(payload),
      };
    default:
      return state;
  }
};

export const DrawerExamLearning: React.FC<DrawerExamLearningProps> = (
  props
) => {
  const {
    learningTurnManagerId,
    visible,
    isView,
    examContent,
    handleOpenDrawer,
    handleSubmit,
    resultLesson,
    typeLnDContent,
    handleCompleteExam,
    handleSubmitExam,
  } = props;
  const [state, dispatch] = React.useReducer(stateReducer, initialState);

  const refs = state.listQuestions
    .filter((it) => it.itemType === EnumLnDExamItemType.Question)
    .reduce((acc, value) => {
      acc[value.id] = React.createRef();
      return acc;
    }, {});

  React.useEffect(() => {
    dispatch({
      type: "SET_EXAM_CONTENT",
      payload: examContent,
    });

    if (props.typeLnDContent === EnumTypeLnDContent.TypeLesson) {
      handleFormatQuestion(examContent?.exam);
    } else if (props.typeLnDContent === EnumTypeLnDContent.TypeExam) {
      handleFormatQuestion(examContent);
    }
  }, [examContent, visible, state.dataDraftExam]);

  React.useEffect(() => {
    const { typeLnDContent, isContinueExam } = props;
    if (typeLnDContent === EnumTypeLnDContent.TypeExam) {
      onDoingExam();
    }
  }, []);

  // React.useEffect(() => {
  //   if (state.timerTarget === 1) {
  //     dispatch({
  //       type: "CHANGE_MODAL_STATE",
  //       payload: TypeModalDrawerLearningExam.None,
  //     });
  //   }
  // }, [state.timerTarget]);

  const onScrollToItem = (id) => {
    refs[id].current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const onDoingExam = async () => {
    dispatch({
      type: "SET_IS_LOADING",
      payload: true,
    });

    const body = {
      id: learningTurnManagerId,
      contentItemId: examContent?.id,
    };

    const result = await completeTheExam(body);
    if (result && !result.error) {
      const currentExam = result.data?.learningTurnExams.find(
        (exam: any) => exam.contentItemExamId === examContent.id
      );

      const timer =
        currentExam && currentExam.startTime
          ? new Date(currentExam.startTime).getTime() +
          examContent.testTime * 60000
          : 0;

      dispatch({
        type: "SET_DATA_DRAFF_EXAM",
        payload: currentExam,
      });

      dispatch({
        type: "SET_TIMER_TARGET",
        payload: timer,
      });

      dispatch({
        type: "SET_IS_LOADING",
        payload: false,
      });
    } else {
      HrvComponents.Notification.error({
        message: result.message
          ? result.message
          : "Có lỗi xảy ra. Vui lòng thử lại",
      });
    }
  };

  const handlePostAnswerExam = async (idQuestion: any, idAnswer: string) => {
    const { listQuestions, examContent } = state;

    const body = {
      id: learningTurnManagerId,
      contentItemId: examContent?.id,
      result: {
        examItemId: idQuestion,
        examItemOptionIds: [idAnswer],
      },
    };

    const result = await completeTheExam(body);

    if (result && !result.error) {
    } else {
      HrvComponents.Notification.error({
        message: result.message
          ? result.message
          : "Có lỗi xảy ra. Vui lòng thử lại",
      });
    }

    // const arrAnswer = listQuestions.map((item) => {
    //   return {
    //     examItemId: item.id,
    //     examItemOptionIds: [item.answer],
    //   };
    // });

    // const body = {
    //   id: "",
    //   contentItemId: examContent.id,
    //   result: {
    //     examItemId: string,
    //     examItemOptionIds: [string],
    //   },
    // };

    // let result = await completeTheExam(examContent.id, arrAnswer);

    // handleSubmit(examContent.id, arrAnswer);
  };

  const onSubmitExam = async (isSubmit: boolean = false) => {
    const count = checkMissingAnswer();

    if (count && !isSubmit) {
      dispatch({
        type: "CHANGE_MODAL_STATE",
        payload: TypeModalDrawerLearningExam.MissingAnswerExam,
      });
    } else {
      await handleSubmitExam(learningTurnManagerId, examContent.id);
      handleOpenDrawer(false);
    }
  };

  const handleSubmitTimeOut = async () => {
    dispatch({
      type: "SET_TIMER_TARGET",
      payload: null,
    });

    await handleSubmitExam(learningTurnManagerId, examContent.id);

    dispatch({
      type: "CHANGE_MODAL_STATE",
      payload: TypeModalDrawerLearningExam.TimeoutExam,
    });
  };

  const handleFormatQuestion = (exam: any) => {
    const { dataDraftExam } = state;

    const listQuestion =
      exam &&
      exam?.items.map((item: any) => {
        const currentQuestion = dataDraftExam?.results.find(
          (it) => it.examItemId === item.id
        );

        if (currentQuestion)
          return {
            ...item,
            answer: currentQuestion.examItemOptionIds[0],
          };
        return {
          ...item,
          answer: "",
        };
      });

    dispatch({
      type: "SET_LIST_QUESTIONS",
      payload: listQuestion,
    });
  };

  const handleSelectAnswer = async (idQuestion: string, idOption: string) => {
    if (isView) return;
    const { listQuestions } = state;
    const listQuestionClone = _.cloneDeep(listQuestions);

    const questionIndex = listQuestionClone.findIndex(
      (item: any) => item.id === idQuestion
    );

    if (questionIndex > -1) {
      listQuestionClone[questionIndex].answer = idOption;
    }

    dispatch({
      type: "SET_LIST_QUESTIONS",
      payload: listQuestionClone,
    });

    if (typeLnDContent === EnumTypeLnDContent.TypeExam) {
      await handlePostAnswerExam(idQuestion, idOption);
    }
  };

  const handleCloseDrawer = () => {
    const { listQuestions } = state;
    let isHaveData = false;

    listQuestions.forEach((item) => {
      if (item.answer) {
        isHaveData = true;
        return;
      }
    });

    if (isHaveData) {
      dispatch({
        type: "CHANGE_MODAL_STATE",
        payload: TypeModalDrawerLearningExam.Close,
      });
    } else {
      dispatch({
        type: "SET_LIST_QUESTIONS",
        payload: [],
      });
      handleOpenDrawer(false);
    }
  };

  const checkMissingAnswer = () => {
    const { listQuestions } = state;

    return (listQuestions &&
      listQuestions.filter(
        (question) =>
          question.answer === "" &&
          question.itemType === EnumLnDExamItemType.Question
      ).length) ||
      0;
  };

  const handleSubmitAnswer = () => {
    const count = checkMissingAnswer();

    if (count) {
      dispatch({
        type: "CHANGE_MODAL_STATE",
        payload: TypeModalDrawerLearningExam.MissingAnswer,
      });
    } else {
      submitAnswer();
    }
  };

  const submitAnswer = () => {
    const { listQuestions, examContent } = state;
    const arrAnswer = listQuestions.map((item) => {
      return {
        examItemId: item.id,
        examItemOptionIds: [item.answer],
      };
    });

    handleOpenDrawer(false);

    handleSubmit(examContent.exam.id, arrAnswer);
  };

  const renderQuestionItem = (item: any, index: number) => {
    return (
      <div
        className="lnd-learning-exam__question"
        key={`lnd-learning-exam__question-${index}`}
        ref={refs[item.id]}
        id={item.id}
      >
        <div className="lnd-learning-exam__question-title">
          <div className="lnd-learning-exam__question-left">
            <div className="d-flex align-items-center">
              <span className="mr-2">{index + 1}</span>
              <span>{ISVGArrowQuestion()}</span>
            </div>
          </div>
          <div
            className="lnd-learning-exam__question-right"
            style={{ flexGrow: 1 }}
          >
            <div className="lnd-exam-item__name-text">{item.name}</div>
            <div className="lnd-exam-item__name-desc mb-2">
              {item.description}
            </div>

            {item.attachment && item.attachment.url && (
              <div
                className="lnd-exam-item__attachment"
                style={{ marginBottom: "32px" }}
              >
                <img src={item.attachment.url} alt="lnd question image" />
              </div>
            )}
          </div>
        </div>
        <div className="lnd-learning-exam__question-option">
          {item.listOption.map((option: any, index: number) => {
            if (isView) {
              return renderOptionItem(item.id, option, index);
            } else {
              return (
                <div
                  className={`lnd-learning-exam__option-item ${option.id === item.answer ? "selected" : ""
                    }`}
                  key={`lnd-learning-exam__option-item-${index}`}
                  onClick={() => handleSelectAnswer(item.id, option.id)}
                >
                  <div className="option-title">
                    {LIST_OPTION_QUESTION[index]}
                  </div>
                  <div className="option-value">{option.name}</div>
                </div>
              );
            }
          })}
        </div>
      </div>
    );
  };

  const renderSegmentItem = (item: any, index: number) => {
    return (
      <div
        className="lnd-learning-exam__segment"
        key={`lnd-learning-exam__segment-${index}`}
      >
        <div className="lnd-learning-exam__segment-name">{item?.name}</div>
        <div className="lnd-learning-exam__segment-description">
          {item?.description}
        </div>
      </div>
    );
  };

  const renderOptionItem = (itemId: string, option: any, index) => {
    // console.log("🚀 ~ file: index.tsx ~ line 304 ~ itemId", itemId);
    // console.log("🚀 ~ file: index.tsx ~ line 304 ~ resultLesson", resultLesson);
    const results =
      resultLesson && resultLesson?.learningTurnExam
        ? resultLesson?.learningTurnExam.results
        : null;

    const currentItem =
      results && results.find((result) => result.examItemId === itemId);
    let className = "";

    // console.log("🚀 ~ file: index.tsx ~ line 308 ~ currentItem", currentItem);
    if (currentItem?.answers === option.id) {
      className = "green";
    } else if (
      currentItem &&
      currentItem?.examItemOptionIds.includes(option.id)
    ) {
      className = "red";
    }

    return (
      <div
        className={`lnd-learning-exam__option-item ${className}`}
        key={`lnd-learning-exam__option-item-${index}`}
      >
        <div className="option-title">{LIST_OPTION_QUESTION[index]}</div>
        <div className="option-value">{option.name}</div>
      </div>
    );
  };

  const renderDrawerBody = () => {
    const { examContent, listQuestions } = state;
    const exam = examContent && examContent.exam;
    let indexQuestion = 0;

    return (
      <div className="lnd-learning-exam__wrapper">
        {isView ? (
          <div className="lnd-learning-exam_wrapper-result">
            <div
              className="lnd-learning-modal__header-svg"
              style={{ left: "21%", top: "-27%" }}
            >
              {Icon_background_modal_right()}
            </div>
            {/* <div className="lnd-learning-modal__header-svg">
              {Icon_background_modal_left()}
            </div> */}
            <div
              className="lnd-learning-modal__header-svg"
              style={{ left: "21%", top: "41px" }}
            >
              {Icon_background_modal_bottom()}
            </div>
            <div
              className="lnd-learning-modal__header-svg"
              style={{
                transform: "rotate(180deg)",
                width: "49%",
                height: "84%",
              }}
            >
              {Icon_background_modal_bottom()}
            </div>
            <div className="d-flex align-items-center" style={{ zIndex: 99 }}>
              <div className="icon">{Icon_reward_completed()}</div>
              <div className="text">
                <span>Bạn đã hoàn thành bài tập</span>
                <p>
                  {`${resultLesson?.learningTurnExam?.totalRightAnswers}/${resultLesson?.learningTurnExam?.totalQuestion} câu trả lời đúng`}
                </p>
              </div>
            </div>
          </div>
        ) : null}
        {typeLnDContent === EnumTypeLnDContent.TypeLesson && (
          <div className="lnd-learning-exam_wrapper-info">
            <div className="name">{examContent?.name}</div>
            <div className="description">{examContent?.description}</div>
          </div>
        )}
        <div className="lnd-learning-exam_wrapper-list">
          {listQuestions && listQuestions.length
            ? listQuestions.map((question, index) => {
              if (question.itemType === EnumLnDExamItemType.Question) {
                return renderQuestionItem(question, indexQuestion++);
              } else if (question.itemType === EnumLnDExamItemType.Segment) {
                return renderSegmentItem(question, index);
              }
            })
            : null}
        </div>
      </div>
    );
  };

  const renderDrawerContent = () => {
    const { examContent } = state
    const title = isView
      ? "Bài tập"
      : typeLnDContent === EnumTypeLnDContent.TypeLesson
        ? "Làm bài tập"
        : examContent?.name;

    if(state.isLoading){
      return <React.Fragment>
        {renderLoading()}
      </React.Fragment>
    }

    if (
      typeLnDContent === EnumTypeLnDContent.TypeExam &&
      state.timerTarget === null
    ) {
      return (
        <div style={{ height: "100vh", width: "100%" }}></div>
      );
    }

    return (
      <div className="lnd-learning-drawer__wrapper">
        {/* Header */}
        <div
          className={`lnd-learning-drawer__header ${typeLnDContent === EnumTypeLnDContent.TypeExam ? "exam" : ""
            }`}
        >
          {!(typeLnDContent === EnumTypeLnDContent.TypeExam) && (
            <div
              className="lnd-learning-drawer__header-delete"
              onClick={() => handleCloseDrawer()}
            >
              {ISVGClose(20)}
            </div>
          )}
          <div className="lnd-learning-drawer__header-title">{title}</div>
          {typeLnDContent === EnumTypeLnDContent.TypeExam && (
            <div
              className={`lnd-learning-drawer__header-timer ${state.warningTimerLeft ? "warning" : ""
                }`}
            >
              {state.timerTarget && state.timerTarget !== 1 ? (
                <div className="mr-3">
                  <CounterTimer
                    targetTimer={state.timerTarget}
                    handleExpired={() => handleSubmitTimeOut()}
                    warningTimeLeft={1}
                    handleWarningTimeLeft={() => {
                      dispatch({
                        type: "SET_WARNING_TIME_LEFT",
                        payload: true,
                      });
                    }}
                  />
                </div>
              ) : (
                <div className="mr-3">0:0</div>
              )}
              <div style={{ marginTop: "-5px" }}>{Icon_timer_learning()}</div>
            </div>
          )}
        </div>
        {/* Body */}
        <div className="lnd-learning-drawer__body">{renderDrawerBody()}</div>

        {/* Footer */}
        {!isView && typeLnDContent === EnumTypeLnDContent.TypeLesson ? (
          <div className="lnd-learning-drawer__footer">
            <div className="lnd-learning-drawer__footer-content">
              <HrvComponents.Button
                status="link"
                onClick={() => handleCloseDrawer()}
                size={"medium"}
                className=""
              >
                <span className="">Hủy</span>
              </HrvComponents.Button>
              <HrvComponents.Button
                status="primary"
                onClick={() => handleSubmitAnswer()}
                size={"medium"}
                className=""
              >
                <span className="">Nộp bài</span>
              </HrvComponents.Button>
            </div>
          </div>
        ) : !isView && typeLnDContent === EnumTypeLnDContent.TypeExam ? (
          renderFooterExamQuestion()
        ) : null}
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

  const renderFooterExamQuestion = () => {
    const { examContent, listQuestions } = state;
    const list =
      listQuestions && listQuestions.length
        ? listQuestions.filter(
          (it) => it.itemType === EnumLnDExamItemType.Question
        )
        : [];

    const totalQuestion = list.length;

    const totalAnswer = list.filter((it) => it.answer).length;
    // const listQuestion =
    //   examContent && examContent.items
    //     ? examContent.items.filter(
    //         (item) => item.itemType === EnumLnDExamItemType.Question
    //       )
    //     : [];

    return (
      <div className="lnd-learning-drawer__footer">
        <div className="lnd-learning-exam__footer-wrapper">
          <div className="list-question-footer">
            {list && list.length
              ? list.map((question, index) => {
                return (
                  <div
                    className={`question-footer-item ${question.answer ? "answer" : ""
                      }`}
                    key={question.id}
                    onClick={() => onScrollToItem(question.id)}
                  >
                    {index + 1}
                  </div>
                );
              })
              : null}
          </div>
          <div className="info-btn-footer-exam">
            <div className="info-learning-answer">
              <CircularProgress
                variant="determinate"
                value={Math.round((totalAnswer / totalQuestion) * 100)}
                color="primary"
                size={"40px"}
              // thickness={3.8}
              />
              <div className="info-description">
                {`${totalAnswer}/${totalQuestion}`}
              </div>
            </div>
            <div className="button-submit-exam">
              <HrvComponents.Button
                status="primary"
                onClick={() => onSubmitExam()}
                size={"medium"}
                className=""
              >
                <span className="">Nộp bài</span>
              </HrvComponents.Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderHeaderModal = (type: TypeModalDrawerLearningExam) => {
    switch (type) {
      case TypeModalDrawerLearningExam.Close:
        return <div>Xác nhận thoát</div>;
      case TypeModalDrawerLearningExam.MissingAnswer:
      case TypeModalDrawerLearningExam.MissingAnswerExam:
        return <div>Thiếu câu</div>;
      case TypeModalDrawerLearningExam.TimeoutExam:
        return <div>Bài thi đã hết thời gian làm bài</div>;
      default:
        return null;
    }
  };

  const renderBodyModal = (type: TypeModalDrawerLearningExam) => {
    const missingAnswer = checkMissingAnswer();
    const { listQuestions } = state;
    const questions = listQuestions.filter(
      (it) => it.itemType === EnumLnDExamItemType.Question
    );

    switch (type) {
      case TypeModalDrawerLearningExam.Close:
        return (
          <div className="lnd-modal-goBack__text-title">
            Bạn vẫn chưa hoàn thành bài tập. Nếu bạn thoát bây giờ, hệ thống sẽ
            không lưu lại. Bạn có chắc chắn muốn thoát không?
          </div>
        );
      case TypeModalDrawerLearningExam.MissingAnswer:
      case TypeModalDrawerLearningExam.MissingAnswerExam:
        return (
          <div className="lnd-modal-goBack__text-title">
            {`Bạn còn thiếu ${missingAnswer} câu chưa trả lời. Bạn có chắc muốn nộp bài không?`}
          </div>
        );
      case TypeModalDrawerLearningExam.TimeoutExam:
        return (
          <div className="lnd-modal-goBack__text-title">
            {`Hệ thống ghi nhận bạn đã trả lời ${questions.length - missingAnswer
              }/${questions.length} câu.`}
          </div>
        );
      default:
        return null;
    }
  };

  const renderFooterModal = (type: TypeModalDrawerLearningExam) => {
    switch (type) {
      case TypeModalDrawerLearningExam.Close:
        return (
          <React.Fragment>
            <span>
              <HrvComponents.Button
                status="link"
                onClick={() =>
                  dispatch({
                    type: "CHANGE_MODAL_STATE",
                    payload: TypeModalDrawerLearningExam.None,
                  })
                }
              >
                <span style={{ color: "#021337" }}>Ở lại</span>
              </HrvComponents.Button>
              <HrvComponents.Button
                status="primary"
                onClick={() => {
                  dispatch({
                    type: "CHANGE_MODAL_STATE",
                    payload: TypeModalDrawerLearningExam.None,
                  });
                  dispatch({
                    type: "SET_LIST_QUESTIONS",
                    payload: [],
                  });
                  handleOpenDrawer(false);
                }}
              >
                Thoát
              </HrvComponents.Button>
            </span>
          </React.Fragment>
        );
      case TypeModalDrawerLearningExam.MissingAnswer:
        return (
          <React.Fragment>
            <span>
              <HrvComponents.Button
                status="link"
                onClick={() =>
                  dispatch({
                    type: "CHANGE_MODAL_STATE",
                    payload: TypeModalDrawerLearningExam.None,
                  })
                }
              >
                <span style={{ color: "#021337" }}>Xem lại</span>
              </HrvComponents.Button>
              <HrvComponents.Button
                status="primary"
                onClick={() => {
                  submitAnswer();
                  dispatch({
                    type: "CHANGE_MODAL_STATE",
                    payload: TypeModalDrawerLearningExam.None,
                  });
                  handleOpenDrawer(false);
                }}
              >
                Nộp luôn
              </HrvComponents.Button>
            </span>
          </React.Fragment>
        );
      case TypeModalDrawerLearningExam.MissingAnswerExam:
        return (
          <React.Fragment>
            <span>
              <HrvComponents.Button
                status="link"
                onClick={() =>
                  dispatch({
                    type: "CHANGE_MODAL_STATE",
                    payload: TypeModalDrawerLearningExam.None,
                  })
                }
              >
                <span style={{ color: "#021337" }}>Xem lại</span>
              </HrvComponents.Button>
              <HrvComponents.Button
                status="primary"
                onClick={() => {
                  dispatch({
                    type: "CHANGE_MODAL_STATE",
                    payload: TypeModalDrawerLearningExam.None,
                  });
                  onSubmitExam(true);
                }}
              >
                Nộp luôn
              </HrvComponents.Button>
            </span>
          </React.Fragment>
        );
      case TypeModalDrawerLearningExam.TimeoutExam:
        return (
          <React.Fragment>
            {/* <HrvComponents.Button
              status="link"
              onClick={() =>
                dispatch({
                  type: "CHANGE_MODAL_STATE",
                  payload: TypeModalDrawerLearningExam.None,
                })
              }
            >
              <span style={{ color: "#021337" }}>Xem lại</span>
            </HrvComponents.Button> */}
            <HrvComponents.Button
              status="primary"
              onClick={() => {
                handleOpenDrawer(false);
              }}
            >
              Xem kết quả
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
        className="lnd-learning-drawer-modal"
        size="sm"
        isOpen={state.isOpenModal !== TypeModalDrawerLearningExam.None}
        isBtnClose={false}
        iconClose={
          state.isOpenModal !== TypeModalDrawerLearningExam.TimeoutExam
        }
        headerContent={renderHeaderModal(state.isOpenModal)}
        bodyContent={renderBodyModal(state.isOpenModal)}
        footerContent={renderFooterModal(state.isOpenModal)}
        footerDisabledCloseModal
        afterCloseModal={() =>
          dispatch({
            type: "CHANGE_MODAL_STATE",
            payload: TypeModalDrawerLearningExam.None,
          })
        }
      />
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
      {state.isOpenModal !== TypeModalDrawerLearningExam.None
        ? renderModal()
        : null}
    </React.Fragment>
  );
};
