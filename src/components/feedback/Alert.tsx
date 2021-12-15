import { Alert as RootAlert } from "antd";
import classNames from "classnames";

import { util } from "lib";

export interface AlertProps extends StandardComponentProps, Omit<AppNotification, "detail"> {
  readonly visible?: boolean;
  readonly detail?: string | JSX.Element;
}

const Alert: React.FC<AlertProps> = (props: AlertProps) => {
  return (
    <RootAlert
      {...props}
      className={classNames("alert", props.className)}
      type={props.level}
      showIcon={true}
      message={props.message === undefined ? util.formatters.toTitleCase(props.level) : props.message}
      description={props.detail}
    />
  );
};

export default Alert;
