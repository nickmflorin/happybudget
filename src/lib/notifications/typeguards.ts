import * as api from "api";

export const isNotificationDetail = (n: AppNotification | NotificationDetail): n is NotificationDetail => {
  return typeof n === "string" || n instanceof Error || api.typeguards.isHttpError(n);
};
