import { forwardRef } from "react";
import { filter, isNil, find } from "lodash";
import classNames from "classnames";

import { Form as RootForm } from "antd";

import { DisplayAlert, RenderWithSpinner } from "components/display";
import Footer from "./Footer";
import { FormProps } from "./model";
import useForm from "./useForm";

interface _FormProps<T extends { [key: string]: any } = any> extends FormProps<T> {
  children: JSX.Element[] | JSX.Element;
  form: any;
}

const _Form = <T extends { [key: string]: any } = any>(
  { globalError, initialValues, loading, children, className, style = {}, ...props }: _FormProps<T>,
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
      <RenderWithSpinner loading={loading}>
        {filter(childrenArray, (child: JSX.Element) => child.type !== Footer)}
        <div className={"form-alert-wrapper"}>
          <DisplayAlert>{(props.form && props.form.globalError.current) || globalError}</DisplayAlert>
        </div>
        {!isNil(footer) && footer}
      </RenderWithSpinner>
    </RootForm>
  );
};

const Form = forwardRef(_Form);

const exportable = {
  Form: Form,
  useForm: useForm,
  Footer: Footer,
  Item: RootForm.Item
};

export default exportable;
