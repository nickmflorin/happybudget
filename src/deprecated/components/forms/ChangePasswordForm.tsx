import React from "react";

import classNames from "classnames";

import { Form } from "components";
import { PrimaryButton } from "components/buttonsOld";
import { PasswordInput } from "deprecated/components/fields";

export type ChangePasswordFormValues = {
  readonly password: string;
  readonly new_password: string;
  readonly confirm: string;
};

const ChangePasswordForm: React.FC<FormProps<ChangePasswordFormValues>> = (props): JSX.Element => (
  <Form.Form
    {...props}
    className={classNames("user-security-form", props.className)}
    layout="vertical"
  >
    <Form.Item
      name="password"
      label="Current Password"
      rules={[{ required: true, message: "Please enter a valid password." }]}
    >
      <PasswordInput />
    </Form.Item>
    <Form.Item
      name="new_password"
      label="New Password"
      rules={[{ required: true, message: "Please enter a valid password." }]}
    >
      <PasswordInput hasValidator={true} />
    </Form.Item>
    <Form.Item
      name="confirm"
      label="Confirm Password"
      rules={[
        { required: true, message: "Please confirm your password." },
        ({ getFieldValue }) => ({
          validator(_, value) {
            if (!value || getFieldValue("new_password") === value) {
              return Promise.resolve();
            }
            return Promise.reject("The two passwords that you entered do not match!");
          },
        }),
      ]}
    >
      <PasswordInput placeholder="Confirm" />
    </Form.Item>
    <Form.Footer>
      <PrimaryButton htmlType="submit" style={{ width: "100%" }}>
        Save
      </PrimaryButton>
    </Form.Footer>
  </Form.Form>
);

export default ChangePasswordForm;
