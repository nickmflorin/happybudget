import classNames from "classnames";
import { GoogleIcon } from "components/svgs";
import Button, { ButtonProps } from "./Button";

interface GoogleAuthButtonProps extends ButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  text?: string;
}

const GoogleAuthButton = ({ children, ...props }: GoogleAuthButtonProps): JSX.Element => {
  return (
    <Button large={true} {...props} className={classNames("btn--google", props.className)}>
      <div className={"content-wrapper"}>
        <div className={"icon-wrapper"}>
          <GoogleIcon />
        </div>
        <span className={"text-wrapper"}>{children}</span>
      </div>
    </Button>
  );
};

export default GoogleAuthButton;
