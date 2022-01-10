import * as api from "api";

export const isNotificationObj = (n: UINotificationType): n is UINotification | UIFieldNotification =>
  typeof n !== "string" && !(n instanceof Error) && !api.typeguards.isHttpError(n);

export const isUIFieldNotification = (e: UINotificationType): e is UIFieldNotification =>
  isNotificationObj(e) && (e as UIFieldNotification).field !== undefined;

export const isUiNotification = (e: UINotificationType): e is UINotification =>
  isNotificationObj(e) && (e as UIFieldNotification).field === undefined;

export const isError = (n: UINotificationType): n is Error => typeof n !== "string" && n instanceof Error;
