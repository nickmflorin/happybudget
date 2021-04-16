import React from "react";
import { Input } from "antd";

import { Form } from "components";
import { FormProps } from "components/Form";

export interface TemplateFormValues {
  name: string;
}

const TemplateForm: React.FC<FormProps<TemplateFormValues>> = ({ ...props }) => {
  return (
    <Form.Form layout={"vertical"} {...props}>
      <Form.Item name={"name"} rules={[{ required: true, message: "Please provide a valid name for the template." }]}>
        <Input placeholder={"Name"} />
      </Form.Item>
    </Form.Form>
  );
};

export default TemplateForm;
