declare type RootFormInstance<T> = import("antd/lib/form").FormInstance<T>;
declare type RootFormProps = import("antd/lib/form").FormProps;

declare type FormFieldNotification = {
  readonly field: string;
  readonly message: string;
};

declare type FormNotificationWithMeta<S> = {
  readonly type?: AlertType;
  readonly closable?: boolean;
  readonly notification: S;
};

declare type RawFormNotification = JSX.Element | FormFieldNotification | IAlert | string | Http.Error;

declare type FormNotification = RawFormNotification | FormNotificationWithMeta<Http.Error | string>;

declare type FormNotifyOptions = {
  readonly type?: AlertType;
  readonly append?: boolean;
  readonly closable?: boolean;
};

declare interface FormInstance<T> extends RootFormInstance<T> {
  readonly notify: (notifications: SingleOrArray<FormNotification>, opts?: FormNotifyOptions) => void;
  readonly clearNotifications: () => void;
  readonly setLoading: (value: boolean) => void;
  readonly handleRequestError: (e: Error, opts?: FormNotifyOptions) => void;
  readonly notifications: FormNotification[];
  readonly loading: boolean | undefined;
  readonly isInModal?: boolean;
  /* If it is a boolean, it will automatically focus the first field based on
     whether or not the boolean is true.  If it is a number, it will automatically
     focus the field at that index. */
  readonly autoFocusField?: boolean | number;
}

// The declare type of iterable passed to AntD's form.setFields([...])
declare type FormField<M> = { readonly name: keyof M; readonly value: M[keyof M] };

declare interface FormProps<T> extends Omit<RootFormProps, "style" | "id" | "className">, StandardComponentProps {
  readonly loading?: boolean;
  readonly form: FormInstance<T>;
  /* If it is a boolean, it will automatically focus the first field based on
     whether or not the boolean is true.  If it is a number, it will automatically
     focus the field at that index. */
  readonly autoFocusField?: boolean | number;
  readonly titleIcon?: IconOrElement;
  readonly title?: string | JSX.Element;
  readonly condensed?: boolean;
}
