import React from "react";
import classNames from "classnames";

import { Button, Input } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";

import { validateEmail } from "lib/util/validate";

import { Form } from "components";
import { RouterLink } from "components/control/links";

import SocialButton from "../SocialButton";

export interface ILoginFormValues {
  email?: string;
  password?: string;
}

interface LoginFormProps {
  form: any;
  loading: boolean;
  globalError: string | undefined;
  style?: React.CSSProperties;
  className?: string;
  onSubmit: (values: ILoginFormValues) => void;
  onGoogleSuccess: (tokenId: string) => void;
  onGoogleError: (error: any) => void;
}

const LoginForm = ({
  style,
  className,
  form,
  loading,
  globalError,
  onSubmit,
  onGoogleSuccess,
  onGoogleError
}: LoginFormProps): JSX.Element => {
  return (
    <Form.Form
      style={style}
      form={form}
      globalError={globalError}
      className={classNames("login-form", className)}
      onFinish={(values: ILoginFormValues) => onSubmit(values)}
    >
      <Form.Item
        name={"email"}
        rules={[
          { required: true, message: "Please enter an email." },
          () => ({
            validateTrigger: "onSubmit",
            validator(rule: any, value: string) {
              if (value !== "" && !validateEmail(value)) {
                return Promise.reject("Please enter a valid email.");
              }
              return Promise.resolve();
            }
          })
        ]}
      >
        <Input className={"input"} size={"large"} placeholder={"Email"} prefix={<MailOutlined className={"icon"} />} />
      </Form.Item>
      <Form.Item
        className={"mb--0"}
        name={"password"}
        rules={[{ required: true, message: "Please enter a valid password.", min: 8 }]}
      >
        <Input.Password
          className={"input"}
          size={"large"}
          placeholder={"Passsword"}
          prefix={<LockOutlined className={"icon"} />}
        />
      </Form.Item>
      <div className={"forgot-password-text"}>
        <RouterLink className={"forgot-link"}>{"Forgot Password?"}</RouterLink>
      </div>
      <Form.Footer>
        <Button loading={loading} className={"btn--login"} htmlType={"submit"}>
          {"Login"}
        </Button>
        <SocialButton
          text={"Login with Google"}
          provider={"google"}
          onGoogleSuccess={onGoogleSuccess}
          onGoogleError={onGoogleError}
        />
        <div className={"signup-text"}>
          {"Don't have an account yet?"}
          <span>
            <RouterLink to={"/signup"} className={"signup-link"}>
              {"Sign up"}
            </RouterLink>
          </span>
        </div>
      </Form.Footer>
    </Form.Form>
  );
};

export default LoginForm;
