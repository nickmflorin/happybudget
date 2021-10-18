import React from "react";
import classNames from "classnames";

import { Form } from "components";
import { Button } from "components/buttons";
import { EmailInput } from "components/fields";
import { RouterLink } from "components/links";

import { util } from "lib";

import "./LandingForm.scss";

export interface IRecoverPasswordFormValues {
  readonly email: string;
}

interface RecoverPasswordFormProps extends FormProps<IRecoverPasswordFormValues> {
  readonly loading: boolean;
  readonly onSubmit: (values: IRecoverPasswordFormValues) => void;
}

const RecoverPasswordForm: React.FC<RecoverPasswordFormProps> = ({
  loading,
  onSubmit,
  ...props
}: RecoverPasswordFormProps): JSX.Element => {
  return (
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
      <Form.Footer>
        <Button loading={loading} className={"btn btn--login"} htmlType={"submit"}>
          {"Submit"}
        </Button>
        <div className={"switch-text"}>
          {"Back to"}
          <RouterLink to={"/login"}>{"Log In"}</RouterLink>
        </div>
      </Form.Footer>
    </Form.Form>
  );
};

export default RecoverPasswordForm;
