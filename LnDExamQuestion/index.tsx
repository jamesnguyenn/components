import * as React from "react";
import * as HrvComponents from "@haravan/hrw-react-components";
import * as Utils from "../../../../utils/env";
import {
  ISVGAddNewContentItem,
  ISVGArrowQuestion,
  ISVGDeleteContentItem,
  ISVGDragAndDrop,
  ISVGDuplicateContentItem,
  ISVGIconImage,
  Icon_add_option_question,
  Icon_delete_option_question,
} from "../../IconSVG";
import "./index.css";
import { api_upload_file } from "../../../../utils/env";
import { CustomInput } from "../CustomInput";
import {
  LIST_OPTION_QUESTION,
  EnumLnDExamType,
  EnumLnDExamQuestionType,
} from "../../CommonHelp/constants";

interface LnDExamQuestionProps {
  ref?: any;
  provided?: any;
  isEdit: boolean;
  indexItem?: number;
  key?: number | string;
  item: any;
  typeContent?: any;
  className?: string;
  onChangeView?: Function;
  onChangeData?: Function;
  onAddItem?: Function;
  onCloneItem?: Function;
  onRemoveItem?: Function;
  onClickOutside?: Function;
  onEditItemLnDContent?: Function;
  typeQuestion?: EnumLnDExamQuestionType;
  isView?: boolean;
  handleError?: Function;
}

interface LnDExamQuestionState {
  dataListContent: any;
}

