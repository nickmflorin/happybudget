import { useEffect, useState } from "react";

import * as api from "api";
import { isNil, includes } from "lodash";
import { Redirect, useLocation } from "react-router-dom";

import { ui } from "lib";
import { ResetPasswordForm } from "components/forms";
import { IResetPasswordFormValues } from "components/forms/ResetPasswordForm";
import { LandingFormContainer } from "deprecated/components/containers";

import { UITokenNotificationRedirectData } from "./Notifications";

type Destination = "/login";

type IRedirect = {
  readonly pathname: Destination;
  readonly state?: {
    readonly notifications?: UINotificationData[];
    readonly tokenNotification?: UITokenNotificationRedirectData;
  };
};

const ResetPassword = (): JSX.Element => {
  const [redirect, setRedirect] = useState<IRedirect | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const form = ui.form.useForm<IResetPasswordFormValues>();
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
    <LandingFormContainer title="Reset password">
      <ResetPasswordForm
        style={{ marginTop: 20 }}
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
                    notifications: [
                      {
                        closable: true,
                        level: "success",
                        message: "Your password was successfully changed.",
                      },
                    ],
                  },
                });
              })
              .catch((e: Error) => {
                /* Before redirecting to this page - the token will have already
								 been validated, so it is an edge case that we would get an
								 authentication error related to the token here.

								 If however we do get that error, we just redirect back to the
                 login page and display the error for simplicity case (versus
								 duplicating all the error handling code here). */
                if (
                  e instanceof api.AuthenticationError &&
                  includes(
                    [api.ErrorCodes.auth.TOKEN_EXPIRED, api.ErrorCodes.auth.TOKEN_INVALID],
                    e.code,
                  )
                ) {
                  setRedirect({
                    pathname: "/login",
                    state: {
                      tokenNotification: {
                        tokenType: "password-recovery",
                        userId: e.userId,
                        code: e.code as Http.TokenErrorCode,
                      },
                    },
                  });
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
