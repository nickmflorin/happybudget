type AppNotification = Error | string | object;

type AppNotificationConsoleLevel = "info" | "error" | "warning";
type AppNotificationLevel = AppNotificationConsoleLevel | "success";

interface AppNotificationContext<L extends AppNotificationLevel = AppNotificationLevel> {
  readonly message?: string;
  readonly dispatchToSentry?: boolean;
  readonly notifyUser?: boolean;
  readonly level: L;
}