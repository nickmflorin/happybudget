import React from "react";
import { ui } from "lib";

import { ButtonProps } from "./Button";
import PrimaryButton from "./PrimaryButton";
import PrimaryIconButton from "./PrimaryIconButton";

export interface PrimaryButtonIconToggleProps extends Omit<ButtonProps, "icon" | "children"> {
  readonly icon: IconOrElement | ((params: ClickableIconCallbackParams) => IconOrElement);
  readonly breakpoint: Style.BreakpointId;
  readonly text: string;
}

const PrimaryButtonIconToggle = ({ icon, breakpoint, text, ...props }: PrimaryButtonIconToggleProps): JSX.Element => {
  const isLessThan = ui.hooks.useLessThanBreakpoint(breakpoint);
  if (isLessThan) {
    return <PrimaryIconButton icon={icon} {...props} />;
  }
  return (
    <PrimaryButton icon={icon} {...props}>
      {text}
    </PrimaryButton>
  );
};

export default React.memo(PrimaryButtonIconToggle);
