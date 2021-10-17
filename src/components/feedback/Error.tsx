import classNames from "classnames";
import Alert, { AlertProps } from "./Alert";

export interface ErrorProps extends Omit<AlertProps, "type"> {}

const Error: React.FC<ErrorProps> = ({ children, className, ...props }) => {
  return (
    <Alert {...props} className={classNames("error", className)} type={"error"}>
      {children}
    </Alert>
  );
};

export default Error;
