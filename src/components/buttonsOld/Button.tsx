import React, { useState, useMemo, forwardRef, ForwardedRef } from "react";

import classNames from "classnames";
import { isNil } from "lodash";
import { Button as AntDButton } from "antd";
import { ButtonProps as AntDButtonProps } from "antd/lib/button";

import { ui } from "lib";
import { Spinner, ShowHide, Icon, VerticalFlexCenter } from "components";
import { withSize } from "components/hocs";
import { SpinnerProps } from "components/loading/Spinner/Spinner";
import { TooltipWrapper } from "components/tooltips";

type PrivateButtonProps = Omit<
  AntDButtonProps,
  "disabled" | "icon" | "size" | keyof StandardComponentProps
> &
  ClickableProps &
  StandardComponentProps & {
    readonly loading?: boolean;
    readonly iconProps?: IconProps;
    readonly showLoadingIndicatorOverIcon?: boolean;
    readonly withDropdownCaret?: boolean;
    readonly dropdownCaretState?: "open" | "closed" | undefined;
    readonly spinnerProps?: SpinnerProps;
  };

/* These are the props that should be extended by components extending Button.
   The props dictated by UseSizeProps are not actually passed into the Button
   component, because the withSize HOC does not pass them through but instead
   just passes the className that the size determines into the component. */
export type ButtonProps = PrivateButtonProps & UseSizeProps;

const Button = (
  {
    children,
    disabled,
    loading,
    showLoadingIndicatorOverIcon,
    icon,
    iconProps,
    className,
    tooltip,
    withDropdownCaret,
    dropdownCaretState,
    spinnerProps,
    ...props
  }: PrivateButtonProps,
  ref: ForwardedRef<HTMLButtonElement>,
): JSX.Element => {
  const isDisabled = useMemo(() => disabled === true && isNil(tooltip), [disabled, tooltip]);
  /* If the button is disabled but has a tooltip, the only way to show the
		 tooltip on hover is to allow pointer events on the Button.  This means that
		 we cannot set the Button as disabled, but have to style the button as if it
		 were disabled, and block click events manually. */
  const isFakeDisabled = useMemo(() => disabled === true && !isNil(tooltip), [disabled, tooltip]);
  const [isHovered, setIsHovered] = useState(false);

  const iC = ui.useClickableIcon(icon, { isHovered, iconProps });

  const prefix = useMemo(() => {
    if (isNil(iC)) {
      return loading === true ? (
        <VerticalFlexCenter>
          <Spinner {...spinnerProps} />
        </VerticalFlexCenter>
      ) : (
        <></>
      );
    } else if (showLoadingIndicatorOverIcon !== false) {
      return loading === true ? (
        <VerticalFlexCenter>
          <Spinner {...spinnerProps} />
        </VerticalFlexCenter>
      ) : (
        iC
      );
    } else if (loading === true) {
      return (
        <React.Fragment>
          <VerticalFlexCenter>
            <Spinner {...spinnerProps} />
          </VerticalFlexCenter>
          {iC}
        </React.Fragment>
      );
    } else {
      return iC;
    }
  }, [iC, loading, spinnerProps]);

  return (
    <TooltipWrapper tooltip={tooltip}>
      <AntDButton
        {...props}
        ref={ref}
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => !isFakeDisabled && props.onClick?.(e)}
        className={classNames("btn", className, {
          disabled: isDisabled,
          "fake-disabled": isFakeDisabled,
        })}
        disabled={isDisabled}
        onMouseEnter={() => setIsHovered(!isHovered)}
        onMouseLeave={() => setIsHovered(!isHovered)}
      >
        {prefix}
        {children}
        <ShowHide show={withDropdownCaret}>
          <Icon
            className="caret"
            icon={dropdownCaretState === "open" ? "caret-up" : "caret-down"}
            weight="solid"
          />
        </ShowHide>
      </AntDButton>
    </TooltipWrapper>
  );
};

export default withSize<ButtonProps>({ hasRef: true })(forwardRef(Button));
