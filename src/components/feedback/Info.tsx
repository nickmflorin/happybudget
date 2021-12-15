import classNames from "classnames";
import Alert, { AlertProps } from "./Alert";

export interface InfoProps extends Omit<AlertProps, "type"> {}

const Info: React.FC<InfoProps> = ({ children, className, ...props }) => (
  <Alert {...props} className={classNames("info", className)} level={"info"} />
);

export default Info;
