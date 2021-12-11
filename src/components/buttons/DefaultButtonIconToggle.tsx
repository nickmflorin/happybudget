import { ui } from "lib";

import { ButtonProps } from "./Button";
import DefaultButton from "./DefaultButton";
import DefaultIconButton from "./DefaultIconButton";

export interface DefaultButtonIconToggleProps extends Omit<ButtonProps, "icon" | "children"> {
  readonly icon: IconOrElement | ((params: ClickableIconCallbackParams) => IconOrElement);
  readonly breakpoint: Style.BreakpointId;
  readonly text: string;
}

const DefaultButtonIconToggle = ({ icon, breakpoint, text, ...props }: DefaultButtonIconToggleProps): JSX.Element => {
  const isLessThan = ui.hooks.useLessThanBreakpoint(breakpoint);
  if (isLessThan) {
    return <DefaultIconButton icon={icon} {...props} />;
  }
  return (
    <DefaultButton icon={icon} {...props}>
      {text}
    </DefaultButton>
  );
};

export default DefaultButtonIconToggle;
