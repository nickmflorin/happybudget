import React from "react";
import classNames from "classnames";

import { Form } from "components";
import { PasswordInput, EmailInput } from "components/fields";
import { Button, SocialButton } from "components/buttons";
import { RouterLink } from "components/links";
import { util } from "lib";

export interface ILoginFormValues {
  email?: string;
  password?: string;
}

interface LoginFormProps extends StandardComponentProps {
  form: any;
  loading: boolean;
  style?: React.CSSProperties;
  className?: string;
  onSubmit: (values: ILoginFormValues) => void;
  onGoogleSuccess: (tokenId: string) => void;
  onGoogleError: (error: any) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  style,
  className,
  form,
  loading,
  onSubmit,
  onGoogleSuccess,
  onGoogleError
}: LoginFormProps): JSX.Element => {
  return (
    <Form.Form
      style={style}
      form={form}
      className={classNames("landing-form", className)}
      onFinish={(values: ILoginFormValues) => onSubmit(values)}
    >
      <Form.Item
        name={"email"}
        rules={[
          { required: true, message: "Please enter an email." },
          () => ({
            validateTrigger: "onSubmit",
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
        className={"mb--0"}
        name={"password"}
        rules={[{ required: true, message: "Please enter a valid password.", min: 8 }]}
      >
        <PasswordInput size={"large"} />
      </Form.Item>
      <div className={"forgot-password-text"}>
        <RouterLink to={"#"} className={"forgot-link"}>
          {"Forgot Password?"}
        </RouterLink>
      </div>
      <Form.Footer>
        <Button loading={loading} className={"btn btn--login"} htmlType={"submit"}>
          {"Login"}
        </Button>
        <SocialButton
          text={"Login with Google"}
          provider={"google"}
          onGoogleSuccess={onGoogleSuccess}
          onGoogleError={onGoogleError}
        />
        <div className={"switch-text"}>
          {"Don't have an account yet?"}
          <RouterLink to={"/signup"}>{"Sign up"}</RouterLink>
        </div>
      </Form.Footer>
    </Form.Form>
  );
};

export default LoginForm;
