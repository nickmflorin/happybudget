import * as api from "api";

export const notificationDetailToString = (e: NotificationDetail) => {
  return e instanceof Error ? String(e) : typeof e === "string" ? e : api.standardizeError(e).message;
};
