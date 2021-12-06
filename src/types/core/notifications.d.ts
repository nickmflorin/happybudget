declare type AppNotification = Error | string | object;

declare type AppNotificationConsoleLevel = "info" | "error" | "warning";
declare type AppNotificationLevel = AppNotificationConsoleLevel | "success";

declare interface AppNotificationContext<L extends AppNotificationLevel = AppNotificationLevel> {
  readonly message?: string;
  readonly dispatchToSentry?: boolean;
  readonly notifyUser?: boolean;
  readonly level: L;
}
