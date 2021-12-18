import classNames from "classnames";
import Alert, { AlertProps } from "./Alert";

export type SuccessProps = Omit<AlertProps, "level">;

const Success: React.FC<SuccessProps> = ({ className, ...props }) => (
  <Alert {...props} className={classNames("success", className)} level={"success"} />
);

export default Success;
