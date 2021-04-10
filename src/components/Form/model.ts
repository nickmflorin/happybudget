import React from "react";
import { FormProps as RootFormProps } from "antd/lib/form";

export interface FormProps<T extends { [key: string]: any } = any> extends RootFormProps, StandardComponentProps {
  readonly globalError?: string;
  readonly initialValues?: Partial<T>;
  readonly loading?: boolean;
}

export interface FormFooterProps extends StandardComponentProps {
  readonly children: JSX.Element[] | JSX.Element;
  readonly style?: React.CSSProperties;
  readonly className?: string;
}
