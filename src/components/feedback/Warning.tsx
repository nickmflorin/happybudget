import classNames from "classnames";
import Alert, { AlertProps } from "./Alert";

export interface WarningProps extends Omit<AlertProps, "type"> {}

const Warning: React.FC<WarningProps> = ({ children, className, title, detail, ...props }) => {
  return (
    <Alert className={classNames("warning", className)} type={"warning"} {...props}>
      {children}
    </Alert>
  );
};

export default Warning;
