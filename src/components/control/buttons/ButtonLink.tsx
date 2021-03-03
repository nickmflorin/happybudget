import React from "react";
import classNames from "classnames";
import Button from "./Button";

interface ButtonProps {
  className?: string;
  children: JSX.Element | string;
  [key: string]: any;
}

/**
 * A consistently styled Button component that looks and acts like a Link.
 */
const ButtonLink = ({ className, children, ...props }: ButtonProps): JSX.Element => (
  <Button className={classNames("btn--link", className)} {...props}>
    {children}
  </Button>
);

export default ButtonLink;
