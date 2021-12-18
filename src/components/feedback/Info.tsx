import classNames from "classnames";
import Alert, { AlertProps } from "./Alert";

export type InfoProps = Omit<AlertProps, "level">;

const Info: React.FC<InfoProps> = ({ className, ...props }) => (
  <Alert {...props} className={classNames("info", className)} level={"info"} />
);

export default Info;
