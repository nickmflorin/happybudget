import React, { useState, useMemo } from "react";
import classNames from "classnames";
import { Button as AntDButton } from "antd";
import { ButtonProps as AntDButtonProps } from "antd/lib/button";

import { isNil } from "lodash";

import { TooltipWrapper, Spinner } from "components";

export interface ButtonProps
  extends Omit<AntDButtonProps, "disabled" | "icon" | StandardComponentPropNames>,
    ClickableProps,
    StandardComponentProps {
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
  tooltip,
  ...props
}: ButtonProps): JSX.Element => {
  const isDisabled = useMemo(() => disabled === true && isNil(tooltip), [disabled, tooltip]);
  // If the button is disabled but has a tooltip, the only way to show the tooltip
  // on hover is to allow pointer events on the Button.  This means that we cannot
  // set the Button as disabled, but have to style the button as if it were disabled,
  // and block click events manually.
  const isFakeDisabled = useMemo(() => disabled === true && !isNil(tooltip), [disabled, tooltip]);
  const [isHovered, setIsHovered] = useState(false);

  const prefix = useMemo(() => {
    if (isNil(icon)) {
      return loading === true ? <Spinner /> : <></>;
    } else if (showLoadingIndicatorOverIcon !== false) {
      return loading === true ? <Spinner /> : typeof icon == "function" ? icon({ isHovered }) : icon;
    } else if (loading === true) {
      return (
        <React.Fragment>
          <Spinner />
          {icon}
        </React.Fragment>
      );
    } else if (typeof icon == "function") {
      return icon({ isHovered });
    } else {
      return icon;
    }
  }, [isHovered, icon]);

  return (
    <TooltipWrapper tooltip={tooltip}>
      <AntDButton
        {...props}
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => !isFakeDisabled && props.onClick?.(e)}
        className={classNames("btn", className, {
          disabled: isDisabled,
          "fake-disabled": isFakeDisabled
        })}
        disabled={isDisabled}
        onMouseEnter={() => setIsHovered(!isHovered)}
        onMouseLeave={() => setIsHovered(!isHovered)}
      >
        {prefix}
        {children}
      </AntDButton>
    </TooltipWrapper>
  );
};

export default Button;
