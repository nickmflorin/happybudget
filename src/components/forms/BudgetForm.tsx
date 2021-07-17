import React from "react";
import { isNil } from "lodash";
import { Input, Select } from "antd";

import { Form } from "components";
import { FormProps } from "components/forms/Form";
import { UploadUserImage } from "./fields";
import "./BudgetForm.scss";

interface BudgetFormProps extends FormProps<Http.BudgetPayload> {
  imageUrl?: string | null;
  onImageChange?: (f: File | Blob) => void;
  templates?: Model.Template[] | Model.SimpleTemplate[];
  templatesLoading?: boolean;
}

const BudgetForm: React.FC<BudgetFormProps> = ({ imageUrl, onImageChange, templates, templatesLoading, ...props }) => {
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
      {!isNil(templates) ? (
        <Form.Item name={"template"} label={"Template"} rules={[{ required: false }]}>
          <Select
            placeholder={"Choose a template..."}
            loading={templatesLoading === true}
            disabled={templatesLoading === true}
          >
            {templates.map((template: Model.Template | Model.SimpleTemplate, index: number) => (
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
