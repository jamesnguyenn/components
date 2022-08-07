import * as React from "react";
import { useCountdown } from "../../../../hook/useCountdown";

export const CounterTimer = ({
  targetTimer,
  handleExpired,
  handleWarningTimeLeft = null,
  warningTimeLeft = 1,
  typeCounter = "",
  isShowMinutes = false,
}) => {
  const [days, hours, minutes, seconds] = useCountdown(targetTimer);

  React.useEffect(() => {
    if (
      days <= 0 &&
      hours <= 0 &&
      minutes <= 0 &&
      seconds <= 0 
    ) {
      handleExpired && handleExpired();
    }
    if (days === 0 && hours === 0 && minutes === 0 && seconds === 0) {
      handleExpired && handleExpired();
    } else if (days === 0 && hours === 0 && minutes < warningTimeLeft && seconds <= 59) {
      handleWarningTimeLeft && handleWarningTimeLeft();
    }
  }, [days, hours, minutes, seconds]);

  const formatString = (value) => {
    return `0${value}`.slice(-2);
  }

  if (days <= 0 && hours <= 0 && minutes <= 0 && seconds <= 0) {
    return <span className="timer w-100 h-100"> 00:00 </span>;
  }

  if(isShowMinutes){
    return <span className="timer">{`${minutes + 1}`}</span>
  }

  return (
    <span className="timer">{`${hours ? `${formatString(hours)}:` : ""}${formatString(minutes)}:${formatString(seconds)}`}</span>
  );
};
