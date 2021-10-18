import { useState } from "react";
import { Redirect } from "react-router-dom";
import { isNil } from "lodash";

import * as api from "api";
import { ui } from "lib";

import { RecoverPasswordForm } from "components/forms";
import { IRecoverPasswordFormValues } from "components/forms/RecoverPasswordForm";

import LandingFormContainer from "./LandingFormContainer";

type Destination = "/login";

type IRedirect = {
  readonly pathname: Destination;
  readonly state?: {
    readonly error?: Error | undefined;
    readonly tokenType: Http.TokenType | undefined;
  };
};

const RecoverPassword = (): JSX.Element => {
  const [redirect, setRedirect] = useState<IRedirect | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const form = ui.hooks.useForm<IRecoverPasswordFormValues>();

  if (!isNil(redirect)) {
    return <Redirect to={redirect} />;
  }
  return (
    <LandingFormContainer title={"Reset password"}>
      <RecoverPasswordForm
        className={"mb--20 mt--20"}
        form={form}
        loading={loading}
        onSubmit={(values: IRecoverPasswordFormValues) => {
          setLoading(true);
          api
            .sendForgotPasswordEmail(values.email)
            .then(() => {
              form.notify({
                type: "success",
                title: "Email successfully sent.",
                message: "Please check your inbox.",
                closable: true
              });
            })
            .catch((e: Error) => {
              // Before redirecting to this page - the token will have already been validated,
              // so it is an edge case that we would get an authentication error related to the
              // token here.  If however we do get that error, we just redirect back to the
              // login page and display the error for simplicity case (versus duplicating all the
              // error handling code here).
              if (e instanceof api.ClientError && e.authenticationErrors.length !== 0) {
                setRedirect({ pathname: "/login", state: { error: e, tokenType: "password-recovery" } });
              } else {
                form.handleRequestError(e);
              }
            })
            .finally(() => setLoading(false));
        }}
      />
    </LandingFormContainer>
  );
};

export default RecoverPassword;
