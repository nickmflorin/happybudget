import React from "react";
import { isNil, map } from "lodash";
import classNames from "classnames";
import Notification, { NotificationProps } from "./Notification";

export type NotificationsProps = StandardComponentProps & {
  /* There are cases where we need to render the notifications outside of the
     parent container when the parent container has overflow: hidden set.  We
     can accomplish this by wrapping the children in a <div> with
		 position: static, which works because the parent notifications <div> has
		 position: absolute. */
  readonly staticWrapper?: boolean;
  readonly bare?: boolean;
  readonly notifications: UINotification[];
  readonly notificationProps?: Omit<NotificationProps, "bare">;
  readonly children?: RenderPropChild<{ notification: UINotification }>;
};

const WrapInStatic = (props: { readonly children: JSX.Element; readonly static?: boolean }): JSX.Element => {
  if (props.static === true) {
    return <div style={{ position: "static" }}>{props.children}</div>;
  }
  return props.children;
};

const Notifications = ({
  children,
  bare,
  notificationProps,
  notifications,
  staticWrapper,
  ...props
}: NotificationsProps) =>
  notifications.length !== 0 ? (
    <div {...props} className={classNames("notifications", props.className)}>
      <WrapInStatic static={staticWrapper}>
        <React.Fragment>
          {map(notifications, (n: UINotification, index: number) => {
            if (!isNil(children)) {
              return <React.Fragment key={index}>{children({ notification: n })}</React.Fragment>;
            }
            return <Notification key={index} {...n} {...notificationProps} bare={bare} />;
          })}
        </React.Fragment>
      </WrapInStatic>
    </div>
  ) : (
    <></>
  );

export default React.memo(Notifications);
