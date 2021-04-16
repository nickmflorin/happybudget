import classNames from "classnames";
import Alert, { AlertProps } from "./Alert";

export interface InfoProps extends Omit<AlertProps, "type"> {}

const Info: React.FC<InfoProps> = ({ children, className, title, detail, ...props }) => {
  return (
    <Alert className={classNames("info", className)} type={"info"} {...props}>
      {children}
    </Alert>
  );
};

export default Info;
