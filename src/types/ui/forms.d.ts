type RootFormInstance<T> = import("antd/lib/form").FormInstance<T>
type RootFormProps = import("antd/lib/form").FormProps;

interface GlobalFormError {
  readonly title?: string;
  readonly description?: string;
}

interface FormInstance<T> extends RootFormInstance<T> {
  readonly handleRequestError: (e: Error) => void;
  readonly renderFieldErrors: (e: Http.IHttpClientError) => void;
  readonly setGlobalError: (e: GlobalFormError | Error | string | undefined) => void;
  readonly renderNotification: (e: JSX.Element | undefined) => void;
  readonly setLoading: (value: boolean) => void;
  readonly renderedNotification: JSX.Element | undefined;
  readonly globalError: GlobalFormError | string | undefined;
  readonly loading: boolean | undefined;
  readonly isInModal?: boolean;
  // If it is a boolean, it will automatically focus the first field based on
  // whether or not the boolean is true.  If it is a number, it will automatically
  // focus the field at that index.
  readonly autoFocusField?: boolean | number;
}

interface FormProps<T> extends Omit<RootFormProps, "style" | "id" | "className">, StandardComponentProps {
  readonly globalError?: GlobalFormError | string;
  readonly loading?: boolean;
  readonly form: FormInstance<T>;
  // If it is a boolean, it will automatically focus the first field based on
  // whether or not the boolean is true.  If it is a number, it will automatically
  // focus the field at that index.
  readonly autoFocusField?: boolean | number;
}
