import * as api from "api";
import { ui } from "lib";

import { ChangePasswordForm } from "components/forms";
import { Page, Tile } from "components/layout";
import { ChangePasswordFormValues } from "components/forms/ChangePasswordForm";

const Security = (): JSX.Element => {
  const form = ui.hooks.useForm<ChangePasswordFormValues>();

  return (
    <Page className={"security"} title={"Security"}>
      <Tile style={{ maxWidth: 500 }}>
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
                // TODO: Display success notification in banner.
                form.notify({ message: "Password changed successfully", level: "success" });
              })
              .catch((e: Error) => {
                form.handleRequestError(e);
              })
              .finally(() => {
                form.setLoading(false);
              });
          }}
        />
      </Tile>
    </Page>
  );
};

export default Security;
