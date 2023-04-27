import React, { useState, useMemo } from "react";

import classNames from "classnames";
import { Checkbox as RootCheckbox, CheckboxProps as RootCheckboxProps } from "antd";
import { CheckboxChangeEvent } from "antd/es/checkbox";

import * as ui from "lib/ui";
import { forms } from "lib/ui";

export type CheckboxProps<
  D extends forms.FormData = forms.FormData,
  N extends forms.FieldName<D> = forms.FieldName<D>,
> = forms.FormInput<boolean, D, N, HTMLInputElement> &
  ui.ComponentProps<
    { readonly value?: boolean; readonly defaultValue?: boolean },
    {
      external: Pick<RootCheckboxProps, "disabled">;
    }
  >;

export const Checkbox = <
  D extends forms.FormData = forms.FormData,
  N extends forms.FieldName<D> = forms.FieldName<D>,
>({
  input,
  value: _value,
  defaultValue = false,
  field,
  onChange,
  ...props
}: CheckboxProps<D, N>) => {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);

  const value = useMemo(
    () => (_value === undefined ? uncontrolledValue : _value),
    [_value, uncontrolledValue],
  );

  const _onChange = useMemo(
    () => (e: CheckboxChangeEvent) => {
      if (field === undefined) {
        setUncontrolledValue(e.target.checked);
      }
      onChange?.(e.nativeEvent);
    },
    [onChange, field],
  );

  return (
    <RootCheckbox
      {...props}
      ref={input}
      checked={value}
      defaultChecked={defaultValue}
      className={classNames("checkbox", props.className)}
      onChange={_onChange}
    />
  );
};
