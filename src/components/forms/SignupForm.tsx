import classNames from "classnames";
import { isNil } from "lodash";

import * as config from "config";
import { util } from "lib";
import { Form } from "components";
import { PrimaryButton, SocialButton } from "components/buttons";
import { PasswordInput, EmailInput, UserInput } from "components/fields";
import { RouterLink, Link } from "components/links";

export type ISignupFormValues = {
  readonly email: string;
  readonly password: string;
  readonly first_name: string;
  readonly last_name: string;
};

interface SignupFormProps extends FormProps<ISignupFormValues> {
  readonly form: FormInstance<ISignupFormValues>;
  readonly loading: boolean;
  readonly onSubmit: (values: ISignupFormValues) => void;
  readonly onGoogleSuccess: (tokenId: string) => void;
  readonly onGoogleError: (error: Record<string, unknown>) => void;
  readonly onGoogleScriptLoadFailure: (error: Record<string, unknown>) => void;
}

const SignupForm = ({
  loading,
  onSubmit,
  onGoogleSuccess,
  onGoogleScriptLoadFailure,
  onGoogleError,
  ...props
}: SignupFormProps): JSX.Element => (
  <Form.Form<ISignupFormValues>
    {...props}
    className={classNames("landing-form", props.className)}
    onFinish={(values: ISignupFormValues) => onSubmit(values)}
  >
    <Form.Item
      name="first_name"
      rules={[{ required: true, message: "Please enter a valid first name." }]}
    >
      <UserInput size="large" placeholder="First name" />
    </Form.Item>
    <Form.Item
      name="last_name"
      rules={[{ required: true, message: "Please enter a valid last name." }]}
    >
      <UserInput size="large" placeholder="Last name" />
    </Form.Item>
    <Form.Item
      name="email"
      rules={[
        { required: true, message: "Please enter a valid email." },
        () => ({
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
        { required: true, message: "Please confirm your password." },
        ({ getFieldValue }) => ({
          validator(_, value) {
            if (!value || getFieldValue("password") === value) {
              return Promise.resolve();
            }
            return Promise.reject("The two passwords that you entered do not match!");
          },
        }),
      ]}
    >
      <PasswordInput size="large" placeholder="Confirm" />
    </Form.Item>
    <Form.Footer style={{ marginTop: 20 }}>
      <PrimaryButton xlarge={true} loading={loading} className="btn--landing" htmlType="submit">
        Register
      </PrimaryButton>
      <SocialButton
        className="btn--landing"
        provider="google"
        xlarge={true}
        onGoogleSuccess={onGoogleSuccess}
        onGoogleError={onGoogleError}
        onGoogleScriptLoadFailure={onGoogleScriptLoadFailure}
      >
        Signup with Google
      </SocialButton>
      {!isNil(config.env.TERMS_AND_CONDITIONS_URL) ? (
        <div className="alt-link-text">
          By signing up, you agree to our
          <Link href={`${config.env.TERMS_AND_CONDITIONS_URL}`}>Terms and Conditions.</Link>
        </div>
      ) : (
        <></>
      )}
      <div className="switch-text">
        Already have an account?
        <RouterLink to="/login">Log In</RouterLink>
      </div>
    </Form.Footer>
  </Form.Form>
);

export default SignupForm;
