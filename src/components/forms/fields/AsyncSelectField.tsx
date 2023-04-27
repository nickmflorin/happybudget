import { forms } from "lib/ui";
import { Select, SelectProps } from "components/input";

import { ControlledField, ControlledFieldProps } from "./generic";

export type AsyncSelectFieldProps<
  D extends forms.FormData = forms.FormData,
  N extends forms.FieldName<D> = forms.FieldName<D>,
  O extends forms.BaseSelectOption<string> = forms.SelectOption<"id">,
  M extends boolean = false,
> = Omit<
  SelectProps<O, M, D, N>,
  keyof forms.FormInput<forms.SelectValue<O, M>, D, N, HTMLInputElement> | "value"
> &
  Omit<ControlledFieldProps<forms.SelectValue<O, M>, D, N, forms.SelectElement<O, M>>, "children">;

export const AsyncSelectField = <
  D extends forms.FormData = forms.FormData,
  N extends forms.FieldName<D> = forms.FieldName<D>,
  O extends forms.BaseSelectOption<string> = forms.SelectOption<"id">,
  M extends boolean = false,
>({
  defaultValue,
  name,
  className,
  style,
  id,
  label,
  helpText,
  form,
  registerOptions,
  shouldUnregister,
  ...props
}: AsyncSelectFieldProps<D, N, O, M>) => (
  <ControlledField<forms.SelectValue<O, M>, D, N, forms.SelectElement<O, M>>
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
      <Select<O, M, D, N> {...props} {...data} value={value} defaultValue={defaultValue} />
    )}
  </ControlledField>
);
