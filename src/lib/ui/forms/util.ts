import { type UseFormRegisterReturn } from "react-hook-form";

import * as errors from "application/errors";

import { type FeedbackManagerFeedback } from "../../feedback";
import { Noop } from "../../util";

import * as types from "./types";

type CreateFieldProps<
  D extends types.FormData = types.FormData,
  N extends types.FieldName<D> = types.FieldName<D>,
> = Omit<UseFormRegisterReturn<N>, "onChange" | "onBlur" | "ref" | "name"> & {
  readonly feedback: FeedbackManagerFeedback<N>;
  readonly fieldState: types.RootFieldState;
};

export const createField = <
  D extends types.FormData = types.FormData,
  N extends types.FieldName<D> = types.FieldName<D>,
>(
  name: N,
  { feedback, fieldState, ...props }: CreateFieldProps<D, N>,
): types.FormField<D, N> => ({
  ...props,
  name,
  validationError: fieldState.error as errors.ClientValidationError,
  feedback:
    feedback.fields[name] === undefined
      ? []
      : (feedback.fields[name] as types.FormFieldFeedback<D, N>[]),
});

type RegisterFieldProps<
  D extends types.FormData = types.FormData,
  N extends types.FieldName<D> = types.FieldName<D>,
  E extends types.InputElement = types.InputElement,
> = CreateFieldProps<D, N> &
  Pick<UseFormRegisterReturn<N>, "ref"> & {
    /* When the field is being registered for a controlled input, the onChange callback will include
     the value and the event, not just the event. */
    readonly onChange: UseFormRegisterReturn<N>["onChange"] | types.FieldChangeHandler<E>;
    // When the field is being registered for a controlled input, the onBlur callback will be Noop.
    readonly onBlur: UseFormRegisterReturn<N>["onChange"] | Noop;
  };

/**
 * Modifies the result of the "react-hook-form" field registration, {@link UseFormRegisterReturn},
 * such that it includes information required in the context of this application.
 */
export const toInternalRegistration = <
  D extends types.FormData = types.FormData,
  N extends types.FieldName<D> = types.FieldName<D>,
  E extends types.InputElement = types.InputElement,
>(
  name: N,
  { ref, disabled, onBlur, onChange, feedback, fieldState, ...props }: RegisterFieldProps<D, N, E>,
): types.FieldRegistration<D, N, E> => ({
  ...props,
  field: createField(name, { feedback, fieldState, ...props }),
  input: ref,
  disabled,
  onBlur,
  onChange,
});
