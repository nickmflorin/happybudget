import classNames from "classnames";
import Button, { ButtonProps } from "./Button";

export interface DefaultIconButtonProps extends Omit<ButtonProps, "icon" | "children"> {
  readonly icon: IconOrElement | ((params: ClickableIconCallbackParams) => IconOrElement);
}

const DefaultIconButton = ({ icon, ...props }: DefaultIconButtonProps): JSX.Element => (
  <Button {...props} icon={icon} className={classNames("btn--default-icon-only", props.className)} />
);

export default DefaultIconButton;
