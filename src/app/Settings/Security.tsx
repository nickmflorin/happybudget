import React from "react";

import * as api from "api";

import { ui, notifications } from "lib";
import { Tile } from "components/containers";
import { ChangePasswordForm } from "components/forms";
import { ChangePasswordFormValues } from "components/forms/ChangePasswordForm";
import { Page } from "components/layoutOld";

const Security = (): JSX.Element => {
  const form = ui.form.useForm<ChangePasswordFormValues>();

  return (
    <Page className="security" title="Security">
      <Tile style={{ maxWidth: 500 }}>
        <ChangePasswordForm
          form={form}
          onFinish={(values: ChangePasswordFormValues) => {
            form.setLoading(true);
            const payload: Http.ChangePasswordPayload = {
              password: values.password,
              new_password: values.new_password,
            };
            api
              .changeUserPassword(payload)
              .then(() =>
                notifications.ui.banner.notify({
                  level: "success",
                  message: "Your password was successfully changed.",
                  duration: 5000,
                }),
              )
              .catch((e: Error) => form.handleRequestError(e))
              .finally(() => form.setLoading(false));
          }}
        />
      </Tile>
    </Page>
  );
};

export default React.memo(Security);
