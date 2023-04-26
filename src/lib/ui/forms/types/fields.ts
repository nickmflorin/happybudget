import React from "react";

import {
  type FieldPath,
  type FormState as RootFormState,
  type UseFormRegisterReturn,
  type FieldError,
  type FieldPathValue,
} from "react-hook-form";

import * as errors from "application/errors";

import * as feedback from "../../../feedback";
import { Noop } from "../../../util";

import { FormData } from "./forms";
import {
  InputElement,
  InputRef,
  InputFocusableElement,
  SelectElement,
  InputElementToFocusableElement,
} from "./input";

export type FieldName<D extends FormData> = FieldPath<D> & string;

export type FieldValue<D extends FormData, N extends FieldName<D> = FieldName<D>> = FieldPathValue<
  D,
  N
>;

export type FormFieldFeedback<
  D extends FormData,
  N extends FieldName<D> = FieldName<D>,
  T extends feedback.FeedbackType = feedback.FeedbackType,
> = feedback.FieldFeedback<T, N>;

export const isFormFieldFeedback = <
  D extends FormData,
  N extends FieldName<D> = FieldName<D>,
  T extends feedback.FeedbackType = feedback.FeedbackType,
  F extends Omit<FormFieldFeedback<D, N, T>, "field"> = Omit<FormFieldFeedback<D, N, T>, "field">,
>(
  element: F | errors.ClientValidationError,
): element is F =>
  (element as F).feedbackType !== undefined && (element as F).message !== undefined;

/**
 * Represents the validation errors that are associated with fields of the Form.
 *
 * In terms of error handling and feedback, our usage of "react-hook-form" is limited to just
 * validation errors, {@link FieldError}, but not general field or global errors with the form -
 * which are implemented via internal feedback mechanics.
 *
 * @see FormInstance
 */
export type ClientValidationErrors<D extends FormData = FormData> = RootFormState<D>["errors"];

/**
 * The type that is returned from "react-hook-form"'s `getFieldState` method.  The type is not
 * exported from "react-hook-form" but the type represented below is the same type as the return
 * type of the original method.
 */
export type RootFieldState = {
  invalid: boolean;
  isDirty: boolean;
  isTouched: boolean;
  error?: FieldError;
};

export type InternalFieldState<D extends FormData, N extends FieldName<D> = FieldName<D>> = {
  /**
   * Field level feedback elements for the field, {@link FormFieldFeedback<D, N>[]}, that are
   * managed by internal feedback mechanics and either manually set on the Form or set as a result
   * of server side validation.
   */
  readonly feedback: FormFieldFeedback<D, N>[];
  /**
   * The error, {@link FieldError}, that is managed by "react-hook-form" for purposes of client-side
   * validation.
   */
  readonly validationError?: errors.ClientValidationError;
};

/**
 * The state of a given field in the form.
 *
 * This type overrides the return type on the original "react-hook-form" package's 'getFieldState'
 * method in order to clearly denote the error that the original type contains as a
 * 'validationError', while also adding an additional 'feedback' attribute.
 *
 * The other 3 fields on the type are consistent with the original typings of the "react-hook-form"
 * package.
 */
export type FieldState<D extends FormData, N extends FieldName<D> = FieldName<D>> = Omit<
  RootFieldState,
  "error"
> &
  InternalFieldState<D, N>;

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export type FieldChangeEvent<E extends InputElement> = E extends SelectElement<any, any>
  ? /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    { type: "onSelect"; target: { value: any } }
  : React.ChangeEvent<E> | MouseEvent;

/* When the field is wrapping a controlled input, the onBlur event handler provided by
   "react-hook-form" is Noop. */
export type FieldBlurHandler<E extends InputFocusableElement> =
  | ((e: React.ChangeEvent<E> | MouseEvent) => void)
  | Noop;

export type FieldChangeHandler<E extends InputElement = InputElement> = (
  e: FieldChangeEvent<E>,
) => Promise<void | boolean>;

export type ControlledFieldChangeHandler<
  D extends FormData = FormData,
  N extends FieldName<D> = FieldName<D>,
  E extends InputElement = InputElement,
> = (v: FieldValue<D, N>, e: FieldChangeEvent<E>) => void;

/**
 * Represents the properties and attributes that are provided to a Field component in a Form, some
 * of which will be passed through to the Field's underlying input based element.
 */
export type FormField<D extends FormData = FormData, N extends FieldName<D> = FieldName<D>> = Omit<
  UseFormRegisterReturn<N>,
  "onChange" | "ref" | "onBlur" | "disabled"
> &
  InternalFieldState<D, N>;

/**
 * Represents the information that is provided during the registration of a given Field with a
 * Form.  The information is a combination of Field-level and input-level properties and methods,
 * that the Field is responsible for providing to its underlying input based element.
 */
export type FieldRegistration<
  D extends FormData = FormData,
  N extends FieldName<D> = FieldName<D>,
  E extends InputElement = InputElement,
> = Pick<UseFormRegisterReturn<N>, "disabled"> & {
  readonly field: FormField<D, N>;
  /**
   * A ref, {@link InputRef<E>}, that is used by the "react-hook-form" package to manage input
   * elements in a Form.
   *
   * The original "react-hook-form" package's attribute name is '"ref"' - but that name causes
   * issues when using components that wrap <input /> elements that are sometimes a layer or two
   * deeper than the top level:
   *
   * const TextInput = () => (
   *   <div className={"text-input"}>
   *     <input {...} />
   *   </div>
   * )
   *
   * This is also particularly prevalent when wusing third-party components.
   *
   * The '"ref"' name for the attribute causes issues for the following reasons:
   *
   * 1. Since `ref` is a reserved prop name in React, they will issue warnings related to cases
   *    where the `ref` prop is passed through function components that are not wrapped by
   *    `forwardRef`.
   * 2. Resolving (1) would mean that every input based component that wraps an `<input />` element
   *    at any level would need to be wrapped by `forwardRef` at each stage in the composition
   *    tree - which is not always possible when leveraging third-party components.
   *
   * Renaming the attribute from `"ref"` to `"input"` avoids these issues because it is not using a
   * reserved prop name, '"ref"', and passing a ref object to components as a prop is perfectly
   * acceptable (and actually what 'forwardRef' does under the hood).
   */
  readonly input: InputRef<E>;
  /**
   * A callback that is exposed for purposes of allowing the "react-hook-form" to manage the state
   * of input based elements in a Form.
   */
  readonly onChange: FieldChangeHandler<E>;
  /**
   * A callback that is exposed for purposes of allowing the "react-hook-form" to manage the blurred
   * state input based elements in a Form.  If the input based element is controlled, the onBlur
   * handler will be a {@link Noop}.
   */
  readonly onBlur: FieldBlurHandler<InputElementToFocusableElement<E>>;
};
