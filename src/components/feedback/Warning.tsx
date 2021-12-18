import classNames from "classnames";
import Alert, { AlertProps } from "./Alert";

export type WarningProps = Omit<AlertProps, "level">;

const Warning: React.FC<WarningProps> = ({ className, ...props }) => (
  <Alert {...props} className={classNames("warning", className)} level={"warning"} />
);

export default Warning;
