import * as api from "api";
import { ui } from "lib";
import { toast } from "react-toastify";

import { FormContainer, ChangePasswordForm } from "components/forms";
import { Page } from "components/layout";
import { ChangePasswordFormValues } from "components/forms/ChangePasswordForm";

const Security = (): JSX.Element => {
  const form = ui.hooks.useForm<ChangePasswordFormValues>();

  return (
    <Page className={"security"} title={"Security"}>
      <FormContainer style={{ maxWidth: 500 }}>
        <ChangePasswordForm
          form={form}
          title={"Change Your Password"}
          onFinish={(values: ChangePasswordFormValues) => {
            form.setLoading(true);
            const payload: Http.ChangePasswordPayload = {
              password: values.password,
              new_password: values.new_password
            };
            api
              .changeUserPassword(payload)
              .then(() => {
                toast.success("Password changed successfully");
              })
              .catch((e: Error) => {
                form.handleRequestError(e);
              })
              .finally(() => {
                form.setLoading(false);
              });
          }}
        />
      </FormContainer>
    </Page>
  );
};

export default Security;
