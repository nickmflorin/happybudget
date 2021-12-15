import classNames from "classnames";
import Alert, { AlertProps } from "./Alert";

export interface ErrorProps extends Omit<AlertProps, "type"> {}

const Error: React.FC<ErrorProps> = ({ children, className, ...props }) => (
  <Alert {...props} className={classNames("error", className)} level={"error"} />
);

export default Error;
