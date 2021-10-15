type RootFormInstance<T> = import("antd/lib/form").FormInstance<T>;
type RootFormProps = import("antd/lib/form").FormProps;

type FormFieldNotification = {
  readonly field: string;
  readonly message: string;
};

type FormNotificationWithLevel<S> = {
  readonly level: AlertType;
  readonly notification: S;
};

type RawFormNotification =
  | JSX.Element
  | FormFieldNotification
  | IAlert
  | string
  | Http.Error;

type FormNotification =
  | RawFormNotification
  | FormNotificationWithLevel<Http.Error | string>;

type FormNotifyOptions = {
  readonly level?: AlertType;
  readonly append?: boolean;
};

interface FormInstance<T> extends RootFormInstance<T> {
  readonly notify: (notifications: SingleOrArray<FormNotification>, opts?: FormNotifyOptions) => void;
  readonly clearNotifications: () => void;
  readonly setLoading: (value: boolean) => void;
  readonly handleRequestError: (e: Error) => void;
  readonly notifications: FormNotification[];
  readonly loading: boolean | undefined;
  readonly isInModal?: boolean;
  // If it is a boolean, it will automatically focus the first field based on
  // whether or not the boolean is true.  If it is a number, it will automatically
  // focus the field at that index.
  readonly autoFocusField?: boolean | number;
}

interface FormProps<T> extends Omit<RootFormProps, "style" | "id" | "className">, StandardComponentProps {
  readonly loading?: boolean;
  readonly form: FormInstance<T>;
  // If it is a boolean, it will automatically focus the first field based on
  // whether or not the boolean is true.  If it is a number, it will automatically
  // focus the field at that index.
  readonly autoFocusField?: boolean | number;
}
