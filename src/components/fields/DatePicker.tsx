import React from "react";
import ReactDatePicker, { ReactDatePickerProps } from "react-datepicker";
import classNames from "classnames";

type DatePickerProps = ReactDatePickerProps & {
  readonly disabled?: boolean;
};

const DatePicker = ({ disabled, ...props }: DatePickerProps): JSX.Element => (
  <ReactDatePicker {...props} className={classNames("date-picker", { disabled }, props.className)} />
);

export default React.memo(DatePicker);
