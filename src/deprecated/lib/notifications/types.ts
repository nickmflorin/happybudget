export type AppNotificationConsoleLevel = "info" | "error" | "warning";
export type AppNotificationLevel = AppNotificationConsoleLevel | "success";

export type UINotificationDetail = Http.ApiError | string;

export type UINotificationBehavior = "append" | "replace";

export type UINotificationOptions = {
  /*
	In the case of Table notifications, the default behavior will be to append
	the notification to the existing notifications that are shown.  In the
	case of Form notifications, the default behavior is to replace a preivous
	notification with the new one.
	*/
  readonly behavior?: UINotificationBehavior;
  /*
	We allow the message to be provided as an option in the case that the
	notification object itself is an Error or Http.Error.
	*/
  readonly message?: string;
  /*
	We allow the detail to be provided as an option in the case that the
  notification object itself is an Error or Http.Error.
	*/
  readonly detail?: string;
  /*
	We allow the duration to be provided as an option in the case that we want
	to apply the same duration to several dispatched notifications.
	*/
  readonly duration?: number;
  /*
	We allow the closable behavior to be provided as an option in the case that
	we want to apply the same behavior to several dispatched notifications.
	*/
  readonly closable?: boolean;
  /*
	If set to True, a notification will not be dispatched if it is deemed a
	duplicate of a notification already in state.
	*/
  readonly ignoreIfDuplicate?: boolean;
};

export type AppNotification<L extends AppNotificationLevel = AppNotificationLevel> = {
  readonly level?: L; // Defaults to warning.
  readonly message?: string;
};

export type UINotificationData<L extends AppNotificationLevel = AppNotificationLevel> =
  AppNotification<L> & {
    readonly closable?: boolean;
    readonly detail?: UINotificationDetail;
    readonly duration?: number;
    readonly includeLink?: IncludeLink | undefined;
  };

export type UINotification<L extends AppNotificationLevel = AppNotificationLevel> =
  UINotificationData<L> & {
    /*
	Each UINotification that is in the state managed by the reducer needs to
	have a unique ID so that we can reference that ID if we need to remove or
	perform another action on that notification specifically in the future.
	*/
    readonly id: number;
    readonly remove: () => void;
  };

export type UIFieldNotification = {
  readonly field: string;
  readonly message: string;
};

export type UIExistingNotificationId =
  | "budgetSubscriptionPermissionError"
  | "budgetCountPermissionError";

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
type DefaultExistingNotificationParams = Record<string, never>;
type ExistingNotificationParams = Record<string, unknown>;

export type UIExistingNotification<
  T extends ExistingNotificationParams = DefaultExistingNotificationParams,
> = (props: T) => UINotificationData;

export type UIExistingNotifications = {
  [key in UIExistingNotificationId]: UIExistingNotification;
};

export type InferExistingNotificationParams<T> = T extends UIExistingNotification<infer P>
  ? P
  : never;

export type FieldWithErrors = { readonly name: string; readonly errors: string[] };

export type InternalNotificationObj = AppNotification<"error" | "warning"> & {
  readonly dispatchToSentry?: boolean;
  readonly error?: Error;
};

export type InternalNotification = InternalNotificationObj | Error | string;

export type UINotificationsHandler = {
  readonly getNotifications: (
    notifications: SingleOrArray<UINotificationType>,
    opts?: UINotificationOptions,
  ) => UINotificationData[];
  readonly getRequestErrorNotifications: (
    e:
      | import("api/deprecated/errors").ClientError
      | import("api/deprecated/errors").NetworkError
      | import("api/deprecated/errors").ServerError,
    opts?: UINotificationOptions & { readonly dispatchClientErrorToSentry?: boolean },
  ) => UINotificationData[];
};

export type UINotificationsManager = {
  readonly notify: (
    notifications: SingleOrArray<UINotificationType>,
    opts?: UINotificationOptions,
  ) => UINotification[];
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  readonly lookupAndNotify: (id: UIExistingNotificationId, params: any) => UINotification[];
  readonly clearNotifications: (ids?: SingleOrArray<number>) => void;
  readonly handleRequestError: (
    e: Error,
    opts?: UINotificationOptions & { readonly dispatchClientErrorToSentry?: boolean },
  ) => UINotification[];
  readonly notifications: UINotification[];
};

type UINonFieldNotificationType = UINotificationData | UINotificationDetail;

type UINotificationType = UINonFieldNotificationType | UIFieldNotification;

type UINotificationStandard<N> = {
  readonly typeguard: (n: UINotificationType) => n is N;
  /*
	Null is returned if for whatever reason, the notification cannot be
  standardized and must be ignored.
	*/
  readonly func: (n: N, opts: Omit<UINotificationOptions, "behavior">) => UINotificationData | null;
};

type UINotificationEquality<N> = {
  readonly typeguard: (n: UINotificationType) => n is N;
  readonly func: (n1: N, n2: N) => boolean;
};
