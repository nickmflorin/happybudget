import classNames from "classnames";
import Button, { ButtonProps } from "./Button";

export interface PrimaryButtonProps extends ButtonProps {}

const PrimaryButton = (props: PrimaryButtonProps): JSX.Element => (
  <Button {...props} className={classNames("btn--primary", props.className)} />
);

export default PrimaryButton;
