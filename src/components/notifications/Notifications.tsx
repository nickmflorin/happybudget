import React from "react";
import { isNil, map } from "lodash";
import classNames from "classnames";
import Notification, { NotificationProps } from "./Notification";

type NotificationsProps = StandardComponentProps & {
  readonly notifications: UINotification[];
  readonly notificationProps?: NotificationProps;
  readonly children?: RenderPropChild<{ notification: UINotification }>;
};

const Notifications = ({ children, notificationProps, notifications, ...props }: NotificationsProps) =>
  notifications.length !== 0 ? (
    <div {...props} className={classNames("notifications", props.className)}>
      {map(notifications, (n: UINotification, index: number) => {
        if (!isNil(children)) {
          return <React.Fragment key={index}>{children({ notification: n })}</React.Fragment>;
        }
        return <Notification key={index} {...n} {...notificationProps} />;
      })}
    </div>
  ) : (
    <></>
  );

export default React.memo(Notifications);
