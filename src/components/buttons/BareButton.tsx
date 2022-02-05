import classNames from "classnames";
import Button, { ButtonProps } from "./Button";

export type BareButtonProps = ButtonProps;

const BareButton = (props: BareButtonProps): JSX.Element => (
  <Button {...props} className={classNames("btn--bare", props.className)} />
);

export default BareButton;
