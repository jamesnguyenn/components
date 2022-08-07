import * as React from "react";
import { ISVGClose, ISVGDragSmall, ISVGExclamationMark } from "../../IconSVG";
import "./index.css";

enum EnumLnDExamItemType {
  Segment = 0, 
  Question = 1,
}
enum EnumLnDExamQuestionType {
  MultiChoice = 0,
  TrueFalse = 1,
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

interface LnDExamBoxProps {
  totalQuestion?: number;
  totalScore?: number;
  listData?: ILnDContentExamItem[];
  isView?: boolean;
  onScrollToItem?: Function;
  itemFocus?: any;
}

interface LnDExamBoxState {
  dataListContent: any;
}

export const LnDExamBox: React.FC<LnDExamBoxProps> = (props) => {
  const { totalQuestion, totalScore, listData, isView, onScrollToItem } = props;
  const [itemSelected, setItemSelected] = React.useState<string>("");
  const [itemPressed, setItemPressed] = React.useState<string>("");

  const refsQuestion = listData.reduce((acc, value) => {
    acc[value.id] = React.createRef();
    return acc;
  }, {});

  React.useEffect(() => {
    if (props.itemFocus) {
      setItemSelected(props.itemFocus);
      handleOnScrollFocus(props.itemFocus);
    }
  }, [props.itemFocus]);

  const handleSelectedItem = (id: string) => {
    setItemSelected(id);
    onScrollToItem(id);
  };

  const handleOnScrollFocus = (id: string) => {
    // refsQuestion[id].current.scrollIntoView({
    //   behavior: "smooth",
    //   block: "start",
    // });
  };

  const handlePressedItem = (id: string) => {
    setItemPressed(id);
  };

  const checkHaveData = (item: ILnDContentExamItem) => {
    let isValid = true;

    if (!item.name || !item.answer || item.point === null || item.point > 100) {
      isValid = false;
    }

    const listNameOption = new Set();

    item.listOption.forEach((option) => {
      if (!option.name) {
        isValid = false;
        return;
      } else {
        listNameOption.add(option.name.replace(/\s/g, ""));
      }
    });

    if (item.listOption.length !== listNameOption.size) {
      isValid = false;
    }

    return isValid;
  };

  const renderExamQuestionList = () => {
    return (
      <>
        {listData.map((itemQuestion, index) => {
          if (itemQuestion.itemType === EnumLnDExamItemType.Segment)
            return (
              <div
                key={itemQuestion.id || index}
                className="lnd-exam-item___segment"
                id={itemQuestion.id}
                ref={refsQuestion[itemQuestion.id]}
              >
                <div className="lnd-exam-item___segment-content">
                  {/* <span>{ISVGDragSmall()}</span> */}
                  <span className="lnd-exam-tem__ques-name">
                    {itemQuestion.name ?? "Phân đoạn"}
                  </span>
                </div>
                {/* <div className="nd-exam-item___segment-action">{ISVGClose(8)}</div> */}
              </div>
            );
          else if (itemQuestion.itemType === EnumLnDExamItemType.Question) {
            let isError = checkHaveData(itemQuestion);
            return (
              <div
                key={itemQuestion.id || index}
                className={`lnd-exam-item___ques ${
                  itemQuestion.id === itemSelected && isError
                    ? "selected"
                    : itemQuestion.id === itemSelected && !isError
                    ? "selected error"
                    : itemQuestion.id === itemPressed
                    ? "pressed"
                    : ""
                }`}
                onClick={() => handleSelectedItem(itemQuestion.id)}
                onMouseDown={() => handlePressedItem(itemQuestion.id)}
                onMouseUp={() => handlePressedItem("")}
                id={itemQuestion.id}
                ref={refsQuestion[itemQuestion.id]}
              >
                <div className="lnd-exam-item___ques-content">
                  {!isView && (
                    <span className="icon-drag-drop-exam">
                      {ISVGDragSmall()}
                    </span>
                  )}
                  <p className={`question-dot ${isError ? "" : "error"}`}></p>
                  <p className="lnd-exam-tem__ques-name">
                    {itemQuestion.name || "Câu hỏi"}
                  </p>
                </div>
                {!isView && (
                  <div className="lnd-exam-item___ques-action">
                    {ISVGClose(12)}
                  </div>
                )}
              </div>
            );
          }
        })}
      </>
    );
  };

  return (
    <React.Fragment>
      <div className="lnd-box-info" style={{maxHeight: "598px"}}>
        {/* Box statistic */}
        <div className="lnd-box-info__general">
          <div className="lnd-box-info__general__item">
            <div className="lnd-box-info__general__number">{totalQuestion}</div>
            <div className="lnd-box-info__general__title">
              Câu hỏi đã thiết lập
            </div>
          </div>
          <div className="lnd-box-info__general__item">
            <div className="lnd-box-info__general__number">
              <span
                className={`${
                  totalScore !== 100 && totalScore !== 0
                    ? "error-total-score"
                    : ""
                }`}
              >
                {totalScore}
              </span>
              <span className="lnd-box-info__general__number-helper">/100</span>
            </div>
            <div className="lnd-box-info__general__title">
              Điểm đã thiết lập
            </div>
          </div>
          {/* Update validate total Score */}
        </div>
        {totalScore !== 100 && totalScore !== 0 && (
          <div className="lnd-box-exam__error">
            <div className="lnd-box-exam__error-icon">
              {ISVGExclamationMark()}
            </div>
            <div className="lnd-box-exam__error-msg">
              Vui lòng cân đối thang điểm để tổng điểm bài thi là 100 điểm
            </div>
          </div>
        )}
        {/* Box info exam */}
        {renderExamQuestionList()}
      </div>
    </React.Fragment>
  );
};
