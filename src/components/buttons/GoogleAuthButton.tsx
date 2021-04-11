import { Button } from "antd";
import { GoogleIcon } from "components/svgs";

interface GoogleAuthButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  text?: string;
}

const GoogleAuthButton = ({
  onClick,
  text = "Login with Google",
  disabled = false
}: GoogleAuthButtonProps): JSX.Element => {
  return (
    <Button className={"btn--google"} onClick={onClick} disabled={disabled}>
      <div className={"content-wrapper"}>
        <div className={"icon-wrapper"}>
          <GoogleIcon />
        </div>
        <span className={"text-wrapper"}>{text}</span>
      </div>
    </Button>
  );
};

export default GoogleAuthButton;
