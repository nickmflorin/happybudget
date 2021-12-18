import classNames from "classnames";
import Alert, { AlertProps } from "./Alert";

export type ErrorProps = Omit<AlertProps, "level">;

const Error: React.FC<ErrorProps> = ({ className, ...props }) => (
  <Alert {...props} className={classNames("error", className)} level={"error"} />
);

export default Error;
