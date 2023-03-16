import React from "react";

import Notifications from "./Notifications";

type TableNotificationsProps = {
  readonly tableId: string;
  readonly notifications: UINotification[];
  readonly offset?: number;
};

const TableNotifications = ({ tableId, offset = 30, ...props }: TableNotificationsProps) => (
  <Notifications
    id={`${tableId}-notifications-container`}
    /* Table notifications need to have a static wrapper around the children so
       so that when rendered underneath the table, they ignore the overflow-y
       hidden attributes on the parent. */
    staticWrapper={true}
    {...props}
    className="table-notifications"
    style={{ bottom: `${offset}px` }}
  />
);

export default React.memo(TableNotifications);
