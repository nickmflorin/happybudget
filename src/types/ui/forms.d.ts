type RootFormInstance<T> = import("antd/lib/form").FormInstance<T>
type RootFormProps = import("antd/lib/form").FormProps;

interface FormInstance<T> extends RootFormInstance<T> {
  readonly handleRequestError: (e: Error) => void;
  readonly renderFieldErrors: (e: Http.IHttpClientError) => void;
  readonly setGlobalError: (e: Error | string | undefined) => void;
  readonly setLoading: (value: boolean) => void;
  readonly globalError: string | undefined;
  readonly loading: boolean | undefined;
  readonly isInModal?: boolean;
  // If it is a boolean, it will automatically focus the first field based on
  // whether or not the boolean is true.  If it is a number, it will automatically
  // focus the field at that index.
  readonly autoFocusField?: boolean | number;
}

interface FormProps<T> extends Omit<RootFormProps, "style" | "id" | "className">, StandardComponentProps {
  readonly globalError?: string;
  readonly loading?: boolean;
  readonly form: FormInstance<T>;
  // If it is a boolean, it will automatically focus the first field based on
  // whether or not the boolean is true.  If it is a number, it will automatically
  // focus the field at that index.
  readonly autoFocusField?: boolean | number;
  // Typing things internal to AntD's form seem to rely on generic typing of the forwardRef which
  // is most likely not possible.
  // readonly onFinish?: (values: T) => void;
}
