import React from "react";

import { Form } from "components";
import { Input } from "components/fields";
import { BudgetImageUploader } from "components/fields/uploaders";

type TemplateFormProps = FormProps<Http.TemplatePayload> & {
  readonly originalImage?: SavedImage | null;
  readonly onImageChange?: (f: UploadedImage | null) => void;
};

const TemplateForm: React.FC<TemplateFormProps> = ({ originalImage, onImageChange, ...props }) => {
  return (
    <Form.Form className={"template-form"} layout={"vertical"} {...props}>
      <Form.Item name={"name"} rules={[{ required: true, message: "Please provide a valid name for the template." }]}>
        <Input placeholder={"Name"} />
      </Form.Item>
      <Form.Item label={"Avatar"} rules={[{ required: false }]}>
        <BudgetImageUploader
          style={{ height: 215 }}
          value={originalImage}
          onChange={(f: UploadedImage | null) => onImageChange?.(f)}
          onError={(error: Error | string) => props.form.notify(typeof error === "string" ? error : error.message)}
        />
      </Form.Item>
    </Form.Form>
  );
};

export default TemplateForm;
