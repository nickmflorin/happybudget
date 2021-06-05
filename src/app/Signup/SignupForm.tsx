import React from "react";
import classNames from "classnames";

import { Button, Input } from "antd";
import { MailOutlined, LockOutlined, UserOutlined } from "@ant-design/icons";

import { Form } from "components";
import { RouterLink } from "components/links";
import { validateEmail, validatePassword } from "lib/util/validate";
import SocialButton from "../SocialButton";

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
      className={classNames("signup-form", className)}
      onFinish={(values: ISignupFormValues) => onSubmit(values)}
    >
      <div className={"input-group-title"}>{"Profile"}</div>
      <Form.Item name={"first_name"} rules={[{ required: true, message: "Please enter a valid first name." }]}>
        <Input className={"input"} size={"large"} prefix={<UserOutlined />} placeholder={"First name"} />
      </Form.Item>
      <Form.Item name={"last_name"} rules={[{ required: true, message: "Please enter a valid last name." }]}>
        <Input className={"input"} size={"large"} prefix={<UserOutlined />} placeholder={"Last name"} />
      </Form.Item>
      <Form.Item
        name={"email"}
        rules={[
          { required: true, message: "Please enter an email." },
          ({ getFieldValue }) => ({
            validator(rule, value) {
              if (value !== "" && !validateEmail(value)) {
                return Promise.reject("Please enter a valid email.");
              }
              return Promise.resolve();
            }
          })
        ]}
      >
        <Input className={"input"} size={"large"} placeholder={"Email"} prefix={<MailOutlined />} />
      </Form.Item>
      <Form.Item
        name={"password"}
        rules={[
          { required: true, message: "Please enter a valid password.", min: 8 },
          ({ getFieldValue }) => ({
            validator(rule, value) {
              if (value !== "" && !validatePassword(value)) {
                return Promise.reject("The password does not meet our requirements.");
              }
              return Promise.resolve();
            }
          })
        ]}
      >
        <Input.Password className={"input"} size={"large"} placeholder={"Password"} prefix={<LockOutlined />} />
        {/* <Tooltip
          overlayStyle={{ whiteSpace: "pre-line" }}
          trigger={["focus"]}
          placement={"right"}
          title={
            "At least 1 special character (!@#$%^&*)\nAt least 1 uppercase letter\nAt least 1 lowercase letter\nAt least 1 number\nAt least 8 characters long"
          }
        >
          <Input.Password className={"input"} size={"large"} placeholder={"Password"} prefix={<LockOutlined />} />
        </Tooltip> */}
      </Form.Item>
      <Form.Item
        name={"confirm"}
        rules={[
          { required: true, message: "Please confirm your password.", min: 8 },
          ({ getFieldValue }) => ({
            validator(rule, value) {
              if (value !== "" && !validatePassword(value)) {
                return Promise.reject("The password does not meet our requirements.");
              }
              return Promise.resolve();
            }
          })
        ]}
      >
        <Input.Password className={"input"} size={"large"} placeholder={"Confirm"} prefix={<LockOutlined />} />
      </Form.Item>
      <Form.Footer style={{ marginTop: 20 }}>
        <Button loading={loading} className={"btn--login"} htmlType={"submit"}>
          {"Register"}
        </Button>
        <SocialButton
          text={"Signup with Google"}
          provider={"google"}
          onGoogleSuccess={onGoogleSuccess}
          onGoogleError={onGoogleError}
        />
        <div className={"login-text"}>
          {"Already have an account?"}
          <span>
            <RouterLink to={"/login"} className={"login-link"}>
              {"Log in"}
            </RouterLink>
          </span>
        </div>
      </Form.Footer>
    </Form.Form>
  );
};

export default SignupForm;
