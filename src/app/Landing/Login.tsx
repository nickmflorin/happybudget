import { useEffect, useState, useMemo } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { isNil } from "lodash";

import * as api from "api";
import { ui, notifications } from "lib";

import { LoginForm } from "components/forms";
import { ILoginFormValues } from "components/forms/LoginForm";

import {
  EmailTokenExpiredNotification,
  EmailTokenInvalidNotification,
  UnverifiedEmailNotification,
  PasswordTokenExpiredNotification,
  PasswordTokenInvalidNotification,
  UITokenNotificationRedirectData
} from "./Notifications";
import LandingFormContainer from "./LandingFormContainer";

const Login = (): JSX.Element => {
  const [loading, setLoading] = useState(false);
  const form = ui.hooks.useForm<ILoginFormValues>();
  const history = useHistory();
  const location = useLocation<{
    readonly notifications?: UINotificationData[];
    readonly tokenNotification?: UITokenNotificationRedirectData;
  }>();

  const handleLoginError = useMemo(
    () => (e: Error) => {
      if (e instanceof api.ClientError && !isNil(e.authenticationError)) {
        if (e.authenticationError.code === api.ErrorCodes.ACCOUNT_NOT_VERIFIED) {
          if (isNil(e.authenticationError.user_id)) {
            console.error(
              `The user's email confirmation token has expired, but we cannot
								resend the verification email because the response did not include
								the user's ID.`
            );
          }
          form.notify(
            UnverifiedEmailNotification({
              userId: e.authenticationError.user_id,
              onSuccess: () =>
                form.notify({
                  level: "success",
                  message: "Confirmation email successfully sent.",
                  detail: "Please check your inbox.",
                  closable: true
                }),
              onError: (err: Error) => form.handleRequestError(err)
            })
          );
        } else {
          form.handleRequestError(e);
        }
      } else {
        form.handleRequestError(e);
      }
    },
    [form.handleRequestError]
  );

  useEffect(() => {
    if (!isNil(location.state?.tokenNotification)) {
      const n = location.state.tokenNotification;
      /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
      const { state, ...statelessLocation } = location;
      history.replace(statelessLocation);
      if (n.tokenType === "email-confirmation") {
        if (n.code === api.ErrorCodes.TOKEN_EXPIRED) {
          if (isNil(n.userId)) {
            console.error(
              `Email confirmation token has expired, but we cannot
								resend the email because the response did not include the user's ID.`
            );
          }
          form.notify(
            EmailTokenExpiredNotification({
              userId: n.userId,
              onSuccess: () =>
                form.notify({
                  level: "success",
                  message: "Confirmation email successfully sent.",
                  detail: "Please check your inbox.",
                  closable: true
                }),
              onError: (err: Error) => form.handleRequestError(err)
            })
          );
        } else {
          form.notify(EmailTokenInvalidNotification());
        }
      } else {
        if (n.code === api.ErrorCodes.TOKEN_EXPIRED) {
          if (isNil(n.userId)) {
            console.error(
              `Password recovery token has expired, but we cannot
								resend the email because the response did not include the user's ID.`
            );
          }
          form.notify(PasswordTokenExpiredNotification());
        } else {
          form.notify(PasswordTokenInvalidNotification());
        }
      }
    }
    const notices = location.state?.notifications;
    if (!isNil(notices)) {
      form.notify(notices);
    }
  }, [location.state]);

  return (
    <LandingFormContainer title={"Sign In"} subTitle={"Cloud based budgeting at your fingertips."}>
      <LoginForm
        className={"mt--20"}
        form={form}
        loading={loading}
        onGoogleSuccess={(token: string) => {
          setLoading(true);
          api
            .socialLogin({ token_id: token, provider: "google" })
            .then((user: Model.User) => {
              if (user.is_first_time === true) {
                history.push("/discover");
              } else {
                history.push("/");
              }
            })
            .catch((e: Error) => handleLoginError(e))
            .finally(() => setLoading(false));
        }}
        onGoogleScriptLoadFailure={(error: Record<string, unknown>) => {
          notifications.notify({ level: "error", dispatchToSentry: true, message: notifications.objToJson(error) });
        }}
        onGoogleError={(error: Record<string, unknown>) => {
          notifications.notify({ level: "error", dispatchToSentry: true, message: notifications.objToJson(error) });
          form.notify("There was an error authenticating with Google.");
        }}
        onSubmit={(values: ILoginFormValues) => {
          const email = values.email;
          if (!isNil(email) && !isNil(values.password)) {
            api
              .login(email.toLowerCase(), values.password)
              .then((user: Model.User) => {
                if (user.is_first_time === true) {
                  history.push("/discover");
                } else {
                  history.push("/");
                }
              })
              .catch((e: Error) => handleLoginError(e))
              .finally(() => setLoading(false));
          }
        }}
      />
    </LandingFormContainer>
  );
};

export default Login;
