import React from "react";
import ReactDatePicker, { ReactDatePickerProps } from "react-datepicker";
import classNames from "classnames";

type DatePickerProps = ReactDatePickerProps & {
  readonly disabled?: boolean;
};

const DatePicker = ({ disabled, ...props }: DatePickerProps): JSX.Element => (
  /* React-Datepicker does not respect providing custom classnames to the
     component, so we have to wrap it in our own div. */
  <div className={classNames("date-picker", { disabled }, props.className)}>
    <ReactDatePicker {...props} />
  </div>
);

export default React.memo(DatePicker);
