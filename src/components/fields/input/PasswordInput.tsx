import React, { useState, useMemo, forwardRef } from "react";

import classNames from "classnames";
import { map } from "lodash";
import { InputRef, Input as AntDInput, Popover as AntDPopover } from "antd";
import { InputProps as AntDInputProps } from "antd/lib/input";

import { Icon } from "components";
import { withSize } from "components/hocs";

const validationNames: PasswordValidationName[] = [
  { id: "lowercase", name: "One lowercase letter" },
  { id: "uppercase", name: "One uppercase letter" },
  { id: "number", name: "One number" },
  { id: "character", name: "One special character" },
  { id: "minChar", name: "8+ characters" },
];

const initialValidationState = {
  lowercase: false,
  uppercase: false,
  number: false,
  character: false,
  minChar: false,
};

const ValidationItems = (props: { validationState: PasswordValidationState }) => (
  <ul className="validation-items">
    {map(validationNames, item => (
      <li key={item.id} className={classNames({ strikethrough: props.validationState[item.id] })}>
        {item.name}
      </li>
    ))}
  </ul>
);

const MemoizedValidationItems = React.memo(ValidationItems);

/* The size related props are exposed outside of this component but not inside
   the component, because they are automatically wrapped into the className by
   the HOC. */
type PrivatePasswordInputProps = Omit<AntDInputProps, "size"> & {
  readonly hasValidator?: boolean;
};

export type PasswordInputProps = PrivatePasswordInputProps & UseSizeProps;

const PasswordInput = (
  { hasValidator, ...props }: PrivatePasswordInputProps,
  ref: React.ForwardedRef<InputRef>,
): JSX.Element => {
  const [validationState, setValidationState] =
    useState<PasswordValidationState>(initialValidationState);

  const handleValidation = useMemo(
    () => (e: React.ChangeEvent<HTMLInputElement>) => {
      props.onChange?.(e);
      setValidationState({
        lowercase: /[a-z|ç|ş|ö|ü|ı|ğ]/.test(e.target.value),
        uppercase: /[A-Z|Ç|Ş|Ö|Ü|İ|Ğ]/.test(e.target.value),
        number: /[0-9]/.test(e.target.value),
        character: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(e.target.value),
        minChar: e.target.value.length >= 8,
      });
    },
    [props.onChange],
  );

  const children = useMemo(
    () => (
      <AntDInput.Password
        placeholder="Password"
        prefix={<Icon icon="lock" weight="solid" />}
        ref={ref}
        {...props}
        className={classNames("input", "input--password", props.className)}
        onChange={handleValidation}
      />
    ),
    [props, handleValidation],
  );

  if (hasValidator) {
    return (
      <AntDPopover
        placement="right"
        content={<MemoizedValidationItems validationState={validationState} />}
        trigger="focus"
      >
        {children}
      </AntDPopover>
    );
  }

  return children;
};

export default withSize<PasswordInputProps, StandardSize, "size", InputRef>({
  hasRef: true,
})(forwardRef(PasswordInput)) as React.ForwardRefRenderFunction<
  InputRef,
  PasswordInputProps & { readonly ref?: React.ForwardedRef<InputRef> }
>;
