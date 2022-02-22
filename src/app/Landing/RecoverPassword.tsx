import { useState } from "react";

import * as api from "api";
import { ui } from "lib";

import { LandingFormContainer } from "components/containers";
import { RecoverPasswordForm } from "components/forms";
import { IRecoverPasswordFormValues } from "components/forms/RecoverPasswordForm";

const RecoverPassword = (): JSX.Element => {
  const [loading, setLoading] = useState(false);
  const form = ui.hooks.useForm<IRecoverPasswordFormValues>();

  return (
    <LandingFormContainer title={"Reset password"}>
      <RecoverPasswordForm
        style={{ marginTop: 20 }}
        form={form}
        loading={loading}
        onSubmit={(values: IRecoverPasswordFormValues) => {
          setLoading(true);
          api
            .recoverPassword(values.email)
            .then(() => {
              form.notify({
                level: "success",
                message: "Email successfully sent.",
                detail: "Please check your inbox.",
                closable: true
              });
            })
            .catch((e: Error) => form.handleRequestError(e))
            .finally(() => setLoading(false));
        }}
      />
    </LandingFormContainer>
  );
};

export default RecoverPassword;
