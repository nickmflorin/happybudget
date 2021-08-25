import React, { useState, useMemo, forwardRef } from "react";
import classNames from "classnames";
import { Button as AntDButton } from "antd";
import { ButtonProps as AntDButtonProps } from "antd/lib/button";

import { isNil } from "lodash";

import { ui } from "lib";
import { TooltipWrapper, Spinner, ShowHide, Icon } from "components";

export interface ButtonProps
  extends Omit<AntDButtonProps, "disabled" | "icon" | StandardComponentPropNames>,
    ClickableProps,
    StandardComponentProps {
  readonly loading?: boolean;
  readonly showLoadingIndicatorOverIcon?: boolean;
  readonly withDropdownCaret?: boolean;
  readonly dropdownCaretState?: "open" | "closed" | undefined;
}

/**
 * A consistently styled Button component for consistently styled and themed
 * buttons wrapped around AntD's Button class.
 */
const Button = (
  {
    children,
    disabled,
    loading,
    showLoadingIndicatorOverIcon,
    icon,
    className,
    tooltip,
    withDropdownCaret,
    ...props
  }: ButtonProps,
  ref: any
): JSX.Element => {
  const isDisabled = useMemo(() => disabled === true && isNil(tooltip), [disabled, tooltip]);
  // If the button is disabled but has a tooltip, the only way to show the tooltip
  // on hover is to allow pointer events on the Button.  This means that we cannot
  // set the Button as disabled, but have to style the button as if it were disabled,
  // and block click events manually.
  const isFakeDisabled = useMemo(() => disabled === true && !isNil(tooltip), [disabled, tooltip]);
  const [isHovered, setIsHovered] = useState(false);

  const iC = ui.hooks.useClickableIcon(icon, { isHovered });

  const prefix = useMemo(() => {
    if (isNil(iC)) {
      return loading === true ? <Spinner /> : <></>;
    } else if (showLoadingIndicatorOverIcon !== false) {
      return loading === true ? <Spinner /> : iC;
    } else if (loading === true) {
      return (
        <React.Fragment>
          <Spinner />
          {iC}
        </React.Fragment>
      );
    } else {
      return iC;
    }
  }, [iC]);

  return (
    <TooltipWrapper tooltip={tooltip}>
      <AntDButton
        {...props}
        ref={ref}
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
        <ShowHide show={withDropdownCaret}>
          <Icon
            className={"caret"}
            icon={props.dropdownCaretState === "open" ? "caret-up" : "caret-down"}
            weight={"solid"}
          />
        </ShowHide>
      </AntDButton>
    </TooltipWrapper>
  );
};

const ForwardRefButton = forwardRef(Button);
export default React.memo(ForwardRefButton);
