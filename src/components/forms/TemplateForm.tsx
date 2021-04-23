import React, { useState } from "react";
import { isNil } from "lodash";

import { Input } from "antd";

import { Form } from "components";
import { FormProps } from "components/Form";

import UploadUserImage from "./UploadUserImage";
import "./TemplateForm.scss";

export interface TemplateFormValues {
  name: string;
  image?: Blob | File | undefined;
}

interface TemplateFormProps extends FormProps<TemplateFormValues> {
  imageUrl?: string | null;
  onImageChange?: (f: File | Blob) => void;
}

const TemplateForm: React.FC<TemplateFormProps> = ({ imageUrl, onImageChange, ...props }) => {
  const [file, setFile] = useState<File | Blob | null>(null);

  return (
    <Form.Form
      className={"template-form"}
      layout={"vertical"}
      {...props}
      onFinish={(values: TemplateFormValues) => {
        let payload = { ...values };
        if (!isNil(file)) {
          payload = { ...payload, image: file };
        }
        if (!isNil(props.onFinish)) {
          props.onFinish(payload);
        }
      }}
    >
      <Form.Item name={"name"} rules={[{ required: true, message: "Please provide a valid name for the template." }]}>
        <Input placeholder={"Name"} />
      </Form.Item>
      <Form.Item label={"Avatar"}>
        <UploadUserImage
          initialValue={imageUrl}
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

export default TemplateForm;
