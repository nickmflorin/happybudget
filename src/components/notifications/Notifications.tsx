import React from "react";
import { isNil, map } from "lodash";
import classNames from "classnames";
import Notification, { NotificationProps } from "./Notification";

type NotificationsProps = StandardComponentProps & {
  /* There are cases where we need to render the notifications outside of the
     parent container when the parent container has overflow: hidden set.  We
     can accomplish this by wrapping the children in a <div> with
		 position: fixed, which works because the parent notifications <div> has
		 position: absolute. */
  readonly fixedWrapper?: boolean;
  readonly notifications: UINotification[];
  readonly notificationProps?: NotificationProps;
  readonly children?: RenderPropChild<{ notification: UINotification }>;
};

const WrapInFixed = (props: { readonly children: JSX.Element; readonly fixed?: boolean }): JSX.Element => {
  if (props.fixed === true) {
    return <div style={{ position: "fixed" }}>{props.children}</div>;
  }
  return props.children;
};

const Notifications = ({ children, notificationProps, notifications, fixedWrapper, ...props }: NotificationsProps) =>
  notifications.length !== 0 ? (
    <div {...props} className={classNames("notifications", props.className)}>
      <WrapInFixed fixed={fixedWrapper}>
        <React.Fragment>
          {map(notifications, (n: UINotification, index: number) => {
            if (!isNil(children)) {
              return <React.Fragment key={index}>{children({ notification: n })}</React.Fragment>;
            }
            return <Notification key={index} {...n} {...notificationProps} />;
          })}
        </React.Fragment>
      </WrapInFixed>
    </div>
  ) : (
    <></>
  );

export default React.memo(Notifications);
