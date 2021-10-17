import classNames from "classnames";
import Alert, { AlertProps } from "./Alert";

export interface InfoProps extends Omit<AlertProps, "type"> {}

const Info: React.FC<InfoProps> = ({ children, className, ...props }) => {
  return (
    <Alert {...props} className={classNames("info", className)} type={"info"}>
      {children}
    </Alert>
  );
};

export default Info;
