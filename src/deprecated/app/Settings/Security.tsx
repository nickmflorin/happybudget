import React from "react";

import * as api from "api";

import { ui, notifications } from "lib";
import { ChangePasswordForm } from "deprecated/components/forms";
import { ChangePasswordFormValues } from "deprecated/components/forms/ChangePasswordForm";
import { Page } from "deprecated/components/layoutOld";
import { Tile } from "deprecated/components/containers";

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
