declare type AppNotificationConsoleLevel = "info" | "error" | "warning";
declare type AppNotificationLevel = AppNotificationConsoleLevel | "success";

declare type NotificationDetail = Error | Http.Error | string;

declare type AppNotificationLink = {
  readonly text?: string;
  readonly onClick?: () => void;
};

declare type IncludeLinkParams = {
  readonly setLoading: (v: boolean) => void;
};

declare type IncludeLink = (p: IncludeLinkParams) => AppNotificationLink;

declare type AppNotificationOptions = {
  readonly append?: boolean;
};

declare type AppNotification<L extends AppNotificationLevel = AppNotificationLevel> = {
  readonly level: L;
  readonly message?: string;
  readonly detail?: NotificationDetail;
  readonly closable?: boolean;
  readonly includeLink?: IncludeLink | undefined;
};

declare type FormNotification<L extends AppNotificationLevel = AppNotificationLevel> = AppNotification<L> & {
  readonly field?: string;
};

declare type FormFieldNotification = Omit<FormNotification<"error">, "field" | "message"> & {
  readonly field: string;
  readonly message: string;
};

declare type TableNotification<L extends AppNotificationLevel = AppNotificationLevel> = AppNotification<L> & {
  readonly duration?: number;
};

declare type InternalNotification<L extends AppNotificationLevel = AppNotificationLevel> = AppNotification<L> & {
  readonly dispatchToSentry?: boolean;
  readonly notifyUser?: boolean;
};
