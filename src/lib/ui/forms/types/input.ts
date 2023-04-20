import { type GroupBase, type SelectInstance } from "react-select";
import { Optional } from "utility-types";

import * as feedback from "../../../feedback";

import * as fields from "./fields";
import { FormData } from "./forms";

/**
 * Represents the base form that all select options must extend.
 */
export type BaseSelectOption<I extends string = "id"> = string extends I
  ? Record<string, unknown>
  : { [key in I]: string };

/**
 * Represents the default form that is used by the <Select /> component.
 */
export type SelectOption<I extends string = "id"> = BaseSelectOption<I> & {
  readonly label: string;
};

export type SelectValue<
  O extends BaseSelectOption<string> = SelectOption<"id">,
  M extends boolean = false,
> = true extends M ? O[] : false extends M ? O : never;

export type SelectElement<
  O extends BaseSelectOption<string> = SelectOption<"id">,
  M extends boolean = false,
> = SelectInstance<O, M, GroupBase<O>>;

export type NativeInputElement = HTMLInputElement | HTMLTextAreaElement;

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export type InputElement = NativeInputElement | SelectElement<any, any>;

/**
 * The {@link HTMLElement} type that should be used for focusable event handlers for inputs in the
 * application.
 *
 * Note:  For focus events, the focus of the Select pertains to the HTMLInputElement that represents
 * the Select's value, not the entire SelectElement (which includes the options).
 */
export type InputFocusableElement = NativeInputElement;

export type InputElementToFocusableElement<E extends InputElement> = E extends InputFocusableElement
  ? E
  : HTMLInputElement;

/**
 * The ref that is used by "react-hook-form" to manage input in a form.
 */
export type InputRef<E extends InputElement = InputElement> = React.Ref<E>;

export type FormInput<
  V,
  D extends FormData = FormData,
  N extends fields.FieldName<D> = fields.FieldName<D>,
  E extends InputElement = InputElement,
> = Optional<Omit<fields.FieldRegistration<D, N, E>, "field">, "onChange" | "input" | "onBlur"> & {
  readonly value?: fields.FieldValue<D, N> & V;
  readonly field?: Optional<Omit<fields.FormField<D, N>, "feedback" | "validationError">> & {
    readonly feedbackType?: feedback.FeedbackType | undefined;
  };
};

export type WithFormInput<
  T,
  V,
  D extends FormData = FormData,
  N extends fields.FieldName<D> = fields.FieldName<D>,
  E extends InputElement = InputElement,
> = Omit<T, keyof FormInput<V, D, N, E>> & FormInput<V, D, N, E>;

/**
 * Represents the properties and attributes that are provided to an input based element in a Form
 * when that input based element is controlled.
 */
export type FormControlledInput<
  V,
  D extends FormData = FormData,
  N extends fields.FieldName<D> = fields.FieldName<D>,
  E extends InputElement = InputElement,
> = FormInput<V, D, N, E> & {
  readonly value: V & fields.FieldValue<D, N>;
  readonly defaultValue?: V & fields.FieldValue<D, N>;
};

export type WithFormControlledInput<
  T,
  V,
  D extends FormData = FormData,
  N extends fields.FieldName<D> = fields.FieldName<D>,
  E extends InputElement = InputElement,
> = Omit<T, keyof FormControlledInput<V, D, N, E>> & FormControlledInput<V, D, N, E>;
