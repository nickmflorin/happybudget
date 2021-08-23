import React from "react";
import classNames from "classnames";

import { Form } from "components";
import { PasswordInput, EmailInput, UserInput } from "components/fields";
import { Button, SocialButton } from "components/buttons";
import { RouterLink } from "components/links";
import { util } from "lib";

export interface ISignupFormValues {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

interface SignupFormProps {
  form: any;
  loading: boolean;
  style?: React.CSSProperties;
  className?: string;
  onSubmit: (values: ISignupFormValues) => void;
  onGoogleSuccess: (tokenId: string) => void;
  onGoogleError: (error: any) => void;
}

const SignupForm = ({
  style,
  className,
  form,
  loading,
  onSubmit,
  onGoogleSuccess,
  onGoogleError
}: SignupFormProps): JSX.Element => {
  return (
    <Form.Form
      style={style}
      form={form}
      className={classNames("landing-form", className)}
      onFinish={(values: ISignupFormValues) => onSubmit(values)}
    >
      <Form.Item name={"first_name"} rules={[{ required: true, message: "Please enter a valid first name." }]}>
        <UserInput size={"large"} placeholder={"First name"} />
      </Form.Item>
      <Form.Item name={"last_name"} rules={[{ required: true, message: "Please enter a valid last name." }]}>
        <UserInput size={"large"} placeholder={"Last name"} />
      </Form.Item>
      <Form.Item
        name={"email"}
        rules={[
          { required: true, message: "Please enter an email." },
          ({ getFieldValue }: { getFieldValue: any }) => ({
            validator(rule: any, value: string) {
              if (value !== "" && !util.validate.validateEmail(value)) {
                return Promise.reject("Please enter a valid email.");
              }
              return Promise.resolve();
            }
          })
        ]}
      >
        <EmailInput size={"large"} />
      </Form.Item>
      <Form.Item
        name={"password"}
        rules={[
          { required: true, message: "Please enter a valid password.", min: 8 },
          ({ getFieldValue }: { getFieldValue: any }) => ({
            validator(rule: any, value: string) {
              if (value !== "" && !util.validate.validatePassword(value)) {
                return Promise.reject("The password does not meet our requirements.");
              }
              return Promise.resolve();
            }
          })
        ]}
      >
        <PasswordInput size={"large"} />
      </Form.Item>
      <Form.Item
        name={"confirm"}
        rules={[
          { required: true, message: "Please confirm your password.", min: 8 },
          ({ getFieldValue }: { getFieldValue: any }) => ({
            validator(rule: any, value: string) {
              if (value !== "" && !util.validate.validatePassword(value)) {
                return Promise.reject("The password does not meet our requirements.");
              }
              return Promise.resolve();
            }
          })
        ]}
      >
        <PasswordInput size={"large"} placeholder={"Confirm"} />
      </Form.Item>
      <Form.Footer style={{ marginTop: 20 }}>
        <Button loading={loading} className={"btn btn--login"} htmlType={"submit"}>
          {"Register"}
        </Button>
        <SocialButton
          text={"Signup with Google"}
          provider={"google"}
          onGoogleSuccess={onGoogleSuccess}
          onGoogleError={onGoogleError}
        />
        <div className={"switch-text"}>
          {"Already have an account?"}
          <RouterLink to={"/login"}>{"Log in"}</RouterLink>
        </div>
      </Form.Footer>
    </Form.Form>
  );
};

export default SignupForm;
