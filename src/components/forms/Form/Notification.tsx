import React from "react";
import classNames from "classnames";

import { Notify } from "components/feedback";
import { NotifyProps } from "components/feedback/Notify";

type FormNotificationProps = Omit<NotifyProps, "type"> & {
  readonly type?: AlertType;
};

const FormNotification: React.FC<FormNotificationProps> = ({ type = "error", children, ...props }) => (
  <Notify {...props} type={type} className={classNames("form-error", props.className)}>
    {children}
  </Notify>
);

export default FormNotification;
