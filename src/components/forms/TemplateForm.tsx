import React from "react";
import { isNil } from "lodash";

import { Input } from "antd";

import { Form } from "components";
import { FormProps } from "components/forms/Form";

import { UploadUserImage } from "./fields";
import "./TemplateForm.scss";

interface TemplateFormProps extends FormProps<Http.TemplatePayload> {
  imageUrl?: string | null;
  onImageChange?: (f: File | Blob) => void;
}

const TemplateForm: React.FC<TemplateFormProps> = ({ imageUrl, onImageChange, ...props }) => {
  return (
    <Form.Form className={"template-form"} {...props}>
      <Form.Item name={"name"} rules={[{ required: true, message: "Please provide a valid name for the template." }]}>
        <Input placeholder={"Name"} />
      </Form.Item>
      <Form.Item label={"Avatar"}>
        <UploadUserImage
          initialValue={imageUrl}
          onChange={(f: File | Blob) => {
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
