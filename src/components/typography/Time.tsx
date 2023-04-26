import classNames from "classnames";

import * as localization from "application/config/localization";
import * as ui from "lib/ui/types";
import * as formatters from "lib/util/formatters";

/*
Props for the component that instruct the component to plug the value directly into the element
without first parsing into a time.
*/
type TimeRawProps = {
  readonly children: formatters.DatePrimitive | null | undefined | false;
  readonly raw: true;
};

type TimeConvProps = {
  readonly value: formatters.DatePrimitive | null | undefined;
  readonly localization?: localization.TimeLocalizationCode;
  readonly raw?: false;
};

export type TimeProps = ui.ComponentProps<TimeRawProps | TimeConvProps>;

const isTimeRawProps = (props: TimeProps): props is TimeRawProps =>
  (props as TimeRawProps).raw === true;

export const Time = (props: TimeProps): JSX.Element => {
  if (isTimeRawProps(props)) {
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    const { raw, ...rest } = props;
    return typeof props.children === "string" ? (
      <div {...rest} className={classNames(props.className, "time")} data-testid="time">
        {props.children}
      </div>
    ) : (
      <></>
    );
  }
  const timeString =
    props.value === null || props.value === undefined
      ? null
      : formatters.timeFormatter(props.localization || localization.TimeLocalizationCodes.DISPLAY)({
          value: props.value,
        });
  return timeString !== null ? <Time raw={true}>{timeString}</Time> : <></>;
};
