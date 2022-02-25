import React from "react";
import classNames from "classnames";

import { Form } from "components";
import { PrimaryButton } from "components/buttons";
import { EmailInput } from "components/fields";
import { RouterLink } from "components/links";

import { util } from "lib";

export type IRecoverPasswordFormValues = {
  readonly email: string;
};

interface RecoverPasswordFormProps extends FormProps<IRecoverPasswordFormValues> {
  readonly loading: boolean;
  readonly onSubmit: (values: IRecoverPasswordFormValues) => void;
}

const RecoverPasswordForm: React.FC<RecoverPasswordFormProps> = ({
  loading,
  onSubmit,
  ...props
}: RecoverPasswordFormProps): JSX.Element => (
  <Form.Form
    {...props}
    className={classNames("landing-form", props.className)}
    onFinish={(values: IRecoverPasswordFormValues) => onSubmit(values)}
  >
    <Form.Item
      name={"email"}
      rules={[
        { required: true, message: "Please enter a valid email." },
        () => ({
          validateTrigger: "onSubmit",
          validator(rule: unknown, value: string) {
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
    <Form.Footer>
      <PrimaryButton loading={loading} xlarge={true} className={"btn--landing"} htmlType={"submit"}>
        {"Submit"}
      </PrimaryButton>
      <div className={"switch-text"}>
        {"Back to"}
        <RouterLink to={"/login"}>{"Log In"}</RouterLink>
      </div>
    </Form.Footer>
  </Form.Form>
);

export default RecoverPasswordForm;
