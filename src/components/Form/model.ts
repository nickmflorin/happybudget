import React from "react";
import { FormProps as RootFormProps, FormInstance as RootFormInstance } from "antd/lib/form";
import { ClientError } from "api";

export interface FormInstance<T extends { [key: string]: any } = any> extends RootFormInstance<T> {
  handleRequestError: (e: Error) => void;
  renderFieldErrors: (e: ClientError) => void;
  setGlobalError: (e: string) => void;
  setLoading: (value: boolean) => void;
  globalError: string | undefined;
  loading: boolean | undefined;
}

export interface FormProps<T extends { [key: string]: any } = any>
  extends Omit<RootFormProps, "style" | "id" | "className">,
    StandardComponentProps {
  readonly globalError?: string;
  // readonly initialValues?: Partial<T>;
  readonly loading?: boolean;
  readonly form: FormInstance<T>;
  // Typing things internal to AntD's form seem to rely on generic typing of the forwardRef which
  // is most likely not possible.
  // readonly onFinish?: (values: T) => void;
}

export interface FormFooterProps extends StandardComponentProps {
  readonly children: JSX.Element[] | JSX.Element;
  readonly style?: React.CSSProperties;
  readonly className?: string;
}
