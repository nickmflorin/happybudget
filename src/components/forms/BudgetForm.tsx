import React from "react";
import { isNil } from "lodash";
import { Input, Select } from "antd";

import { Form } from "components";
import { FormProps } from "components/Form";
import UploadUserImage from "./UploadUserImage";
import "./BudgetForm.scss";

export interface BudgetFormValues {
  name: string;
  template?: number;
}

interface BudgetFormProps extends FormProps<BudgetFormValues> {
  imageUrl?: string | null;
  onImageChange?: (f: File | Blob) => void;
  templates?: Model.Template[];
  templatesLoading?: boolean;
}

const BudgetForm: React.FC<BudgetFormProps> = ({ imageUrl, onImageChange, templates, templatesLoading, ...props }) => {
  return (
    <Form.Form
      className={"budget-form"}
      layout={"vertical"}
      {...props}
      onFinish={(values: BudgetFormValues) => {
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
      {!isNil(templates) ? (
        <Form.Item name={"template"} label={"Template"} rules={[{ required: false }]}>
          <Select
            placeholder={"Choose a template..."}
            loading={templatesLoading === true}
            disabled={templatesLoading === true}
          >
            {templates.map((template: Model.Template, index: number) => (
              <Select.Option key={index} value={template.id}>
                {template.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      ) : (
        <></>
      )}
      <Form.Item label={"Avatar"} rules={[{ required: false }]}>
        <UploadUserImage
          initialValue={imageUrl || undefined}
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

export default BudgetForm;
