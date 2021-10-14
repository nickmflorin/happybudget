import classNames from "classnames";
import Alert, { AlertProps } from "./Alert";

export interface WarningProps extends Omit<AlertProps, "type"> {}

const Warning: React.FC<WarningProps> = ({ children, className, ...props }) => {
  return (
    <Alert className={classNames("info", className)} type={"info"} {...props}>
      {children}
    </Alert>
  );
};

export default Warning;
