export const isNotificationObj = (
  n: UINotificationType,
): n is UINotification | UIFieldNotification => typeof n !== "string" && !(n instanceof Error);

export const isUIFieldNotification = (e: UINotificationType): e is UIFieldNotification =>
  isNotificationObj(e) && e.field !== undefined;

export const isUiNotification = (e: UINotificationType): e is UINotification =>
  isNotificationObj(e) && e.field === undefined;
