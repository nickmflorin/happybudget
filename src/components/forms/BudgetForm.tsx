import React, { useState } from "react";
import { isNil } from "lodash";
import { Input } from "antd";

import { Form } from "components";
import { FormProps } from "components/Form";
import UploadUserImage from "./UploadUserImage";
import "./BudgetForm.scss";

export interface BudgetFormValues {
  name: string;
  image?: Blob | File | undefined;
}

interface BudgetFormProps extends FormProps<BudgetFormValues> {
  imageUrl?: string | null;
  onImageChange?: (f: File | Blob) => void;
}

const BudgetForm: React.FC<BudgetFormProps> = ({ imageUrl, onImageChange, ...props }) => {
  const [file, setFile] = useState<File | Blob | null>(null);

  return (
    <Form.Form
      className={"budget-form"}
      layout={"vertical"}
      {...props}
      onFinish={(values: BudgetFormValues) => {
        let payload = { ...values };
        if (!isNil(file)) {
          payload = { ...payload, image: file };
        }
        if (!isNil(props.onFinish)) {
          props.onFinish(payload);
        }
      }}
    >
      <Form.Item name={"name"} rules={[{ required: true, message: "Please provide a valid name for the budget." }]}>
        <Input placeholder={"Name"} />
      </Form.Item>
      <Form.Item label={"Avatar"} rules={[{ required: false }]}>
        <UploadUserImage
          initialValue={imageUrl || undefined}
          onChange={(f: File | Blob) => {
            setFile(f);
            if (!isNil(onImageChange)) {
              onImageChange(f);
            }
          }}
          onError={(error: string) => props.form.setGlobalError(error)}
        />
      </Form.Item>
    </Form.Form>
  );
};

export default BudgetForm;
