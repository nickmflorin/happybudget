import { useMemo } from "react";

import classNames from "classnames";
import { RegisterOptions } from "react-hook-form";

import * as Feedback from "lib/feedback";
import * as ui from "lib/ui";
import { forms } from "lib/ui";
import { FieldFeedback } from "components/feedback";

import { FieldHelpText } from "./FieldHelpText";

export type FieldBaseProps = {
  readonly label?: string;
  readonly helpText?: string;
};

export type FieldProps<
  V,
  D extends forms.FormData,
  N extends forms.FieldName<D>,
  E extends forms.InputElement,
> = forms.FieldRegistration<D, N, E> &
  ui.ComponentProps<
    FieldBaseProps & {
      readonly registerOptions?: RegisterOptions<D, N>;
      readonly children: (props: forms.FormInput<V, D, N, E>) => JSX.Element;
    }
  >;

/**
 * The representation of an input component or element in a Form.
 */
export const Field = <
  V,
  D extends forms.FormData,
  N extends forms.FieldName<D>,
  E extends forms.InputElement,
>({
  id,
  className,
  style,
  label,
  helpText,
  field: { feedback, ...field },
  children,
  ...props
}: FieldProps<V, D, N, E>): JSX.Element => {
  const feedbackType = useMemo(() => Feedback.getMostSevereFeedbackType(feedback), [feedback]);
  return (
    <div
      id={id !== undefined ? `field-${field.name}-${id}` : `field-${field.name}`}
      className={classNames("field", className, { disabled: props.disabled })}
      style={style}
    >
      {label !== undefined && <label className="field__label">{label}</label>}
      {children({
        ...props,
        field: { ...field, feedbackType: feedbackType === null ? undefined : feedbackType },
      })}
      {helpText !== undefined && <FieldHelpText>{helpText}</FieldHelpText>}
      {field.validationError !== undefined && <FieldFeedback feedback={field.validationError} />}
      {feedback.map((f: forms.FormFieldFeedback<D, N>, index: number) => (
        <FieldFeedback key={index} feedback={f} />
      ))}
    </div>
  );
};
