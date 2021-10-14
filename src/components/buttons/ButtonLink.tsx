import classNames from "classnames";
import Button, { ButtonProps } from "./Button";

/**
 * A consistently styled Button component that looks and acts like a Link.
 */
const ButtonLink = ({ className, children, spinnerProps, ...props }: ButtonProps): JSX.Element => (
  <Button
    className={classNames("btn--link", className)}
    {...props}
    spinnerProps={{ size: 14, color: "#2182e4", ...spinnerProps }}
  >
    {children}
  </Button>
);

export default ButtonLink;
