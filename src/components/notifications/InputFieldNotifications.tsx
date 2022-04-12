import React from "react";
import classNames from "classnames";

import Notifications, { NotificationsProps } from "./Notifications";

type InputFieldNotificationsProps = Omit<NotificationsProps, "bare">;

const InputFieldNotifications = (props: InputFieldNotificationsProps): JSX.Element => (
  <Notifications {...props} bare={true} className={classNames("input-field-notifications", props.className)} />
);

export default React.memo(InputFieldNotifications);