export const LnDExamQuestion: React.FC<LnDExamQuestionProps> = (props) => {
  const {
    provided,
    isEdit,
    item,
    key,
    typeContent,
    className,
    onChangeView,
    onChangeData,
    onAddItem,
    onCloneItem,
    onRemoveItem,
    onClickOutside,
    typeQuestion,
    indexItem,
    isView,
  } = props;
  const [error, setError] = React.useState<any>({});
  const [newOption, setNewOption] = React.useState<string>("");
  const refElements = React.useRef<HTMLDivElement>(null);
  const refInputName = React.useRef<HTMLInputElement>(null);

  let refInputOption = {};

  item.listOption.map((option) => {
    refInputOption[option.id] = React.createRef<HTMLInputElement>();
  });

  React.useEffect(() => {
    if (isEdit) {
      if (refInputName && refInputName.current) {
        refInputName.current.focus();
      }
    } else {
      handleValidateInput("name", item.name);
    }
  }, [props.isEdit]);

  React.useEffect(() => {
    if (
      newOption &&
      refInputOption[newOption] &&
      refInputOption[newOption].current
    ) {
      refInputOption[newOption].current.focus();
    }
  }, [newOption]);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (refElements.current && !refElements.current.contains(event.target)) {
        onClickOutside && onClickOutside();
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, [onClickOutside]);

  React.useEffect(() => {
    if (!props.isEdit) {
      const error = checkValidQuestion(props.item);
      setError(error);
    }
  }, [props.isEdit]);

  const uploadBanner = async (files) => {
    if (!files.length) {
      Notification["error"]({
        message: "File không đúng định dạng cho phép. Vui lòng kiểm tra lại.",
      });
      return;
    }

    const file = files[0];
    console.log("files[0]", file);

    if (file.size > 30000000) {
      Notification["error"]({
        message: "File vượt quá dung lượng cho phép. Vui lòng kiểm tra lại.",
      });
      return;
    }

    await api_upload_file(file, file.name).then((result) => {
      if (result) {
        onChangeData("attachment", { ...result });
      }
    });
  };

  const checkValidQuestion = (item) => {
    const error = {};

    if (!item.name) error["name"] = "Vui lòng nhập câu hỏi";

    if (item.point === null && typeContent === EnumLnDExamType.Exam)
      error["point"] = "Vui lòng nhập điểm cho câu hỏi này";

    if(item.point && item.point > 100 && typeContent === EnumLnDExamType.Exam){
      error["point"] = "Điểm tương ứng phải nhỏ hơn hoặc bằng 100"
    }

    if (!item.answer) error["answer"] = "Vui lòng chọn đáp án đúng";

    //check option
    item.listOption.forEach((option) => {
      //check empty option
      if (!option.name) {
        error[option.id] = "Lựa chọn không thể để trống";
      } else {
        //check duplicate option
        const indexOption = item.listOption.findIndex(
          (item) =>
            item.name.replace(/\s/g, "") === option.name.replace(/\s/g, "") &&
            item.id !== option.id
        );

        if (indexOption !== -1) error[option.id] = "Trùng lựa chọn";
      }
    });

    return error;
  };

  const handleValidateInput = (
    key: string,
    value: string,
    optionId?: string
  ) => {
    const { listOption } = item;

    switch (key) {
      case "name":
        if (!value) setError({ ...error, name: "Vui lòng nhập câu hỏi" });
        else setError({ ...error, name: "" });
        break;
      case "option":
        if (!value)
          setError({ ...error, [optionId]: "Lựa chọn không thể để trống" });
        else {
          //check option is exist
          const indexOption = listOption.findIndex(
            (item) =>
              item.name.replace(/\s/g, "") === value.replace(/\s/g, "") &&
              item.id !== optionId
          );
          if (indexOption !== -1)
            setError({ ...error, [optionId]: "Trùng lựa chọn" });
          else setError({ ...error, [optionId]: "" });
        }
        break;
      case "point":
        if (value === null) {
          setError({
            ...error,
            point: "Vui lòng nhập điểm cho câu hỏi này",
          });

          props.handleError &&
            props.handleError("point", "Vui lòng nhập điểm cho câu hỏi này");
        } else {
          if (+value > 100) {
            setError({
              ...error,
              point: "Điểm tương ứng phải nhỏ hơn hoặc bằng 100",
            });

            props.handleError &&
              props.handleError(
                "point",
                "Điểm tương ứng phải nhỏ hơn hoặc bằng 100"
              );
          } else {
            setError({ ...error, point: "" });
            props.handleError && props.handleError("point", "");
          }
        }
        break;
      default:
        break;
    }
  };

  const handleChangeOption = (id: string, value: string) => {
    const { listOption } = item;
    const optionsClone = [...listOption];

    const index = optionsClone.findIndex((item) => item.id === id);

    if (index !== -1) {
      optionsClone[index].name = value;
    }

    onChangeData("listOption", optionsClone);
  };

  const handleAddOption = () => {
    const { listOption } = item;
    const optionsClone = [...listOption];

    const newOption = {
      id: Utils.getNewGuid(),
      name: "",
    };

    optionsClone.push(newOption);

    onChangeData("listOption", optionsClone);

    setNewOption(newOption.id);
  };

  const handleDeleteOption = (id: string) => {
    //check option delete is answer
    if (item.answer === id) {
      setError({ ...error, answer: "Vui lòng chọn đáp án đúng", [id]: "" });
    } else {
      setError({ ...error, [id]: "" });
    }

    const { listOption } = item;
    const optionsClone = [...listOption];

    const index = optionsClone.findIndex((item) => item.id === id);

    if (index !== -1) {
      optionsClone.splice(index, 1);
    }

    onChangeData("listOption", optionsClone);
  };

  const handlePressEnter = (event, id: string) => {
    if (event.keyCode !== 13) return;

    if (item.listOption.length === 26) return;

    const { listOption } = item;
    const optionsClone = [...listOption];
    const index = optionsClone.findIndex((item) => item.id === id);

    if (index !== -1 && index < optionsClone.length - 1) {
      //focus next option
      const nextOption = optionsClone[index + 1];
      refInputOption[nextOption.id].current.focus();
    } else if (index !== -1 && index === optionsClone.length - 1) {
      //add new option
      handleAddOption();
    }
  };

  const renderContent = () => {
    let isError = false;

    Object.keys(error).forEach((key) => {
      if (error[key]) {
        isError = true;
        return;
      }
    });

    return (
      <div
        className={`${className} ${isError ? "error" : ""}`}
        ref={refElements}
      >
        <div className="icon-drag-drop">
          <span className="button-drag-drop" {...provided.dragHandleProps}>
            {ISVGDragAndDrop()}
          </span>
        </div>
        <div className="">
          {/* render general info */}
          <div className="lnd-exam-item__body__content">
            <div className="lnd-exam-item__body__index">
              <div style={{ marginTop: "1.5px" }}>{indexItem + 1}</div>
              <div className="">{ISVGArrowQuestion()}</div>
            </div>
            <div className="lnd-exam-item__body__info flex-grow-1">
              <div
                className="lnd-content-item__control"
                style={{ position: "relative" }}
              >
                <input
                  placeholder={"Câu hỏi"}
                  value={item.name}
                  type="text"
                  onChange={(e: any) => {
                    if (e.target.value) setError({ ...error, name: "" });
                    onChangeData("name", e.target.value);
                  }}
                  className={`lnd-content-item__input-name ${
                    error["name"] ? "error" : ""
                  }`}
                  // maxLength={200}
                  ref={refInputName}
                  // onFocus={() => setIsFocus(true)}
                  onBlur={(e) => handleValidateInput("name", e.target.value)}
                  onFocus={(e) => e.target.select()}
                />
                {error["name"] ? (
                  <div className="input-validate-error-field">
                    {error["name"]}
                  </div>
                ) : null}

                {error["name"] && (
                  <span className="span-validate-empty-question">*</span>
                )}
              </div>
              <div className="lnd-content-item__control">
                <input
                  placeholder={"Nhập mô tả cho câu hỏi"}
                  value={item.description}
                  type="text"
                  onChange={(e: any) =>
                    onChangeData("description", e.target.value)
                  }
                  className="lnd-content-item__input-description"
                  // maxLength={200}
                  // onFocus={() => setIsFocus(true)}
                  // onBlur={() => setIsFocus(false)}
                />
              </div>
              {item.attachment && item.attachment.url ? (
                <>
                  <div className="add-image" style={{ width: "fit-content" }}>
                    <HrvComponents.FileUpload
                      onChange={uploadBanner}
                      type="drag"
                      maxSize={30}
                      showNotify={false}
                      accept={
                        "image/tif,image/gif,image/jpg,image/jpeg,image/png"
                      }
                    >
                      <div className="lnd__exam__upload__container">
                        <div className="lnd__exam__upload__box">
                          <ISVGIconImage />
                          <div style={{ marginLeft: "12px" }}>
                            Thay thế hình ảnh
                          </div>
                        </div>
                      </div>
                    </HrvComponents.FileUpload>
                  </div>
                  <div className="lnd-question-image ">
                    <img src={item.attachment.url} alt="lnd-question-lnd" />
                    <div
                      className="lnd-question-image__delete"
                      onClick={() => onChangeData("attachment", null)}
                    >
                      {Icon_delete_option_question("#ffffff")}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="add-image" style={{ width: "fit-content" }}>
                    <HrvComponents.FileUpload
                      onChange={uploadBanner}
                      type="drag"
                      maxSize={30}
                      showNotify={false}
                      accept={
                        "image/tif,image/gif,image/jpg,image/jpeg,image/png"
                      }
                    >
                      <div className="lnd__exam__upload__container">
                        <div className="lnd__exam__upload__box">
                          <ISVGIconImage />
                          <div style={{ marginLeft: "12px" }}>
                            Thêm hình ảnh
                          </div>
                        </div>
                      </div>
                    </HrvComponents.FileUpload>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* render option of questions */}
          <div className="lnd-exam-item__option">
            <div className="lnd-exam-item__option__title">Các lựa chọn</div>
            <div className="lnd-exam-item__option__list">
              {item.listOption.map((option, index) => {
                return (
                  <React.Fragment>
                    <div
                      className={`lnd-exam-item__option__list-item ${
                        error[option.id] ? "error" : ""
                      }`}
                      key={`lnd-exam-item__option__list-item-${index}`}
                    >
                      <div
                        className={`option-title ${
                          error[option.id] ? "error" : ""
                        }`}
                      >
                        {LIST_OPTION_QUESTION[index]}
                      </div>
                      <div className="option-value flex-grow-1">
                        {typeQuestion ===
                        EnumLnDExamQuestionType.MultiChoice ? (
                          <>
                            <input
                              id={option.id}
                              ref={refInputOption[option.id]}
                              placeholder={"Thêm lựa chọn "}
                              value={option.name}
                              type="text"
                              onChange={(e: any) => {
                                handleValidateInput(
                                  "option",
                                  e.target.value,
                                  option.id
                                );
                                handleChangeOption(option.id, e.target.value);
                              }}
                              className="lnd-content-item__input-name"
                              maxLength={200}
                              // onFocus={() => setIsFocus(true)}
                              onBlur={(e) =>
                                handleValidateInput(
                                  "option",
                                  e.target.value,
                                  option.id
                                )
                              }
                              onKeyDown={(e) => {
                                handlePressEnter(e, option.id);
                              }}
                            />
                          </>
                        ) : (
                          <span style={{}}>{option.name}</span>
                        )}
                      </div>
                      {item.listOption.length > 1 &&
                        item.questionType ===
                          EnumLnDExamQuestionType.MultiChoice && (
                          <div
                            className="icon-delete"
                            onClick={() => handleDeleteOption(option.id)}
                          >
                            {Icon_delete_option_question()}
                          </div>
                        )}
                    </div>
                    {error[option.id] ? (
                      <div className="input-validate-error-field">
                        {error[option.id]}
                      </div>
                    ) : null}
                  </React.Fragment>
                );
              })}
            </div>
            {item.questionType === EnumLnDExamQuestionType.MultiChoice &&
              item.listOption.length < 26 && (
                <div
                  className="lnd-exam-item__option__add-option"
                  onClick={() => handleAddOption()}
                >
                  <div className="mr-2">{Icon_add_option_question()}</div>
                  <div className="">Thêm lựa chọn</div>
                </div>
              )}
          </div>

          {/* render answer */}
          <div
            className={`lnd-exam-item__answer ${
              error["answer"] ? "error" : ""
            }`}
          >
            <div className="lnd-exam-item__option__title">Đáp án đúng</div>
            <div className="lnd-exam-item__option__helper">
              ✍🏻 Vui lòng chọn 1 đáp án đúng
            </div>
            <div className="lnd-exam-item__answer__list">
              {item.listOption.map((option, index) => {
                return (
                  <div
                    className={`lnd-exam-item__answer__list-item ${
                      option.id === item.answer ? "isTrue" : ""
                    }`}
                    key={`lnd-exam-item__answer__list-item-${index}`}
                    onClick={() => {
                      setError({ ...error, answer: "" });
                      onChangeData("answer", option.id);
                    }}
                  >
                    {LIST_OPTION_QUESTION[index]}
                  </div>
                );
              })}
            </div>
            {error["answer"] ? (
              <div
                className="input-validate-error-field"
                style={{ marginTop: "12px" }}
              >
                {error["answer"]}
              </div>
            ) : null}
          </div>

          {/* render point */}
          {item.point !== null ? (
            <div className="lnd-exam-item__point">
              <div className="lnd-exam-item__option__title">Điểm tương ứng</div>
              <div className="lnd-exam-item__option__helper">
                ✍🏻 Vui lòng cân đối thang điểm để tổng điểm bài thi là 100 điểm
              </div>
              <div className="lnd-exam-item__point__input">
                <CustomInput
                  onChangeText={(value: any) => {
                    handleValidateInput("point", value);
                    onChangeData("point", value);
                  }}
                  label="Nhập điểm cho câu hỏi này"
                  value={item.point ?? ""}
                  type="number"
                  isError={error["point"] ? true : false}
                  onBlur={() => handleValidateInput("point", item.point)}
                  handleFocus={(e) => e.target.select()}
                />
                {error["point"] && (
                  <div className="input-validate-error-field">
                    {error["point"]}
                  </div>
                )}
              </div>
            </div>
          ) : null}

          <div
            className="lnd-content-item__action"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="lnd-content-item__btn"
              onClick={() => onCloneItem()}
            >
              {ISVGDuplicateContentItem()}
            </div>

            <div
              className="lnd-content-item__btn"
              onClick={() => onRemoveItem()}
            >
              {ISVGDeleteContentItem()}
            </div>

            <div
              className="lnd-content-item__btn"
              onClick={() => onAddItem()}
              // onClick={(e) => e.stopPropagation()}
              // onClick={() => onAddItem(EnumTypeConfigRatingItem.TypeGroup)}
            >
              <div className="">{ISVGAddNewContentItem()}</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContentView = () => {
    const { listOption } = item;
    let isError = false;

    Object.keys(error).forEach((key) => {
      if (error[key]) {
        isError = true;
        return;
      }
    });

    return (
      <div
        className={`${className} ${isView ? "disable-drag" : ""} ${
          isError ? "error" : ""
        }`}
        onClick={() => {
          isView ? null : onChangeView();
        }}
      >
        <div className="lnd-content-item__wrapper">
          <div className="icon-drag-drop" {...provided.dragHandleProps}>
            {!isView && (
              <span className="button-drag-drop">{ISVGDragAndDrop()}</span>
            )}
          </div>
          <div className="lnd-exam-option__view__body">
            <div className="lnd-exam-item__body__index-view">
              <div className="lnd-exam-item__body__index-left">
                <div className="d-flex align-items-center">
                  <span>{indexItem + 1}</span>
                  <span>{ISVGArrowQuestion()}</span>
                </div>
              </div>
              <div
                className="lnd-exam-item__body__index-right"
                style={{ flexGrow: 1 }}
              >
                <div
                  // className={`lnd-exam-item__name mb-2 ${
                  //   error["name"] ? "error" : ""
                  // }`}
                  className="lnd-exam-item__name mb-2"
                >
                  <div className="lnd-exam-item__name-text mb-1">
                    {item.name ? item.name : "Câu hỏi"}
                  </div>
                  {/* {error["name"] ? (
                    <div className="input-validate-error-field">
                      {error["name"]}
                    </div>
                  ) : null}
                  {error["name"] && (
                    <span className="span-validate-empty-question">*</span>
                  )} */}
                </div>
                <div className="lnd-exam-item__name-desc mb-2">
                  {item.description
                    ? item.description
                    : "Nhập mô tả cho câu hỏi"}
                </div>
                {item.attachment && item.attachment.url && (
                  <div
                    className="lnd-question-image"
                    style={{ marginBottom: "32px" }}
                  >
                    <img src={item.attachment.url} alt="lnd question image" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex-grow-1">
              {/* render list option */}
              <div className="lnd-exam-item__options-view">
                {item.listOption.map((option, index) => {
                  return (
                    <>
                      <div
                        className={`lnd-exam-item__options-view__item ${
                          option.id === item.answer ? "isTrue" : ""
                        }`}
                        key={`lnd-exam-item__options-view__item-${index}`}
                      >
                        <div className="lnd-exam-item__options-view__item__title">
                          {LIST_OPTION_QUESTION[index]}
                        </div>
                        <div className="lnd-exam-item__options-view__item__value">
                          {option.name ? option.name : "Thêm lựa chọn"}
                        </div>
                      </div>
                      {/* {error[option.id] ? (
                        <div
                          className="input-validate-error-field"
                          style={{ margin: "0 9px" }}
                        >
                          {error[option.id]}
                        </div>
                      ) : null} */}
                    </>
                  );
                })}
              </div>
            </div>
          </div>
          {item.point ? (
            <div className="lnd-exam-question__point">{`${item.point} đ`}</div>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <React.Fragment>
      {isEdit ? renderContent() : renderContentView()}
    </React.Fragment>
  );
};
