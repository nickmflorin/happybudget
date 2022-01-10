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

declare type UINotificationBehavior = "append" | "replace";

declare type UINotificationOptions = {
  /* In the case of Table notifications, the default behavior will be to append
     the notification to the existing notifications that are shown.  In the
		 case of Form notifications, the default behavior is to replace a preivous
		 notification with the new one.
		 */
  readonly behavior?: UINotificationBehavior;
  /* We allow the message to be provided as an option in the case that the
     notification object itself is an Error or Http.Error. */
  readonly message?: string;
  /* We allow the detail to be provided as an option in the case that the
     notification object itself is an Error or Http.Error. */
  readonly detail?: string;
  /* We allow the duration to be provided as an option in the case that we want
	   to apply the same duration to several dispatched notifications. */
  readonly duration?: number;
  /* We allow the closable behavior to be provided as an option in the case that
		 we want to apply the same behavior to several dispatched notifications. */
  readonly closable?: boolean;
  /* If set to True, a notification will not be dispatched if it is deemed a
	   duplicate of a notification already in state. */
  readonly ignoreIfDuplicate?: boolean;
};

declare type AppNotification<L extends AppNotificationLevel = AppNotificationLevel> = {
  readonly level?: L; // Defaults to warning.
  readonly message?: string;
};

declare type UINotificationData<L extends AppNotificationLevel = AppNotificationLevel> = AppNotification<L> & {
  readonly closable?: boolean;
  readonly detail?: NotificationDetail;
  readonly duration?: number;
  readonly includeLink?: IncludeLink | undefined;
};

declare type UINotification<L extends AppNotificationLevel = AppNotificationLevel> = UINotificationData<L> & {
  /* Each UINotification that is in the state managed by the reducer needs to
	 have a unique ID so that we can reference that ID if we need to remove or
	 perform another action on that notification specifically in the future. */
  readonly id: number;
  readonly remove: () => void;
};

declare type UIFieldNotification = {
  readonly field: string;
  readonly message: string;
};

declare type UIExistingNotificationId = "budgetSubscriptionPermissionError";

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
type DefaultExistingNotificationParams = Record<string, never>;
type ExistingNotificationParams = Record<string, unknown>;

declare type UIExistingNotification<T extends ExistingNotificationParams = DefaultExistingNotificationParams> = (
  props: T
) => UINotificationData;

declare type UIExistingNotifications = { [key in UIExistingNotificationId]: UIPresetNotification };

declare type InferExistingNotificationParams<T> = T extends UIExistingNotification<infer P> ? P : never;

declare type FieldWithErrors = { readonly name: string; readonly errors: string[] };

declare type UINotification<L extends AppNotificationLevel = AppNotificationLevel> =
  | TableNotification<L>
  | FormNotification<L>;

declare type InternalNotification = AppNotification<"error" | "warning"> & {
  readonly dispatchToSentry?: boolean;
  readonly error?: Error;
};

declare type UINotificationsHandler = {
  readonly notify: (notifications: SingleOrArray<UINotificationType>, opts?: UINotificationOptions) => UINotification[];
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  readonly lookupAndNotify: (id: UIExistingNotificationId, params: any) => UINotification[];
  readonly clearNotifications: (ids?: SingleOrArray<number>) => void;
  readonly handleRequestError: (e: Error, opts?: UINotificationOptions) => UINotification[];
  readonly notifications: UINotification[];
};

type UINonFieldNotificationType = UINotificationData | NotificationDetail;

type UINotificationType = UINonFieldNotificationType | UIFieldNotification;

type UINotificationStandard<N> = {
  readonly typeguard: (n: UINotificationType) => n is N;
  /* Null is returned if for whatever reason, the notification cannot be
     standardized and must be ignored. */
  readonly func: (n: N, opts: Omit<UINotificationOptions, "behavior">) => UINotificationData | null;
};

type UINotificationEquality<N> = {
  readonly typeguard: (n: UINotificationType) => n is N;
  readonly func: (n1: N, n2: N) => boolean;
};
