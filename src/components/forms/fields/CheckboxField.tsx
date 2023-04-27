import { forms } from "lib/ui";
import { Checkbox, CheckboxProps } from "components/input";

import { ControlledField, ControlledFieldProps } from "./generic";

export type CheckboxFieldProps<
  D extends forms.FormData = forms.FormData,
  N extends forms.FieldName<D> = forms.FieldName<D>,
> = Omit<CheckboxProps<D, N>, keyof forms.FormInput<boolean, D, N, HTMLInputElement> | "value"> &
  Omit<ControlledFieldProps<boolean, D, N, HTMLInputElement>, "children">;

export const CheckboxField = <
  D extends forms.FormData = forms.FormData,
  N extends forms.FieldName<D> = forms.FieldName<D>,
>({
  defaultValue,
  name,
  className,
  style,
  id,
  label,
  form,
  helpText,
  registerOptions,
  shouldUnregister,
  ...props
}: CheckboxFieldProps<D, N>) => (
  <ControlledField<boolean, D, N, HTMLInputElement>
    id={id}
    className={className}
    style={style}
    name={name}
    defaultValue={defaultValue}
    label={label}
    form={form}
    helpText={helpText}
    registerOptions={registerOptions}
    shouldUnregister={shouldUnregister}
  >
    {({ value, defaultValue, ...data }) => (
      <Checkbox<D, N> {...props} {...data} value={value} defaultValue={defaultValue} />
    )}
  </ControlledField>
);
