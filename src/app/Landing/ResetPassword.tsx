import { useEffect, useState } from "react";
import { Redirect, useLocation } from "react-router-dom";
import { isNil } from "lodash";

import * as api from "api";
import { ui } from "lib";

import { ResetPasswordForm } from "components/forms";
import { IResetPasswordFormValues } from "components/forms/ResetPasswordForm";

import LandingFormContainer from "./LandingFormContainer";

type Destination = "/login";

type IRedirect = {
  readonly pathname: Destination;
  readonly state?: {
    readonly error?: Error | undefined;
    readonly tokenType: Http.TokenType | undefined;
    readonly notification?: AppNotification | string | undefined;
  };
};

const ResetPassword = (): JSX.Element => {
  const [redirect, setRedirect] = useState<IRedirect | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const form = ui.hooks.useForm<IResetPasswordFormValues>();
  const location = useLocation<{
    readonly token?: string | undefined;
  }>();

  useEffect(() => {
    if (isNil(location.state?.token)) {
      setRedirect({ pathname: "/login" });
    }
  }, [location.state]);

  if (!isNil(redirect)) {
    return <Redirect to={redirect} />;
  }
  return (
    <LandingFormContainer title={"Reset password"}>
      <ResetPasswordForm
        className={"mb--20 mt--20"}
        form={form}
        loading={loading}
        onSubmit={(values: IResetPasswordFormValues) => {
          const token = location.state?.token;
          if (!isNil(token)) {
            const payload: Http.ResetPasswordPayload = { token, password: values.password };
            setLoading(true);
            api
              .resetPassword(payload)
              .then(() => {
                setRedirect({
                  pathname: "/login",
                  state: {
                    notification: {
                      closable: true,
                      level: "success",
                      message: "Your password was successfully changed."
                    },
                    tokenType: "password-recovery"
                  }
                });
              })
              .catch((e: Error) => {
                /* Before redirecting to this page - the token will have already
								 been validated, so it is an edge case that we would get an
								 authentication error related to the token here.

								 If however we do get that error, we just redirect back to the
                 login page and display the error for simplicity case (versus
								 duplicating all the error handling code here). */
                if (e instanceof api.ClientError && !isNil(e.authenticationError)) {
                  setRedirect({ pathname: "/login", state: { error: e, tokenType: "password-recovery" } });
                } else {
                  form.handleRequestError(e);
                }
              })
              .finally(() => setLoading(false));
          }
        }}
      />
    </LandingFormContainer>
  );
};

export default ResetPassword;
