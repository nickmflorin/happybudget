import classNames from "classnames";

import { Form } from "components";
import { PasswordInput, EmailInput, UserInput } from "components/fields";
import { Button, SocialButton } from "components/buttons";
import { RouterLink } from "components/links";
import { util } from "lib";

import "./LandingForm.scss";

export interface ISignupFormValues {
  readonly email: string;
  readonly password: string;
  readonly first_name: string;
  readonly last_name: string;
}

interface SignupFormProps extends FormProps<ISignupFormValues> {
  readonly form: FormInstance<ISignupFormValues>;
  readonly loading: boolean;
  readonly onSubmit: (values: ISignupFormValues) => void;
  readonly onGoogleSuccess: (tokenId: string) => void;
  readonly onGoogleError: (error: any) => void;
}

const SignupForm = ({ loading, onSubmit, onGoogleSuccess, onGoogleError, ...props }: SignupFormProps): JSX.Element => {
  return (
    <Form.Form
      {...props}
      className={classNames("landing-form", props.className)}
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
          { required: true, message: "Please enter a valid password." },
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
        <PasswordInput size={"large"} hasValidator={true} />
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
        <PasswordInput size={"large"} placeholder={"Confirm"} hasValidator={true} />
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
