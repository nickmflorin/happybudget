import React from "react";

import classNames from "classnames";

import * as ui from "lib/ui";
import { forms } from "lib/ui";
import { AffixGroup } from "components/structural";

import { Input, InputProps } from "./Input";

export type TextInputProps<
  D extends forms.FormData = forms.FormData,
  N extends forms.FieldName<D> = forms.FieldName<D>,
> = Omit<forms.FormInput<string, D, N, HTMLInputElement>, "onChange"> &
  Omit<InputProps, "name" | "onChange"> & {
    readonly affixLeft?: ui.Affixes;
    readonly affixRight?: ui.Affixes;
    readonly onChange?:
      | InputProps["onChange"]
      | forms.FormInput<string, D, N, HTMLInputElement>["onChange"];
  };

export const TextInput = <
  D extends forms.FormData = forms.FormData,
  N extends forms.FieldName<D> = forms.FieldName<D>,
>({
  affixLeft,
  affixRight,
  field,
  ...props
}: TextInputProps<D, N>): JSX.Element => (
  <div
    style={props.style}
    className={classNames(
      "text-input",
      field?.feedbackType !== undefined && `text-input--feedback-${field.feedbackType}`,
      { disabled: props.disabled },
      props.className,
    )}
  >
    {affixLeft !== undefined && <AffixGroup affixes={affixLeft} />}
    <Input {...props} name={field?.name} className="text-input__input" />
    {affixRight !== undefined && <AffixGroup affixes={affixRight} />}
  </div>
);
