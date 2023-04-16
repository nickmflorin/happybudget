import React from "react";

import classNames from "classnames";

import { GoogleIcon } from "components/svgs";

import Button, { ButtonProps } from "./Button";

const GoogleAuthButton = ({ children, ...props }: ButtonProps): JSX.Element => (
  <Button {...props} className={classNames("btn--google", props.className)}>
    <div className="content-wrapper">
      <div className="icon-wrapper">
        <GoogleIcon />
      </div>
      <span className="text-wrapper">{children}</span>
    </div>
  </Button>
);

export default React.memo(GoogleAuthButton);
