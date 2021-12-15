declare type RootFormInstance<T> = import("antd/lib/form").FormInstance<T>;
declare type RootFormProps = import("antd/lib/form").FormProps;

declare interface FormInstance<T> extends RootFormInstance<T> {
  readonly notify: (
    notifications: SingleOrArray<FormNotification | Error | Http.Error | string>,
    opts?: AppNotificationOptions
  ) => void;
  readonly clearNotifications: () => void;
  readonly setLoading: (value: boolean) => void;
  readonly handleRequestError: (e: Error, opts?: AppNotificationOptions) => void;
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

declare type HeaderTemplateFormData = {
  readonly header: string | null;
  readonly left_image: UploadedImage | SavedImage | null;
  readonly left_info: string | null;
  readonly right_image: UploadedImage | SavedImage | null;
  readonly right_info: string | null;
};

declare interface ExportPdfFormOptions {
  readonly columns: string[];
  readonly excludeZeroTotals: boolean;
}

declare type IExportFormRef<O extends ExportPdfFormOptions = ExportPdfFormOptions> = {
  readonly getFormData: () => O;
};

declare interface ExportBudgetPdfFormOptions extends ExportPdfFormOptions {
  readonly header: HeaderTemplateFormData;
  readonly tables?: TableOption[] | null | undefined;
  readonly notes?: string | null;
  readonly includeNotes: boolean;
}
