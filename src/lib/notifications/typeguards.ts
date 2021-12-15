import { includes } from "lodash";
import * as api from "api";

export const isNotificationForSentry = (e: AppNotification): e is InternalNotification<"error" | "warning"> =>
  includes(["error", "warning"], e.level);

export const isNotificationForConsole = (
  notification: AppNotification
): notification is AppNotification<AppNotificationConsoleLevel> =>
  includes(["error", "warning", "info"], notification.level);

export const formNotificationIsFieldNotification = (
  notification: FormNotification
): notification is FormFieldNotification => (notification as FormFieldNotification).field !== undefined;

export const isNotificationDetail = (n: AppNotification | NotificationDetail): n is NotificationDetail => {
  return typeof n === "string" || n instanceof Error || api.typeguards.isHttpError(n);
};
