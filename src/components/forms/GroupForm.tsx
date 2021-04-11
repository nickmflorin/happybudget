import React from "react";
import { Input } from "antd";

import { Form } from "components";
import { FormProps } from "components/Form";
import { ColorSelect } from "components/forms";

export interface GroupFormValues {
  name: string;
  color: string;
}

const GroupForm: React.FC<FormProps<GroupFormValues>> = ({ ...props }) => {
  return (
    <Form.Form layout={"vertical"} {...props}>
      <Form.Item name={"name"} rules={[{ required: true, message: "Please provide a valid name for the group." }]}>
        <Input placeholder={"Name"} />
      </Form.Item>
      <Form.Item
        name={"color"}
        label={"Color"}
        rules={[{ required: true, message: "Please select a color for the group." }]}
      >
        <ColorSelect
          colors={[
            "#797695",
            "#ff7165",
            "#80cbc4",
            "#ce93d8",
            "#fed835",
            "#c87987",
            "#69f0ae",
            "#a1887f",
            "#81d4fa",
            "#f75776",
            "#66bb6a",
            "#58add6"
          ]}
        />
      </Form.Item>
    </Form.Form>
  );
};

export default GroupForm;
