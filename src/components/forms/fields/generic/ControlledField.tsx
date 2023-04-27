import { Controller, ControllerProps } from "react-hook-form";

import * as ui from "lib/ui";
import { forms } from "lib/ui";

import { Field, FieldProps, FieldBaseProps } from "./Field";

export type ControlledFieldProps<
  V,
  D extends forms.FormData,
  N extends forms.FieldName<D>,
  E extends forms.InputElement,
> = ui.ComponentProps<
  FieldBaseProps & {
    readonly defaultValue?: forms.FieldValue<D, N> & V;
    readonly name: N;
    readonly form: forms.FormInstance<D>;
    readonly registerOptions?: Omit<
      FieldProps<V, D, N, E>["registerOptions"],
      "valueAsNumber" | "valueAsDate" | "setValueAs" | "disabled"
    >;
    readonly children: (props: forms.FormControlledInput<V, D, N, E>) => JSX.Element;
  }
> &
  Omit<ControllerProps<D, N>, "render" | "control" | "rules" | "defaultValue">;

/**
 * A modified version of the Field component that is meant to work with controlled input.
 *
 * The "react-hook-form" package takes an uncontrolled approach to managing input in a Form.  For
 * obvious reasons, this does not work with controlled input, which is usually the characteristic
 * of input components from some third-party libraries (including AntD or "react-select").
 *
 * In order for the input component to properly work with "react-hook-form", the input must be
 * wrapped in the ControlledField, which uses the "react-hook-form" `Controller` to modify the
 * behavior of the Field component.
 */
export const ControlledField = <
  V,
  D extends forms.FormData,
  N extends forms.FieldName<D>,
  E extends forms.InputElement,
>({
  form: { __control__, feedback },
  name,
  children,
  defaultValue,
  helpText,
  registerOptions,
  ...props
}: ControlledFieldProps<V, D, N, E>): JSX.Element => (
  <Controller<D, N>
    control={__control__}
    name={name}
    rules={registerOptions}
    render={({ field: { onChange, onBlur, value, name, ref }, fieldState }) => (
      <Field<V, D, N, E>
        {...props}
        helpText={helpText}
        {...forms.toInternalRegistration<D, N, E>(name, {
          feedback,
          onChange: onChange as forms.FieldChangeHandler<E>,
          onBlur,
          ref,
          fieldState,
        })}
      >
        {(props: forms.FormInput<V, D, N, E>) =>
          children({ ...props, value: value as forms.FieldValue<D, N> & V, defaultValue })
        }
      </Field>
    )}
  />
);
