import * as React from "react";
import * as HrvComponents from "@haravan/hrw-react-components";
import {
    EnumTypeLnDContent,
    TEXT_TOOLTIP_SCORE,
    TEXT_TOOLTIP_TEST_SCORE,
} from "../../CommonHelp/constants";
import { ISVGQuestionCircle, ISVGExclamationMark } from "../../IconSVG";
import {
    getListScoreRateExam,
    putSubjectExamScoreRate,
} from "../../CommonHelp/ApiLnD";
import "./index.css";

interface LnDBoxInfoProps {
    subjectContentId?: string;
    dataContent?: any;
    onChangeData?: Function;
    isView?: boolean;
    handleError?: Function;
    isEdit?: boolean;
    maxHeight?: string;
    onSaveDraft?: Function;
}

interface LnDBoxInfoState {
    dataListContent: any;
}

export const LnDBoxInfo: React.FC<LnDBoxInfoProps> = ({
    dataContent,
    onChangeData,
    isView,
    handleError,
    isEdit,
    subjectContentId,
    maxHeight,
    onSaveDraft
}) => {
    const [error, setError] = React.useState<any>({});
    const [isAutoExamScore, setIsAutoExamScore] = React.useState<boolean>(true);
    const [listExam, setListExam] = React.useState<any>([]);

    React.useEffect(() => {
        let isError = false;

        if (!dataContent.passingScore) isError = true;

        if (dataContent.passingScore > 100 || dataContent.passingScore < 0)
            isError = true;

        listExam.forEach((item) => {
            if (!item.scoreRate) isError = true;
        });

        if (error["scoreRate"]) isError = true;

        handleError(isError);
    }, [error, dataContent.passingScore, listExam]);

    React.useEffect(() => {
        getListExamScoreRate();
    }, [dataContent.items]);

    const getListExamScoreRate = async () => {
        if (!subjectContentId || !dataContent || !dataContent.items || !dataContent?.items.length) return;

        const { items } = dataContent;

        const listExamContent = items.filter((item, index) => {
            return item.type === EnumTypeLnDContent.TypeExam;
        });

        if(listExam.length === listExamContent.length) return;

        const result = await getListScoreRateExam(subjectContentId);
        let listExamScoreRate = null;

        if (result && !result.error) {
            listExamScoreRate = result.data?.data
        }

        const mapListExam = [];
        listExamContent.forEach((item, index) => {
            mapListExam.push({
                ...item?.exam,
                name: item?.name,
                scoreRate: listExamScoreRate.find(it => it.id === item.itemId).scoreRate
            });
        });

        //setError
        let totalScoreRate = 0;
        let checkError = { ...error };
        mapListExam.forEach((item, index) => {
            if (!item.scoreRate) {
                checkError = {
                    ...checkError,
                    [`${item.itemId}`]: "Vui l??ng nh???p t??? l??? ??i???m b??i thi",
                };
            } else {
                totalScoreRate += item.scoreRate;
            }
        });

        if (totalScoreRate !== 100) {
            setError({
                ...checkError,
                scoreRate: "T???ng t??? l??? c??c b??i thi ph???i l?? 100%",
            });
        } else {
            setError({
                ...checkError,
                scoreRate: "",
            });
        }
        setListExam(mapListExam);
    };

    const handlePutExamScore = async () => {
        if (isView) return;
        let totalScore = 0;
        let isMissingScore = false;

        for (let i = 0; i < listExam.length; i++) {
            totalScore = totalScore + listExam[i].scoreRate;
            if (!listExam[i].scoreRate) isMissingScore = true;
        }

        if (totalScore === 100 && !isMissingScore) {
            const result = await Promise.all(
                listExam.map((item) =>
                    putSubjectExamScoreRate(item.id, item.scoreRate)
                )
            );
        } else {
            return;
        }
    };

    const handleChangeExamRate = (examId: string, scoreRate: string) => {
        console.log('???? ~ file: index.tsx ~ line 142 ~ scoreRate', scoreRate);
        if (scoreRate == "")
            setError({ ...error, [`${examId}`]: "Vui l??ng nh???p t??? l??? ??i???m b??i thi" });
        else setError({ ...error, [`${examId}`]: null });

        const indexItem = listExam.findIndex((item) => item.id === examId);

        const cloneListExam = [...listExam];
        cloneListExam[indexItem].scoreRate = Number(scoreRate);

        setListExam([...cloneListExam]);

        //check Error score Rate
        const totalRate = cloneListExam.reduce(
            (total, item) => total + item.scoreRate,
            0
        );

        if (totalRate !== 100) {
            setError({
                ...error,
                scoreRate: "T???ng t??? l??? c??c b??i thi ph???i l?? 100%",
            });
        } else {
            setError({
                ...error,
                scoreRate: "",
            });
        }

        handlePutExamScore();
    };

    const handleValidateInput = (key: string, value: string) => {
        switch (key) {
            case "passingScore":
                if (!value) {
                    setError({ ...error, [key]: "Vui l??ng nh???p ??i???m ?????t m??n h???c" });
                } else {
                    if (Number(value) > 100 || Number(value) < 0) {
                        setError({
                            ...error,
                            [key]: "??i???m ?????t m??n h???c ph???i nh??? h??n ho???c b???ng 100",
                        });
                    } else {
                        setError({ ...error, [key]: "" });
                    }
                }
                break;
            default:
                break;
        }
    };

    const blockInvalidChar = (event: any) => {
        if (
            (event.which != 8 && event.which != 0 && event.which < 48) ||
            event.which > 57
        ) {
            event.preventDefault();
        }
    };

    const renderExamList = () => {
        return (
            <React.Fragment>
                {listExam && listExam.length ? (
                    <div className="lnd-box-info__test" style={{ marginTop: "24px" }}>
                        <div className="lnd-box-info__score__title">
                            Thi???t l???p t??? l??? ??i???m b??i thi
                            <HrvComponents.Tooltip
                                title={TEXT_TOOLTIP_TEST_SCORE}
                                placement="topLeft"
                            >
                                <span className="ml-1">{ISVGQuestionCircle()}</span>
                            </HrvComponents.Tooltip>
                        </div>
                        <div className="lnd-box-info__test__content">
                            {listExam.map((item, index) => {
                                return (
                                    <div
                                        className="lnd-box-info__test__content__item"
                                        key={`test__content__item-${index}`}
                                    >
                                        <div className="lnd-box-info__name-text">
                                            {item.name || "T??n b??i thi"}
                                        </div>
                                        <div
                                            className={`lnd-box-info__score__content ${isView
                                                ? "disable"
                                                : error["scoreRate"] ||
                                                    item.scoreRate === "" ||
                                                    item.scoreRate === null
                                                    ? "error"
                                                    : ""
                                                }`}
                                            style={{ marginBottom: "12px" }}
                                        >
                                            <input
                                                onChange={(e) => {
                                                    handleChangeExamRate(item.id, e.target.value);
                                                }}
                                                value={item.scoreRate}
                                                disabled={isView || false}
                                                onKeyPress={blockInvalidChar}
                                            />
                                            <span className="span-input-helper">%</span>
                                        </div>

                                        {(item.scoreRate === "" || item.scoreRate === null) &&
                                            !isView ? (
                                            <div
                                                className="input-validate-error"
                                                style={{ marginTop: "-12px" }}
                                            >
                                                Vui l??ng nh???p t??? l??? ??i???m b??i thi
                                            </div>
                                        ) : error["scoreRate"] && !isView ? (
                                            <div
                                                className="input-validate-error"
                                                style={{ marginTop: "-12px" }}
                                            >
                                                {error["scoreRate"]}
                                            </div>
                                        ) : null}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : null}
            </React.Fragment>
        );
    };

    return (
        <React.Fragment>
            <div className="lnd-box-info" style={{ maxHeight: `${maxHeight}` }}>
                {/* Box statistic */}
                <div className="lnd-box-info__general">
                    <div className="lnd-box-info__general__item">
                        <div className="lnd-box-info__general__number">
                            {dataContent.totalLesson ?? 0}
                        </div>
                        <div className="lnd-box-info__general__title">
                            B??i h???c ???? thi???t l???p
                        </div>
                    </div>
                    <div className="lnd-box-info__general__item">
                        <div
                            className={`lnd-box-info__general__number ${!dataContent.totalExam ? "missing" : ""
                                }`}
                        >
                            {dataContent.totalExam ?? 0}
                        </div>
                        <div className="lnd-box-info__general__title">
                            B??i thi ???? thi???t l???p
                        </div>
                    </div>
                </div>
                {/* Error Do not have Exam */}
                {!dataContent.totalExam ? (
                    <div className="lnd-box-info__missing-exam">
                        <div className="lnd-box-info__missing-exam-icon mr-3">
                            {ISVGExclamationMark()}
                        </div>
                        <div className="lnd-box-info__missing-exam-msg">
                            C???n thi???t l???p t???i thi???u 1 b??i thi
                        </div>
                    </div>
                ) : null}
                {/* Box info courses score */}
                <div className="lnd-box-info__score">
                    <div className="lnd-box-info__score__title">
                        Thi???t l???p ??i???m ?????t m??n h???c
                        <HrvComponents.Tooltip
                            title={TEXT_TOOLTIP_SCORE}
                            placement="topLeft"
                        >
                            <span className="ml-1">{ISVGQuestionCircle()}</span>
                        </HrvComponents.Tooltip>
                    </div>
                    <div
                        className={`lnd-box-info__score__content ${error["passingScore"] ? "error" : ""
                            } ${isView ? "disable" : ""}`}
                    >
                        <input
                            onChange={(e: any) => {
                                handleValidateInput("passingScore", e.target.value);
                                onChangeData(
                                    "passingScore",
                                    e.target.value.replace(/[^0-9]/g, "")
                                );
                            }}
                            onKeyPress={blockInvalidChar}
                            type="number"
                            placeholder="??i???m ?????t m??n h???c"
                            value={dataContent.passingScore || ""}
                            onBlur={(e: any) =>
                                handleValidateInput("passingScore", e.target.value)
                            }
                            disabled={isView || false}
                        />
                        <span className="span-input-helper">??i???m</span>
                    </div>
                    {error["passingScore"] ? (
                        <div
                            className="input-validate-error"
                            style={{ marginTop: "-24px" }}
                        >
                            {error["passingScore"]}
                        </div>
                    ) : null}
                </div>
                {/* Box info score test */}
                {renderExamList()}
            </div>
        </React.Fragment>
    );
};
