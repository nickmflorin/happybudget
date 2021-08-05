import React, { ReactNode, useMemo } from "react";
import classNames from "classnames";
import { Button as AntDButton } from "antd";
import { ButtonProps as AntDButtonProps } from "antd/lib/button";

import { isNil } from "lodash";

import { TooltipWrapper, Spinner } from "components";

export interface ButtonProps extends Omit<AntDButtonProps, "icon" | StandardComponentPropNames>, ClickableProps {
  readonly children?: ReactNode;
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly showLoadingIndicatorOverIcon?: boolean;
}

/**
 * A consistently styled Button component for consistently styled and themed
 * buttons wrapped around AntD's Button class.
 */
const Button = ({
  children,
  disabled,
  loading,
  showLoadingIndicatorOverIcon,
  icon,
  className,
  style,
  tooltip,
  ...props
}: ButtonProps): JSX.Element => {
  const prefix = useMemo(() => {
    if (isNil(icon)) {
      return loading === true ? <Spinner /> : <></>;
    } else if (showLoadingIndicatorOverIcon !== false) {
      return loading === true ? <Spinner /> : icon;
    } else {
      return loading === true ? (
        <React.Fragment>
          <Spinner />
          {icon}
        </React.Fragment>
      ) : (
        icon
      );
    }
  }, []);

  return (
    <TooltipWrapper {...tooltip}>
      <AntDButton
        {...props}
        className={classNames("btn", className, {
          disabled: disabled === true && isNil(tooltip),
          "fake-disabled": disabled === true && !isNil(tooltip)
        })}
        disabled={disabled === true && isNil(tooltip)}
      >
        {prefix}
        {children}
      </AntDButton>
    </TooltipWrapper>
  );
};

export default Button;
