import React from "react";
import { Input } from "antd";

import { Form } from "components";
import { FormProps } from "components/Form";

export interface BudgetFormValues {
  name: string;
}

const BudgetForm: React.FC<FormProps<BudgetFormValues>> = ({ ...props }) => {
  return (
    <Form.Form layout={"vertical"} {...props}>
      <Form.Item name={"name"} rules={[{ required: true, message: "Please provide a valid name for the budget." }]}>
        <Input placeholder={"Name"} />
      </Form.Item>
    </Form.Form>
  );
};

export default BudgetForm;
