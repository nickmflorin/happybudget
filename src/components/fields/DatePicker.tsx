import React from "react";
import ReactDatePicker, { ReactDatePickerProps } from "react-datepicker";
import classNames from "classnames";
import { isNil } from "lodash";

type RawV = Date | null;

type DatePickerProps<V extends RawV | [RawV, RawV] = RawV> = Omit<ReactDatePickerProps, "onChange" | "value"> & {
  readonly disabled?: boolean;
  readonly value?: string | Date;
  readonly valueFormatting?: string;
  readonly onChange?: (v: V) => void;
};

const DatePicker = ({
  disabled,
  value,
  valueFormatting = "en-US",
  onChange,
  ...props
}: DatePickerProps): JSX.Element => (
  /* React-Datepicker does not respect providing custom classnames to the
     component, so we have to wrap it in our own div. */
  <div className={classNames("date-picker", { disabled }, props.className)}>
    {/* The onChange callback of ReactDatePicker is required, but in order for this
		component to work in the context of a Form the onChange callback must be
		optional, because it is not injected into the component until the Form
		injects the callback into the component (versus being injected into the
		component manually as a prop).  The callback for the Form must also abide
		by the form (value: V) => void, and ReactDatePicker's callback abides by
		(value: V, e: Event) => void.  So even though this usage of onChange looks
		redundant (i.e. it looks like we can pass onChange directly into the
		ReactDatePicker component without redefining it) - it is not. */}
    <ReactDatePicker
      {...props}
      value={isNil(value) || typeof value === "string" ? value : value.toLocaleDateString(valueFormatting)}
      onChange={(date: RawV) => onChange?.(date)}
    />
  </div>
);

export default React.memo(DatePicker) as typeof DatePicker;
