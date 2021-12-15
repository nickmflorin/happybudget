import classNames from "classnames";
import Alert, { AlertProps } from "./Alert";

export interface SuccessProps extends Omit<AlertProps, "type"> {}

const Success: React.FC<SuccessProps> = ({ children, className, ...props }) => (
  <Alert {...props} className={classNames("success", className)} level={"success"} />
);

export default Success;
