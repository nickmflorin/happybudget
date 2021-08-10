import React from "react";

import { Form } from "components";
import { Input } from "components/fields";
import { FormProps } from "components/forms/Form";
import { UploadBudgetImage } from "components/uploaders";
import "./TemplateForm.scss";

interface TemplateFormProps extends FormProps<Http.TemplatePayload> {
  originalImage?: SavedImage | null;
  onImageChange?: (f: UploadedImage | null) => void;
}

const TemplateForm: React.FC<TemplateFormProps> = ({ originalImage, onImageChange, ...props }) => {
  return (
    <Form.Form className={"template-form"} {...props}>
      <Form.Item name={"name"} rules={[{ required: true, message: "Please provide a valid name for the template." }]}>
        <Input placeholder={"Name"} />
      </Form.Item>
      <Form.Item label={"Avatar"}>
        <UploadBudgetImage
          value={originalImage}
          onChange={(f: UploadedImage | null) => onImageChange?.(f)}
          onError={(error: Error | string) => props.form.setGlobalError(error)}
        />
      </Form.Item>
    </Form.Form>
  );
};

export default TemplateForm;
