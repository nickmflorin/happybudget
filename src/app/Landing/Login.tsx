import { useEffect, useState, useMemo } from "react";

import { isNil } from "lodash";
import { useHistory, useLocation } from "react-router-dom";

import * as api from "api";
import * as config from "config";
import { ui, notifications } from "lib";
import { LandingFormContainer } from "components/containers";
import { LoginForm } from "components/forms";
import { ILoginFormValues } from "components/forms/LoginForm";

import {
  EmailTokenExpiredNotification,
  EmailTokenInvalidNotification,
  UnverifiedEmailNotification,
  PasswordTokenExpiredNotification,
  PasswordTokenInvalidNotification,
  UITokenNotificationRedirectData,
} from "./Notifications";

const Login = (): JSX.Element => {
  const [loading, setLoading] = useState(false);
  const form = ui.form.useForm<ILoginFormValues>();
  const history = useHistory();
  const location = useLocation<{
    readonly notifications?: UINotificationData[];
    readonly tokenNotification?: UITokenNotificationRedirectData;
  }>();

  const handleLoginError = useMemo(
    () => (e: Error) => {
      if (
        e instanceof api.AuthenticationError &&
        e.code === api.ErrorCodes.auth.ACCOUNT_NOT_VERIFIED
      ) {
        /* The Backend & Frontend need to have consistent configurations for
           email verification and email in general, if they do not a user will
					 potentially not be able to login and not be able to verify their
					 email.
					 */
        if (config.env.EMAIL_ENABLED === false || config.env.EMAIL_VERIFICATION_ENABLED === false) {
          console.error(
            "User login is being prevented due to an unverified email, but email " +
              "verification is disabled.  This indicates a mismatch in configuration " +
              "between the API and application.",
          );
        }
        /* The error should include a User ID - which is required such that we
           can send the email verification to the email address registered with
           the user.  If we cannot, we should still let them know that their
           email is unverified - but inform them that they need to contact
           support. */
        if (isNil(e.userId)) {
          console.error(
            `The user's email confirmation token has expired, but we cannot
							resend the verification email because the response did not include
							the user's ID.`,
          );
        }
        form.notify(
          UnverifiedEmailNotification({
            userId: e.userId,
            onSuccess: () =>
              form.notify({
                level: "success",
                message: "Confirmation email successfully sent.",
                detail: "Please check your inbox.",
                closable: true,
              }),
            onError: (err: Error) => form.handleRequestError(err),
          }),
        );
      } else {
        form.handleRequestError(e);
      }
    },
    [form.handleRequestError],
  );

  useEffect(() => {
    if (!isNil(location.state?.tokenNotification)) {
      const n = location.state.tokenNotification;
      /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
      const { state, ...statelessLocation } = location;
      history.replace(statelessLocation);
      if (n.tokenType === "email-confirmation") {
        if (n.code === api.ErrorCodes.auth.TOKEN_EXPIRED) {
          if (isNil(n.userId)) {
            console.error(
              `Email confirmation token has expired, but we cannot
								resend the email because the response did not include the user's ID.`,
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
                  closable: true,
                }),
              onError: (err: Error) => form.handleRequestError(err),
            }),
          );
        } else {
          form.notify(EmailTokenInvalidNotification());
        }
      } else {
        if (n.code === api.ErrorCodes.auth.TOKEN_EXPIRED) {
          if (isNil(n.userId)) {
            console.error(
              `Password recovery token has expired, but we cannot
								resend the email because the response did not include the user's ID.`,
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
    <LandingFormContainer title="Sign In" subTitle="Cloud based budgeting at your fingertips.">
      <LoginForm
        form={form}
        loading={loading}
        style={{ marginTop: 20 }}
        onGoogleSuccess={(token: string) => {
          setLoading(true);
          api
            .socialLogin({ token_id: token, provider: "google" })
            .then((user: Model.User) => {
              if (user.is_first_time === true) {
                history.push("/discover", { validatedUser: user });
              } else {
                history.push("/", { validatedUser: user });
              }
            })
            .catch((e: Error) => handleLoginError(e))
            .finally(() => setLoading(false));
        }}
        onGoogleScriptLoadFailure={(error: Record<string, unknown>) => {
          notifications.internal.notify({
            level: "error",
            dispatchToSentry: true,
            message: notifications.objToJson(error),
          });
        }}
        onGoogleError={(error: Record<string, unknown>) => {
          notifications.internal.notify({
            level: "error",
            dispatchToSentry: true,
            message: notifications.objToJson(error),
          });
          form.notify("There was an error authenticating with Google.");
        }}
        onSubmit={(values: ILoginFormValues) => {
          const email = values.email;
          if (!isNil(email) && !isNil(values.password)) {
            api
              .login(email.toLowerCase(), values.password)
              .then((user: Model.User) => {
                if (user.is_first_time === true) {
                  history.push("/discover", { validatedUser: user });
                } else {
                  history.push("/", { validatedUser: user });
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
