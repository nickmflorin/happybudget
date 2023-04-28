import * as api from "application/api";
import { logger } from "internal";
import { user } from "lib/model";
import { useForm } from "lib/ui/forms/hooks";

import { Form, FormProps } from "./Form";

type LoginFormData = {
  readonly email: string;
  readonly password: string;
};

export type LoginFormProps = Omit<FormProps<LoginFormData>, "form" | "children" | "onSubmit"> & {
  readonly onSuccess: (user: user.User) => void;
};

export const LoginForm = ({ onSuccess, ...props }: LoginFormProps): JSX.Element => {
  const form = useForm<LoginFormData>();

  return (
    <Form<LoginFormData>
      {...props}
      form={form}
      onSubmit={(data: LoginFormData) => {
        logger.error("SUBMITTING");
        logger.error({ data });
        form.setSubmitting(true);
        api.login(data.email, data.password).then((response: api.ClientResponse<user.User>) => {
          if (response.error) {
            form.setFeedback(response.error);
          } else {
            onSuccess(response.response);
          }
        });
        form.setSubmitting(false);
      }}
    >
      <Form.TextInputField<LoginFormData, "email">
        form={form}
        registerOptions={{ required: true }}
        name="email"
        label="Email"
      />
      <Form.TextInputField<LoginFormData, "password">
        form={form}
        registerOptions={{ required: true }}
        name="password"
        label="Password"
      />
    </Form>
  );
};
