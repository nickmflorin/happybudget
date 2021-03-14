import { ReactNode } from "react";

import { Form as RootForm } from "antd";
import { FormProps as RootFormProps } from "antd/lib/form";

import { DisplayAlert, RenderWithSpinner } from "components/display";

interface FormProps extends RootFormProps {
  globalError?: string;
  children: ReactNode;
  loading?: boolean;
}

const Form = ({ globalError, loading, children, ...props }: FormProps): JSX.Element => {
  return (
    <RootForm {...props}>
      <RenderWithSpinner loading={loading}>
        {children}
        <DisplayAlert>{globalError}</DisplayAlert>
      </RenderWithSpinner>
    </RootForm>
  );
};

Form.Item = RootForm.Item;
Form.useForm = RootForm.useForm;

export default Form;
