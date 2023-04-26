import classNames from "classnames";
import { Moment } from "moment";

import * as localization from "application/config/localization";
import * as ui from "lib/ui/types";
import * as formatters from "lib/util/formatters";

import { Date } from "./Date";
import { Time } from "./Time";

type PrimitiveValueType = formatters.DatePrimitive | null | undefined | false;
type DateTimeValueType = PrimitiveValueType | Date | Moment;

/*
Props for the component that instruct the component to plug the value directly into the element
without first parsing into a date.  Because the values are not being parsed, and are simply inserted
into the element, the values cannot be provided as a single primitive value.
*/
type DateTimeRawProps = ui.ComponentProps<{
  /**
   * An array of length 2 where the first element is the date primitive and the second element is
   * the time primitive.  Each value must be of type {@link PrimitiveValueType}
   */
  readonly value: [PrimitiveValueType, PrimitiveValueType];
  readonly raw: true;
  /**
   * Whether or not the date and time parts should be stacked on top of each other or displayed side
   * by side.
   */
  readonly stacked?: boolean;
}>;

type DateTimeConvProps = ui.ComponentProps<{
  /**
   * Either a value of type {@link DateTimeValueType} that should be parsed into date and time
   * counterparts before each is formatted as a string, or an array of primitive value types,
   * {@link [PrimitiveValueType, PrimitiveValueType]} that provides the separate date/time parts
   * explicitly.
   */
  readonly value: DateTimeValueType | [PrimitiveValueType, PrimitiveValueType];
  readonly timeLocalization?: localization.TimeLocalizationCode;
  readonly dateLocalization?: localization.DateLocalizationCode;
  /**
   * Whether or not the date and time parts should be stacked on top of each other or displayed side
   * by side.
   */
  readonly stacked?: boolean;
  readonly raw?: never;
}>;

export type DateTimeProps = DateTimeRawProps | DateTimeConvProps;

const propsAreRaw = (props: DateTimeProps): props is DateTimeRawProps =>
  (props as DateTimeRawProps).raw === true;

const getDateString = (
  props: DateTimeProps,
): formatters.DatePrimitive | null | undefined | false => {
  if (propsAreRaw(props)) {
    return props.value[0];
  }
  const dateValue: DateTimeValueType = Array.isArray(props.value) ? props.value[0] : props.value;
  return dateValue !== null && dateValue !== undefined && dateValue !== false
    ? formatters.dateFormatter(
        props.dateLocalization || localization.DateLocalizationCodes.DISPLAY,
      )({ value: dateValue })
    : null;
};

const getTimeString = (
  props: DateTimeProps,
): formatters.DatePrimitive | null | undefined | false => {
  if (propsAreRaw(props)) {
    return props.value[1];
  }
  const timeValue: DateTimeValueType = Array.isArray(props.value) ? props.value[1] : props.value;
  return timeValue !== null && timeValue !== undefined && timeValue !== false
    ? formatters.timeFormatter(
        props.timeLocalization || localization.TimeLocalizationCodes.DISPLAY,
      )({ value: timeValue })
    : null;
};

export const DateTime = (props: DateTimeProps): JSX.Element => {
  const dateString = getDateString(props);
  const timeString = getTimeString(props);

  return dateString && timeString ? (
    <div
      id={props.id}
      style={props.style}
      className={classNames("datetime", { "datetime--stacked": props.stacked }, props.className)}
      data-testid="datetime"
    >
      <Date raw={true}>{dateString}</Date>
      <Time raw={true}>{timeString}</Time>
    </div>
  ) : (
    <></>
  );
};
