import React from "react";

import { model } from "lib";

import { Form, Icon } from "components";
import { Input, Select } from "components/fields";

// TODO: Validate the rate as a numeric/integer field!
const MarkupForm: React.FC<FormProps<Http.MarkupPayload>> = ({ ...props }) => {
  return (
    <Form.Form layout={"vertical"} {...props}>
      <Form.Item name={"identifier"}>
        <Input placeholder={"Name"} />
      </Form.Item>
      <Form.Item name={"description"}>
        <Input placeholder={"Description"} />
      </Form.Item>
      <Form.Item name={"unit"}>
        <Select suffixIcon={<Icon icon={"caret-down"} weight={"solid"} />} placeholder={"Select Type"}>
          {model.models.MarkupUnits.map((m: Model.MarkupUnit, index: number) => (
            <Select.Option key={index} value={m.id}>
              {m.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name={"rate"}>
        <Input placeholder={"Rate"} />
      </Form.Item>
    </Form.Form>
  );
};

export default MarkupForm;
