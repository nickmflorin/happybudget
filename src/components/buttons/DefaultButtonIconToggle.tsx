import React from "react";
import { ui } from "lib";

import { ButtonProps } from "./Button";
import DefaultButton from "./DefaultButton";
import DefaultIconButton from "./DefaultIconButton";

export interface DefaultButtonIconToggleProps extends ButtonProps {
  readonly breakpoint: Style.BreakpointId;
  readonly breakpointIcon?: IconOrElement;
  readonly breakpointStyle?: React.CSSProperties;
}

const DefaultButtonIconToggle = ({
  breakpoint,
  breakpointIcon,
  breakpointStyle,
  children,
  ...props
}: DefaultButtonIconToggleProps): JSX.Element => {
  const isLessThan = ui.hooks.useLessThanBreakpoint(breakpoint);
  if (isLessThan) {
    return <DefaultIconButton {...props} icon={breakpointIcon || props.icon} style={breakpointStyle || props.style} />;
  }
  return <DefaultButton {...props}>{children}</DefaultButton>;
};

export default React.memo(DefaultButtonIconToggle);
