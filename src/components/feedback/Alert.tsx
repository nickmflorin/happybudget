import { Alert as RootAlert } from "antd";
import classNames from "classnames";

import { util } from "lib";

export interface AlertProps extends StandardComponentProps, Omit<ExternalNotification, "detail"> {
  readonly visible?: boolean;
  readonly detail?: string | JSX.Element;
}

const Alert: React.FC<AlertProps> = (props: AlertProps) => {
  return (
    <RootAlert
      {...props}
      className={classNames("alert", props.className)}
      type={props.level || "warning"}
      showIcon={true}
      message={props.message === undefined ? util.formatters.toTitleCase(props.level || "warning") : props.message}
      description={props.detail}
    />
  );
};

export default Alert;
