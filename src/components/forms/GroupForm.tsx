import React, { useEffect } from "react";
import { Input } from "antd";

import { useGroupColors } from "lib/hooks";

import { Form } from "components";
import { FormProps } from "components/Form";
import { ColorSelect } from "components/forms";
import { isNil } from "lodash";

export interface GroupFormValues {
  name: string;
  color: string;
}

const GroupForm: React.FC<FormProps<GroupFormValues>> = ({ ...props }) => {
  const [colors, loading, error] = useGroupColors();

  useEffect(() => {
    props.form.setLoading(loading);
  }, [loading]);

  useEffect(() => {
    if (!isNil(error)) {
      props.form.handleRequestError(error);
    }
  }, [error]);

  return (
    <Form.Form layout={"vertical"} {...props}>
      <Form.Item name={"name"} rules={[{ required: true, message: "Please provide a valid name for the group." }]}>
        <Input placeholder={"Name"} />
      </Form.Item>
      <Form.Item name={"color"} label={"Color"}>
        <ColorSelect colors={colors} />
      </Form.Item>
    </Form.Form>
  );
};

export default GroupForm;
