import { Tooltip } from "@haravan/hrw-react-components";
import * as React from "react";
import {EnumTypeLnDContent, listIconLesson} from "../../CommonHelp/constants";
import {
  ISVGAddNewContentItem,
  ISVGDeleteContentItem,
  ISVGDragAndDrop,
  ISVGDuplicateContentItem,
  ISVGExclamationMark,
  ISVGLndContentEdit,
  ISVGLndContentExam,
  ISVGLndContentLesson,
} from "../../IconSVG";
import "./index.css";

interface LnDContentClassifyProps {
  ref?: any;
  provided?: any;
  isEdit: boolean;
  item: any;
  listItem?: any;
  typeContent?: EnumTypeLnDContent;
  className?: string;
  onChangeView?: Function;
  onChangeData?: Function;
  onAddItem?: Function;
  onCloneItem?: Function;
  onRemoveItem?: Function;
  onClickOutside?: Function;
  onEditItemLnDContent?: Function;
  onViewItemLnDContent?: Function;
  isView?: boolean;
}

interface LnDContentClassifyState {
  dataListContent: any;
}

export const LnDContentClassify: React.FC<LnDContentClassifyProps> = (
  props
) => {
  const {
    provided,
    isEdit,
    isView,
    item,
    listItem,
    typeContent,
    className,
    onChangeView,
    onChangeData,
    onAddItem,
    onCloneItem,
    onRemoveItem,
    onClickOutside,
    onEditItemLnDContent,
    onViewItemLnDContent,
  } = props;

  const [error, setError] = React.useState({
    isError: false,
    message: "",
  });

  const refElements = React.useRef<HTMLDivElement>(null);
  const refInputName = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isEdit) {
      if (refInputName && refInputName.current) {
        // refInputName.current.focus();
      }
    } else {
      if (typeContent === EnumTypeLnDContent.TypeClassify)
        handleValidateInput(item.name);
      else if(typeContent === EnumTypeLnDContent.TypeExam)
        handleValidateDuplicate(item.name);
    }
  }, [props.isEdit, listItem]);

  React.useEffect(() => {
    if (isEdit && refInputName && refInputName.current) {
      refInputName.current.focus();
    }
  }, [isEdit]);

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


  const handleValidateInput = (value: string) => {
    if (!value) {
      setError({
        isError: true,
        message:
          item.itemType === 0
            ? "Vui l??ng nh???p t??n ph??n ??o???n"
            : typeContent === EnumTypeLnDContent.TypeLesson
            ? "Vui l??ng nh???p t??n b??i h???c"
            : typeContent === EnumTypeLnDContent.TypeExam
            ? "Vui l??ng nh???p t??n b??i thi"
            : "Vui l??ng nh???p t??n ph??n lo???i",
      });

      return;
    }
    setError({
      isError: false,
      message: "",
    });
  };

  const handleValidateDuplicate = (value: string) => {
    if (value && listItem && listItem.length) {
      const valueQuery = value.replace(/\s/g, "");
      const isExist = listItem.findIndex(
        (item) => item.name.replace(/\s/g, "") === valueQuery
      );

      if (isExist !== -1) {
        setError({
          isError: true,
          message: "T??n b??i thi ???? ???????c s??? d???ng"
        });

        return;
      }
    }

    setError({
      isError: false,
      message: "",
    });

  }

  const renderContent = () => {
    let missingData = true;

    if (typeContent === EnumTypeLnDContent.TypeClassify || isView) {
      missingData = false;
    } else {
      missingData = !item.isValidItem;
    }

    let placeHolderName =
      typeContent === EnumTypeLnDContent.TypeLesson
        ? "T??n b??i h???c"
        : typeContent === EnumTypeLnDContent.TypeExam
        ? "T??n b??i thi"
        : item.itemType === 0
        ? "T??n ph??n ??o???n"
        : "T??n ph??n lo???i";

    let placeHolderDesc =
      typeContent === EnumTypeLnDContent.TypeLesson ||
      typeContent === EnumTypeLnDContent.TypeExam
        ? "M?? t??? ng???n (kh??ng qu?? 200 k?? t???)"
        : item.itemType === 0
        ? "Nh???p m?? t??? cho ph??n ??o???n"
        : "Nh???p m?? t??? cho ph??n lo???i (kh??ng b???t bu???c)";

    const iconLesson = typeContent === EnumTypeLnDContent.TypeLesson && item.lesson.contentType ? listIconLesson[item.lesson.contentType]: listIconLesson[0]

    return (
      <div className={`${className} ${missingData || error.isError ? "error" : ""} `} ref={refElements} >
        <div className="icon-drag-drop">
          <span className="button-drag-drop" {...provided.dragHandleProps}>
            {ISVGDragAndDrop()}
          </span>
        </div>
        <div className="">
          <div
            className={`lnd-content-item__body ${
              typeContent !== EnumTypeLnDContent.TypeClassify ? "d-flex" : ""
            }`}
          >
            {(typeContent === EnumTypeLnDContent.TypeLesson) ? (
              <div className="mr-3">
                <Tooltip title={iconLesson.tooltip}>
              <div className="icon-lesson">{iconLesson.icon}</div>
              </Tooltip>
              </div>
            ) : typeContent === EnumTypeLnDContent.TypeExam ? (
              <div className="mr-3">
                <Tooltip title={iconLesson.tooltip}>
                  {iconLesson.icon}
                </Tooltip>
                </div>
            ) : null}
            <div className="lnd-content-item__body__content flex-grow-1">
              <div className="lnd-content-item__control relative">
                <input
                  placeholder={placeHolderName}
                  value={item.name}
                  type="text"
                  onChange={(e: any) => {
                    if (e.target.value)
                      setError({ isError: false, message: "" });
                    onChangeData("name", e.target.value);
                  }}
                  className={`lnd-content-item__input-name ${
                    error.isError ? "error" : ""
                  }`}
                  maxLength={200}
                  ref={refInputName}
                  // maxLength={maxLength ? maxLength : null}
                  // onFocus={() => setIsFocus(true)}
                  onBlur={(e) => handleValidateInput(e.target.value)}
                  disabled={typeContent !== EnumTypeLnDContent.TypeClassify}
                />
                {error.isError && error.message && (
                  <div className="input-validate-error">{error.message}</div>
                )}
                {!item.name && error.isError && error.message && (
                  <span className="span-validate-empty">*</span>
                )}
              </div>
              <div className="lnd-content-item__control">
                {/* <HrvComponents.Input
              required={true}
              placeholder="Nh???p m?? t??? cho ph??n lo???i"
              onChange={(value: any) => onChangeData("description", value)}
              value={item.description}
              // onSetFocus={(el) => (refGroupName.current = el)}
            /> */}
                <input
                  placeholder={placeHolderDesc}
                  value={item.description}
                  type="text"
                  onChange={(e: any) =>
                    onChangeData("description", e.target.value)
                  }
                  className="lnd-content-item__input-description"
                  maxLength={200}
                  // onFocus={() => setIsFocus(true)}
                  // onBlur={() => setIsFocus(false)}
                  disabled={typeContent !== EnumTypeLnDContent.TypeClassify}
                />
              </div>
            </div>
          </div>

          <div className="lnd-content-item__action">
            {typeContent ? (
              <div
                className="lnd-content-item__btn"
                onClick={() => onEditItemLnDContent(typeContent)}
              >
                {ISVGLndContentEdit()}
              </div>
            ) : null}
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
              onClick={() => onAddItem(typeContent)}
              // onClick={(e) => e.stopPropagation()}
              // onClick={() => onAddItem(EnumTypeConfigRatingItem.TypeGroup)}
            >
              <div className="">{ISVGAddNewContentItem()}</div>
              {/* <HrvComponents.Popover
                key={Utils.getNewGuid()}
                content={renderAddPopover()}
                placement="topRight"
              >
                <div className="">{ISVGConfigAddMoreItem()}</div>
              </HrvComponents.Popover> */}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContentView = () => {
    let nameContent = item.name ? item.name : "";
    let missingData = true;

    if (typeContent === EnumTypeLnDContent.TypeClassify || isView) {
      nameContent ? missingData = false : missingData = true;
    } else {
      missingData = !item.isValidItem;
    }

    if (!nameContent) {
      nameContent =
        typeContent === EnumTypeLnDContent.TypeLesson
          ? "T??n b??i h???c"
          : typeContent === EnumTypeLnDContent.TypeExam
          ? "T??n b??i thi"
          : item.itemType === 0
          ? "T??n ph??n ??o???n"
          : "T??n ph??n lo???i";
    }

    const iconLesson = typeContent === EnumTypeLnDContent.TypeLesson ? listIconLesson[item.lesson.contentType]: listIconLesson[0]

    return (
      <div
        className={`${className} ${isView ? "disable-drag" : ""}  ${missingData || error.isError ? "error" : ""}`}
        onClick={() => {
          isView
            ? onViewItemLnDContent && onViewItemLnDContent()
            : onChangeView();
        }}
      >
        <div className="lnd-content-item__wrapper">
          <div className="icon-drag-drop" {...provided.dragHandleProps}>
            {!isView && (
              <span className="button-drag-drop">{ISVGDragAndDrop()}</span>
            )}
          </div>

          <div className="lnd-content-item__group-body d-flex align-items-center">
            {/* Icon Exam */}
            {typeContent === EnumTypeLnDContent.TypeLesson && iconLesson ? (
              <div className="icon mr-3">
                <Tooltip title={iconLesson.tooltip}>
                  <div className="icon-lesson">{iconLesson.icon}</div>
                </Tooltip>
              </div>
            ) : typeContent === EnumTypeLnDContent.TypeExam ? (
              <div className="icon mr-3">
                <Tooltip title={iconLesson.tooltip}>
                  {iconLesson.icon}
                </Tooltip>
                </div>
            ) : null}

            <div className="div flex-grow-1">
              <div
                // className={`lnd-content-item__name relative ${
                //   error.isError && !item.name ? "error" : error.isError && item.name ? "error name" : ""
                // }`}
                className={`lnd-content-item__name relative ${typeContent === EnumTypeLnDContent.TypeClassify ? "classify": ""}`}
              >
                <span>{nameContent}</span>
                {/* {!item.name && error.isError && error.message && (
                  <span className="span-validate-empty-view ml-2">*</span>
                )} */}
              </div>
              {/* {error.isError && error.message && (
                <div className="input-validate-error">{error.message}</div>
              )} */}
              {item.description && (
                <div className="lnd-content-item__description">
                  {item.description ? item.description : ""}
                </div>
              )}
            </div>
          </div>
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
