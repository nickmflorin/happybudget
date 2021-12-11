import classNames from "classnames";
import Button, { ButtonProps } from "./Button";

export interface DefaultButtonProps extends ButtonProps {}

const DefaultButton = (props: DefaultButtonProps): JSX.Element => (
  <Button {...props} className={classNames("btn--default", props.className)} />
);

export default DefaultButton;
