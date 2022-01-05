import { ui } from "lib";

import { ButtonProps } from "./Button";
import DefaultButton from "./DefaultButton";
import DefaultIconButton from "./DefaultIconButton";

export interface DefaultButtonIconToggleProps extends ButtonProps {
  readonly breakpoint: Style.BreakpointId;
}

const DefaultButtonIconToggle = ({ breakpoint, ...props }: DefaultButtonIconToggleProps): JSX.Element => {
  const isLessThan = ui.hooks.useLessThanBreakpoint(breakpoint);
  if (isLessThan) {
    return <DefaultIconButton {...props} />;
  }
  return <DefaultButton {...props}>{props.children}</DefaultButton>;
};

export default DefaultButtonIconToggle;
