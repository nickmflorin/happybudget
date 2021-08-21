import classNames from "classnames";
import Button, { ButtonProps } from "./Button";

interface CircleIconButtonProps extends Omit<ButtonProps, "icon"> {
  readonly icon: IconOrElement;
}

const CircleIconButton = (props: CircleIconButtonProps): JSX.Element => (
  <Button {...props} className={classNames("btn--circle-icon", props.className)} icon={props.icon} />
);

export default CircleIconButton;
