import { forwardRef } from "react";
import { filter, isNil, find } from "lodash";
import classNames from "classnames";

import { Form as RootForm } from "antd";

import { RenderWithSpinner } from "components";
import Error from "./Error";
import Footer from "./Footer";
import { FormProps } from "./model";
import useForm from "./useForm";

export * from "./model";

interface PrivateFormProps<T = any> extends FormProps<T> {
  children: JSX.Element[] | JSX.Element;
}

const PrivateForm = <T extends { [key: string]: any } = any>(
  { globalError, initialValues, loading, children, className, style = {}, ...props }: PrivateFormProps<T>,
  ref: any
): JSX.Element => {
  const childrenArray = Array.isArray(children) ? children : [children];
  const footer = find(childrenArray, (child: JSX.Element) => child.type === Footer);

  return (
    <RootForm
      {...props}
      ref={ref}
      initialValues={initialValues}
      className={classNames(className, "form")}
      style={style}
    >
      <RenderWithSpinner loading={!isNil(props.form.loading) ? props.form.loading : loading}>
        {filter(childrenArray, (child: JSX.Element) => child.type !== Footer)}
        <div className={"form-alert-wrapper"}>
          <Error>{(props.form && props.form.globalError) || globalError}</Error>
        </div>
        {!isNil(footer) && footer}
      </RenderWithSpinner>
    </RootForm>
  );
};

const Form = forwardRef(PrivateForm);

const exportable = {
  Form: Form,
  Error: Error,
  useForm: useForm,
  Footer: Footer,
  Item: RootForm.Item
};

export default exportable;
