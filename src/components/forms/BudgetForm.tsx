import React from "react";
import { isNil } from "lodash";

import { Form } from "components";
import { Input } from "components/fields";
import { BudgetImageUploader } from "components/fields/uploaders";

type BudgetFormProps = FormProps<Http.BudgetPayload> & {
  readonly originalImage?: SavedImage | null;
  readonly onImageChange?: (f: UploadedImage | null) => void;
};

const BudgetForm: React.FC<BudgetFormProps> = ({ originalImage, onImageChange, ...props }) => (
  <Form.Form
    className={"budget-form"}
    layout={"vertical"}
    {...props}
    onFinish={(values: Http.BudgetPayload) => {
      const payload = { ...values };
      if (payload.template === undefined) {
        /* eslint-disable @typescript-eslint/no-unused-vars */
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
    <Form.Item label={"Image"} rules={[{ required: false }]}>
      <BudgetImageUploader
        style={{ height: 215 }}
        value={originalImage}
        onChange={(f: UploadedImage | null) => onImageChange?.(f)}
        onError={(error: Error | string) => props.form.notify(typeof error === "string" ? error : error.message)}
      />
    </Form.Item>
  </Form.Form>
);

export default BudgetForm;
