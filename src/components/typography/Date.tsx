import classNames from "classnames";

import { config } from "application";
import { ui, formatters } from "lib";

/*
Props for the component that instruct the component to plug the value directly into the element
without first parsing into a date.
*/
type DateRawProps = {
  readonly children: formatters.DatePrimitive | null | undefined | false;
  readonly raw: true;
};

type DateConvProps = {
  readonly value: formatters.DatePrimitive | null | undefined;
  readonly localization?: config.localization.DateLocalizationCode;
  readonly raw?: false;
};

export type DateProps = ui.ComponentProps<DateRawProps | DateConvProps>;

const isDateRawProps = (props: DateProps): props is DateRawProps =>
  (props as DateRawProps).raw === true;

export const Date = (props: DateProps): JSX.Element => {
  if (isDateRawProps(props)) {
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    const { raw, ...rest } = props;
    return typeof props.children === "string" ? (
      <div {...rest} className={classNames(props.className, "date")} data-testid="date">
        {props.children}
      </div>
    ) : (
      <></>
    );
  }
  const dateString =
    props.value === null || props.value === undefined
      ? null
      : formatters.dateFormatter(
          props.localization || config.localization.DateLocalizationCodes.DISPLAY,
        )({ value: props.value });
  return dateString !== null ? <Date raw={true}>{dateString}</Date> : <></>;
};
