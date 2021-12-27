import { ui } from "lib";

import { ButtonProps } from "./Button";
import DefaultButton from "./DefaultButton";
import DefaultIconButton from "./DefaultIconButton";

export interface DefaultButtonIconToggleProps extends Omit<ButtonProps, "icon"> {
  readonly icon: IconOrElement | ((params: ClickableIconCallbackParams) => IconOrElement);
  readonly breakpoint: Style.BreakpointId;
}

const DefaultButtonIconToggle = ({ icon, breakpoint, ...props }: DefaultButtonIconToggleProps): JSX.Element => {
  const isLessThan = ui.hooks.useLessThanBreakpoint(breakpoint);
  if (isLessThan) {
    return <DefaultIconButton icon={icon} {...props} />;
  }
  return (
    <DefaultButton icon={icon} {...props}>
      {props.children}
    </DefaultButton>
  );
};

export default DefaultButtonIconToggle;
