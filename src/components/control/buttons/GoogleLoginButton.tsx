import React from "react";
import { Button } from "antd";
import { GoogleIcon } from "components/svgs";

interface GoogleLoginButtonProps {
  onClick?: () => void;
  disabled?: boolean;
}

const GoogleLoginButton = ({ onClick, disabled = false }: GoogleLoginButtonProps): JSX.Element => {
  return (
    <Button className={"btn--google"} onClick={onClick} disabled={disabled}>
      <div className={"content-wrapper"}>
        <div className={"icon-wrapper"}>
          <GoogleIcon />
        </div>
        <span className={"text-wrapper"}>{"Login with Google"}</span>
      </div>
    </Button>
  );
};

export default GoogleLoginButton;
