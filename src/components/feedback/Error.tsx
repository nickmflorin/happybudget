import classNames from "classnames";
import Alert, { AlertProps } from "./Alert";

export interface ErrorProps extends Omit<AlertProps, "type"> {}

const Error: React.FC<ErrorProps> = ({ children, className, ...props }) => {
  return (
    <Alert className={classNames("error", className)} type={"error"} {...props}>
      {children}
    </Alert>
  );
};

export default Error;
