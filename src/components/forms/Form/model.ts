import React from "react";
import { FormProps as RootFormProps, FormInstance as RootFormInstance } from "antd/lib/form";
import { ClientError } from "api";

export interface FormInstance<T> extends RootFormInstance<T> {
  readonly handleRequestError: (e: Error) => void;
  readonly renderFieldErrors: (e: ClientError) => void;
  readonly setGlobalError: (e: Error | string) => void;
  readonly setLoading: (value: boolean) => void;
  readonly globalError: string | undefined;
  readonly loading: boolean | undefined;
  readonly isInModal?: boolean;
  // If it is a boolean, it will automatically focus the first field based on
  // whether or not the boolean is true.  If it is a number, it will automatically
  // focus the field at that index.
  readonly autoFocusField?: boolean | number;
}

export interface FormProps<T> extends Omit<RootFormProps, "style" | "id" | "className">, StandardComponentProps {
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

export interface FormFooterProps extends StandardComponentProps {
  readonly children: JSX.Element[] | JSX.Element;
  readonly style?: React.CSSProperties;
  readonly className?: string;
}
