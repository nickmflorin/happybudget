import React from "react";

import classNames from "classnames";

import * as config from "config";
import { util } from "lib";
import { Form, ShowHide } from "components";
import { PrimaryButton, SocialButton } from "components/buttons";
import { PasswordInput, EmailInput } from "components/fields";
import { RouterLink } from "components/links";

export type ILoginFormValues = {
  readonly email?: string;
  readonly password?: string;
};

interface LoginFormProps extends FormProps<ILoginFormValues> {
  readonly loading: boolean;
  readonly onSubmit: (values: ILoginFormValues) => void;
  readonly onGoogleSuccess: (tokenId: string) => void;
  readonly onGoogleScriptLoadFailure: (error: Record<string, unknown>) => void;
  readonly onGoogleError: (error: Record<string, unknown>) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  loading,
  onSubmit,
  onGoogleSuccess,
  onGoogleError,
  onGoogleScriptLoadFailure,
  ...props
}: LoginFormProps): JSX.Element => (
  <Form.Form
    {...props}
    className={classNames("landing-form", props.className)}
    onFinish={(values: ILoginFormValues) => onSubmit(values)}
  >
    <Form.Item
      name="email"
      rules={[
        { required: true, message: "Please enter a valid email." },
        () => ({
          validateTrigger: "onSubmit",
          validator(rule: unknown, value: string) {
            if (value !== "" && !util.validate.validateEmail(value)) {
              return Promise.reject("The email does not meet our requirements.");
            }
            return Promise.resolve();
          },
        }),
      ]}
    >
      <EmailInput size="large" />
    </Form.Item>
    <Form.Item
      style={{ marginBottom: 0 }}
      name="password"
      rules={[{ required: true, message: "Please enter a valid password." }]}
    >
      <PasswordInput size="large" />
    </Form.Item>
    <ShowHide show={config.env.EMAIL_ENABLED}>
      <div className="forgot-password-text">
        <RouterLink to="/recover-password" className="forgot-link">
          Forgot Password?
        </RouterLink>
      </div>
    </ShowHide>
    <Form.Footer>
      <PrimaryButton loading={loading} xlarge={true} className="btn--landing" htmlType="submit">
        Login
      </PrimaryButton>
      <ShowHide show={config.env.SOCIAL_AUTHENTICATION_ENABLED}>
        <SocialButton
          className="btn--landing"
          xlarge={true}
          provider="google"
          onGoogleSuccess={onGoogleSuccess}
          onGoogleError={onGoogleError}
          onGoogleScriptLoadFailure={onGoogleScriptLoadFailure}
        >
          Login with Google
        </SocialButton>
      </ShowHide>
      <div className="switch-text">
        Don't have an account yet?
        <RouterLink to="/signup">Sign Up</RouterLink>
      </div>
    </Form.Footer>
  </Form.Form>
);

export default LoginForm;
