import { useMemo, useState } from "react";

import {
  useForm as reactHookUseForm,
  type RegisterOptions,
  type UseFormRegisterReturn,
} from "react-hook-form";

import * as errors from "application/errors";

import { isFieldFeedback, type FeedbackManagerFeedback } from "../../feedback";
import { createFeedbackHook } from "../../feedback/hooks";
import { removeObjAttributes, Noop } from "../../util";

import * as types from "./types";

// Global form feedback is not closable, it will be removed on subsequent requests to the server.
const useFeedback = createFeedbackHook({ closable: false });

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

/**
 * An internal implementation of "react-hook-form"'s 'useForm' hook that uses internal feedback
 * mechanics for managing feedback in the Form.  The "react-hook-form" mechanics associated with
 * validation and validation errors are still used, but general errors are replaced with internal
 * feedback mechanics.
 *
 * @see FormInstance
 */
export const useForm = <D extends types.FormData = types.FormData>(
  props: types.FormConfig<D> = {},
): types.FormInstance<D> => {
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const {
    formState: { errors: validationErrors, ..._formState },
    resetField: _resetField,
    register: _register,
    setFocus,
    getFieldState: _getFieldState,
    control: _control,
    ...original
  } = reactHookUseForm<D>(props);
  const {
    setFeedback: _setFeedback,
    clearFeedback,
    feedback,
    ...manager
  } = useFeedback(props.initialFeedback);

  const setFeedback = useMemo<types.FormInstance<D>["setFeedback"]>(
    () => (data, options?) => {
      _setFeedback(data);

      const fieldErrors = (Array.isArray(data) ? data : [data]).filter(
        (f: errors.HttpError | types.FormFeedback<D>) =>
          (!(f instanceof Error) && isFieldFeedback(f)) ||
          (f instanceof Error && errors.isApiFieldError(f)),
      ) as types.FormFieldFeedback<D, types.FieldName<D>>[];
      if (options?.shouldFocus === true && fieldErrors.length !== 0) {
        /* Note that "react-hook-form"'s setFocus method has a second argument, which is a set of
           options for the focus - we may eventually want to expose that as well. */
        setFocus(fieldErrors[0].field);
      }
    },
    [_setFeedback, setFocus],
  );

  const resetField = useMemo(
    (): types.FormInstance<D>["resetField"] => (name, options?) => {
      const keepFeedback = options?.keepFeedback === undefined ? false : options.keepFeedback;
      _resetField(
        name,
        options === undefined
          ? { keepError: keepFeedback }
          : { ...options, keepError: keepFeedback },
      );
      if (keepFeedback === false) {
        clearFeedback({ fields: [name] });
      }
    },
    [clearFeedback, _resetField],
  );

  const getFieldState = useMemo<types.FormInstance<D>["getFieldState"]>(
    () =>
      <N extends types.FieldName<D>>(name: N) => ({
        ..._getFieldState<N>(name),
        validationError: _getFieldState<N>(name).error as errors.ClientValidationError,
        feedback:
          feedback.fields[name] === undefined
            ? []
            : (feedback.fields[name] as types.FormFieldFeedback<D, N>[]),
      }),
    [feedback.fields, _getFieldState],
  );

  const register = useMemo<types.FormInstance<D>["register"]>(
    () =>
      <N extends types.FieldName<D>, E extends types.InputElement = types.InputElement>(
        name: N,
        options?: RegisterOptions<D, N>,
      ): types.FieldRegistration<D, N, E> =>
        toInternalRegistration(name, {
          ..._register<N>(name, options),
          feedback,
          fieldState: getFieldState(name),
        }),
    [feedback, _register, getFieldState],
  );

  const formState = useMemo(
    () => ({
      ..._formState,
      validationErrors,
      feedback,
    }),
    [validationErrors, feedback, _formState],
  );

  return {
    ...removeObjAttributes(original, ["setError", "clearErrors"]),
    ...manager,
    __control__: _control,
    feedback,
    formState,
    disabled,
    loading,
    submitting,
    getFieldState,
    register,
    setFocus,
    clearFeedback,
    setFeedback,
    resetField,
    setSubmitting,
    setLoading,
    setDisabled,
  };
};
