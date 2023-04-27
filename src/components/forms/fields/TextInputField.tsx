import { forms } from "lib/ui";
import { TextInput, TextInputProps } from "components/input";

import { Field, FieldProps } from "./generic";

// TODO: Figure out how to get defaultValue working with TextInput.
export type TextInputFieldProps<
  D extends forms.FormData = forms.FormData,
  N extends forms.FieldName<D> = forms.FieldName<D>,
> = forms.WithFormInput<
  TextInputProps<D, N> &
    Pick<
      FieldProps<string, D, N, HTMLInputElement>,
      "label" | "helpText" | "className" | "style" | "id" | "registerOptions"
    > &
    Pick<FieldProps<string, D, N, HTMLInputElement>["field"], "name"> & {
      readonly form: forms.FormInstance<D>;
    },
  string,
  D,
  N,
  HTMLInputElement
>;

export const TextInputField = <
  D extends forms.FormData = forms.FormData,
  N extends forms.FieldName<D> = forms.FieldName<D>,
>({
  name,
  className,
  style,
  id,
  label,
  helpText,
  form,
  registerOptions,
  ...props
}: TextInputFieldProps<D, N>) => (
  <Field<string, D, N, HTMLInputElement>
    {...form.register<N, HTMLInputElement>(name, registerOptions)}
    label={label}
    id={id}
    className={className}
    style={style}
    helpText={helpText}
  >
    {data => <TextInput<D, N> {...props} {...data} />}
  </Field>
);
