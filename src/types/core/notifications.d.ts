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

declare type UINotificationOptions = {
  readonly append?: boolean;
};

declare type AppNotification<L extends AppNotificationLevel = AppNotificationLevel> = {
  readonly level?: L; // Defaults to warning.
  readonly message?: string;
};

declare type UINotification<L extends AppNotificationLevel = AppNotificationLevel> = AppNotification<L> & {
  readonly field?: string;
  readonly closable?: boolean;
  readonly detail?: NotificationDetail;
  readonly includeLink?: IncludeLink | undefined;
};

declare type UIFieldNotification = {
  readonly field: string;
  readonly message: string;
};

type FieldWithErrors = { readonly name: string; readonly errors: string[] };

declare type TableNotification<L extends AppNotificationLevel = AppNotificationLevel> = AppNotification<L> & {
  readonly duration?: number;
  readonly closable?: boolean;
  readonly detail?: NotificationDetail;
  readonly includeLink?: IncludeLink | undefined;
};

declare type ExternalNotification<L extends AppNotificationLevel = AppNotificationLevel> =
  | TableNotification<L>
  | UINotification<L>;

declare type InternalNotification = AppNotification<"error" | "warning"> & {
  readonly dispatchToSentry?: boolean;
  readonly error?: Error;
};

declare type UINotificationsHandler = {
  readonly notify: (
    notifications: SingleOrArray<UINotification | Error | Http.Error | string>,
    opts?: UINotificationOptions
  ) => void;
  readonly clearNotifications: () => void;
  readonly handleRequestError: (e: Error, opts?: UINotificationOptions) => void;
  readonly notifications: UINotification[];
};
