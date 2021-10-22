import classNames from "classnames";
import Alert, { AlertProps } from "./Alert";

export interface WarningProps extends Omit<AlertProps, "type"> {}

const Warning: React.FC<WarningProps> = ({ children, className, ...props }) => {
  return (
    <Alert {...props} className={classNames("warning", className)} type={"warning"}>
      {children}
    </Alert>
  );
};

export default Warning;
