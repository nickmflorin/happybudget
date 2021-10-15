import React from "react";
import { isNil } from "lodash";

import { Form } from "components";
import { Input } from "components/fields";
import { UploadBudgetImage } from "components/uploaders";
import "./BudgetForm.scss";

interface BudgetFormProps extends FormProps<Http.BudgetPayload> {
  originalImage?: SavedImage | null;
  onImageChange?: (f: UploadedImage | null) => void;
}

const BudgetForm: React.FC<BudgetFormProps> = ({ originalImage, onImageChange, ...props }) => {
  return (
    <Form.Form
      className={"budget-form"}
      layout={"vertical"}
      {...props}
      onFinish={(values: Http.BudgetPayload) => {
        let payload = { ...values };
        if (payload.template === undefined) {
          const { template, ...newPayload } = payload;
          if (!isNil(props.onFinish)) {
            props.onFinish(newPayload);
          }
        } else {
          if (!isNil(props.onFinish)) {
            props.onFinish(payload);
          }
        }
      }}
    >
      <Form.Item name={"name"} rules={[{ required: true, message: "Please provide a valid name for the budget." }]}>
        <Input placeholder={"Name"} />
      </Form.Item>
      <Form.Item label={"Avatar"} rules={[{ required: false }]}>
        <UploadBudgetImage
          value={originalImage}
          onChange={(f: UploadedImage | null) => onImageChange?.(f)}
          onError={(error: Error | string) => props.form.notify(typeof error === "string" ? error : error.message)}
        />
      </Form.Item>
    </Form.Form>
  );
};

export default BudgetForm;
