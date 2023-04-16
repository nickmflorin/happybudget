import React from "react";

import classNames from "classnames";

import { Form } from "components";
import { PrimaryButton } from "components/buttonsOld";
import { Input, TimezoneSelect } from "components/fields";

const UserProfileForm: React.FC<FormProps<Http.UserPayload>> = (props): JSX.Element => (
  <Form.Form
    {...props}
    className={classNames("user-profile-form", props.className)}
    layout="vertical"
  >
    <Form.Item
      name="first_name"
      label="First Name"
      rules={[{ required: true, message: "Please provide your first name." }]}
    >
      <Input />
    </Form.Item>
    <Form.Item
      name="last_name"
      label="Last Name"
      rules={[{ required: true, message: "Please provide your last name." }]}
    >
      <Input />
    </Form.Item>
    <Form.Item name="company" label="Company">
      <Input />
    </Form.Item>
    <Form.Item name="position" label="Job Title">
      <Input />
    </Form.Item>
    <Form.Item name="city" label="City">
      <Input />
    </Form.Item>
    <Form.Item name="phone_number" label="Phone Number">
      <Input />
    </Form.Item>
    <Form.Item
      name="timezone"
      label="Time Zone"
      rules={[{ required: true, message: "Please select a timezone." }]}
    >
      <TimezoneSelect />
    </Form.Item>
    <Form.Footer>
      <PrimaryButton htmlType="submit" style={{ width: "100%" }}>
        Save
      </PrimaryButton>
    </Form.Footer>
  </Form.Form>
);

export default UserProfileForm;
