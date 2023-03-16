import React from "react";

import classNames from "classnames";

import { util } from "lib";
import { Form } from "components";
import { PrimaryButton } from "components/buttons";
import { PasswordInput } from "components/fields";
import { RouterLink } from "components/links";

export type IResetPasswordFormValues = {
  readonly password: string;
  readonly confirm: string;
};

interface ResetPasswordFormProps extends FormProps<IResetPasswordFormValues> {
  readonly loading: boolean;
  readonly onSubmit: (values: IResetPasswordFormValues) => void;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  loading,
  onSubmit,
  ...props
}: ResetPasswordFormProps): JSX.Element => (
  <Form.Form
    {...props}
    className={classNames("landing-form", props.className)}
    onFinish={(values: IResetPasswordFormValues) => onSubmit(values)}
  >
    <Form.Item
      name="password"
      rules={[
        { required: true, message: "Please enter a valid password." },
        () => ({
          validator(rule: unknown, value: string) {
            if (value !== "" && !util.validate.validatePassword(value)) {
              return Promise.reject("The password does not meet our requirements.");
            }
            return Promise.resolve();
          },
        }),
      ]}
    >
      <PasswordInput size="large" hasValidator={true} />
    </Form.Item>
    <Form.Item
      name="confirm"
      rules={[
        { required: true, message: "Please confirm your password.", min: 8 },
        ({
          getFieldValue,
        }: {
          getFieldValue: (
            field: keyof IResetPasswordFormValues,
          ) => IResetPasswordFormValues[keyof IResetPasswordFormValues];
        }) => ({
          validator(rule: unknown, value: string) {
            if (value !== "" && getFieldValue("password") !== value) {
              return Promise.reject("The two passwords that you entered do not match!");
            }
            return Promise.resolve();
          },
        }),
      ]}
    >
      <PasswordInput size="large" placeholder="Confirm" hasValidator={true} />
    </Form.Item>
    <Form.Footer>
      <PrimaryButton xlarge={true} loading={loading} className="btn--landing" htmlType="submit">
        Reset
      </PrimaryButton>
      <div className="switch-text">
        Back to
        <RouterLink to="/login">Log In</RouterLink>
      </div>
    </Form.Footer>
  </Form.Form>
);

export default ResetPasswordForm;
