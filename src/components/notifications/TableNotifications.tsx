import React from "react";
import Notifications from "./Notifications";

type TableNotificationsProps = {
  readonly tableId: string;
  readonly notifications: UINotification[];
  readonly offset?: number;
};

const TableNotifications = ({ tableId, offset = 90, ...props }: TableNotificationsProps) => (
  <Notifications
    id={`${tableId}-notifications-container`}
    /* Table notifications need to have a fixed wrapper around the children so
       so that when rendered underneath the table, they ignore the overflow-y
       hidden attributes on the parent. */
    fixedWrapper={true}
    {...props}
    className={"table-notifications"}
    style={{ bottom: `${offset}px` }}
  />
);

export default React.memo(TableNotifications);
