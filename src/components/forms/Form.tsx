import { map, filter, isNil, find } from "lodash";
import classNames from "classnames";

import { Form as RootForm } from "antd";
import { FormProps as RootFormProps } from "antd/lib/form";

import { DisplayAlert, RenderWithSpinner } from "components/display";

interface FormFooterProps extends StandardComponentProps {
  children: JSX.Element[] | JSX.Element;
}

const FormFooter = ({ children, className, style = {} }: FormFooterProps) => {
  return (
    <div className={classNames("form-footer", className)} style={style}>
      {children}
    </div>
  );
};

export interface FormProps extends RootFormProps, StandardComponentProps {
  globalError?: string;
  loading?: boolean;
}

interface _FormProps extends FormProps {
  children: JSX.Element[] | JSX.Element;
}

const Form = ({ globalError, loading, children, className, style = {}, ...props }: _FormProps): JSX.Element => {
  const childrenArray = Array.isArray(children) ? children : [children];
  const footer = find(childrenArray, (child: JSX.Element) => child.type === FormFooter);
  return (
    <RootForm {...props} className={classNames(className, "form")} style={style}>
      <RenderWithSpinner loading={loading}>
        {map(
          filter(childrenArray, (child: JSX.Element) => child.type !== FormFooter),
          (child: JSX.Element) => child
        )}
        <div className={"form-alert-wrapper"}>
          <DisplayAlert>{globalError}</DisplayAlert>
        </div>
        {!isNil(footer) && footer}
      </RenderWithSpinner>
    </RootForm>
  );
};

Form.GlobalError = DisplayAlert;
Form.Item = RootForm.Item;
Form.Footer = FormFooter;
Form.useForm = RootForm.useForm;

export default Form;
