import classNames from "classnames";
import Alert, { AlertProps } from "./Alert";

export interface WarningProps extends Omit<AlertProps, "type"> {}

const Warning: React.FC<WarningProps> = ({ children, className, ...props }) => (
  <Alert {...props} className={classNames("warning", className)} level={"warning"} />
);

export default Warning;
