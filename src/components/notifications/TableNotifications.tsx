import React from "react";
import Notifications from "./Notifications";

type TableNotificationsProps = {
  readonly tableId: string;
  readonly notifications: UINotification[];
};

const TableNotifications = ({ tableId, ...props }: TableNotificationsProps) => (
  <Notifications id={`${tableId}-notifications-container`} {...props} className={"table-notifications"} />
);

export default React.memo(TableNotifications);
