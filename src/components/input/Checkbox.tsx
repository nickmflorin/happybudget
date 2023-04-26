import React, { useState, useMemo } from "react";

import classNames from "classnames";
import { Checkbox as RootCheckbox, CheckboxProps as RootCheckboxProps } from "antd";
import { CheckboxChangeEvent } from "antd/es/checkbox";

import * as ui from "lib/ui/types";

export type CheckboxProps<
  D extends ui.FormData = ui.FormData,
  N extends ui.FieldName<D> = ui.FieldName<D>,
> = ui.FormInput<boolean, D, N, HTMLInputElement> &
  ui.ComponentProps<
    { readonly value?: boolean; readonly defaultValue?: boolean },
    {
      external: Pick<RootCheckboxProps, "disabled">;
    }
  >;

export const Checkbox = <
  D extends ui.FormData = ui.FormData,
  N extends ui.FieldName<D> = ui.FieldName<D>,
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
