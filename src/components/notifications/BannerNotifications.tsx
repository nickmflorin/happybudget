import React from "react";
import Notifications from "./Notifications";

type BannerNotificationsProps = {
  readonly notifications: UINotification[];
};

const BannerNotifications = (props: BannerNotificationsProps) => (
  <Notifications {...props} className={"banner-notifications"} />
);

export default React.memo(BannerNotifications);
