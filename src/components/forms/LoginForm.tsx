import React from "react";
import classNames from "classnames";

import { Form } from "components";
import { PasswordInput, EmailInput } from "components/fields";
import { Button, SocialButton } from "components/buttons";
import { RouterLink } from "components/links";
import { util } from "lib";

import "./LandingForm.scss";

export interface ILoginFormValues {
  readonly email?: string;
  readonly password?: string;
}

interface LoginFormProps extends FormProps<ILoginFormValues> {
  readonly loading: boolean;
  readonly onSubmit: (values: ILoginFormValues) => void;
  readonly onGoogleSuccess: (tokenId: string) => void;
  readonly onGoogleError: (error: any) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  loading,
  onSubmit,
  onGoogleSuccess,
  onGoogleError,
  ...props
}: LoginFormProps): JSX.Element => {
  return (
    <Form.Form
      {...props}
      className={classNames("landing-form", props.className)}
      onFinish={(values: ILoginFormValues) => onSubmit(values)}
    >
      <Form.Item
        name={"email"}
        rules={[
          { required: true, message: "Please enter a valid email." },
          () => ({
            validateTrigger: "onSubmit",
            validator(rule: any, value: string) {
              if (value !== "" && !util.validate.validateEmail(value)) {
                return Promise.reject("The email does not meet our requirements.");
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
        rules={[{ required: true, message: "Please enter a valid password." }]}
      >
        <PasswordInput size={"large"} />
      </Form.Item>
      <div className={"forgot-password-text"}>
        <RouterLink to={"/recover-password"} className={"forgot-link"}>
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
          <RouterLink to={"/signup"}>{"Sign Up"}</RouterLink>
        </div>
      </Form.Footer>
    </Form.Form>
  );
};

export default LoginForm;
