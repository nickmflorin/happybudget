import classNames from "classnames";
import Alert, { AlertProps } from "./Alert";

export interface SuccessProps extends Omit<AlertProps, "type"> {}

const Success: React.FC<SuccessProps> = ({ children, className, ...props }) => {
  return (
    <Alert {...props} className={classNames("success", className)} type={"success"}>
      {children}
    </Alert>
  );
};

export default Success;
