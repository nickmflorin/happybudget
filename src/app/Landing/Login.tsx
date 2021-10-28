import { useEffect, useState, useMemo } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { isNil, includes } from "lodash";

import * as api from "api";
import { ui, notifications } from "lib";

import { LoginForm } from "components/forms";
import { ILoginFormValues } from "components/forms/LoginForm";

import { TokenNotification, UnverifiedEmailNotification } from "./Notifications";
import LandingFormContainer from "./LandingFormContainer";

const Login = (): JSX.Element => {
  const [loading, setLoading] = useState(false);
  const form = ui.hooks.useForm<ILoginFormValues>();
  const history = useHistory();
  const location = useLocation<{
    readonly error?: Error | undefined;
    readonly notification?: IAlert | string | undefined;
    readonly tokenType?: "email-confirmation" | "password-recovery" | undefined;
  }>();

  const handleTokenError = useMemo(
    () => (e: Http.IApiError<"auth", Http.TokenErrorCode>, tokenType: Http.TokenType, userId?: number | undefined) => {
      if (e.code === api.ErrorCodes.TOKEN_EXPIRED && isNil(userId)) {
        console.error(
          `The token of type ${location.state.tokenType} has expired, but we cannot
              resend the email because the response did not include the user's ID.`
        );
      }
      if (isNil(userId) || e.code === api.ErrorCodes.TOKEN_INVALID) {
        form.notify(<TokenNotification tokenType={tokenType} userId={userId} code={e.code} />);
      } else {
        form.notify(
          <TokenNotification
            tokenType={tokenType}
            userId={userId}
            code={e.code}
            onSuccess={() =>
              form.notify(
                {
                  type: "success",
                  title: "Confirmation email successfully sent.",
                  message: "Please check your inbox.",
                  closable: true
                },
                { append: true }
              )
            }
            onError={(err: Error) => form.handleRequestError(err, { closable: true })}
          />
        );
      }
    },
    [form.handleRequestError, form.notify]
  );

  const handleAuthError = useMemo(
    () => (e: Http.AuthError, userId?: number | undefined, tokenType?: Http.TokenType) => {
      if (includes([api.ErrorCodes.TOKEN_EXPIRED, api.ErrorCodes.TOKEN_INVALID], e.code)) {
        if (!isNil(tokenType)) {
          handleTokenError(e as Http.IApiError<"auth", Http.TokenErrorCode>, tokenType, userId);
          return true;
        }
      } else if (e.code === api.ErrorCodes.EMAIL_NOT_VERIFIED) {
        if (isNil(userId)) {
          console.error(
            `The user's email confirmation token has expired, but we cannot
              resend the verification email because the response did not include
              the user's ID.`
          );
        }
        form.notify(
          <UnverifiedEmailNotification
            userId={userId}
            onSuccess={() =>
              form.notify(
                {
                  type: "success",
                  title: "Confirmation email successfully sent.",
                  message: "Please check your inbox.",
                  closable: true
                },
                { append: true }
              )
            }
            onError={(err: Error) => form.handleRequestError(err, { closable: true })}
          />
        );
        return true;
      }
      return false;
    },
    [form.handleRequestError, handleTokenError, form.notify]
  );

  const handleError = useMemo(
    () => (e: Error) => {
      if (e instanceof api.ClientError && !isNil(e.authenticationError)) {
        const handled = handleAuthError(e.authenticationError, e.userId, location.state?.tokenType);
        if (!handled) {
          form.handleRequestError(e);
        }
      } else {
        form.handleRequestError(e);
      }
    },
    [form.handleRequestError, handleAuthError]
  );

  useEffect(() => {
    if (!isNil(location.state?.error)) {
      const e = location.state.error;
      const { state, ...statelessLocation } = location;
      history.replace(statelessLocation);
      handleError(e);
    }
    const notification = location.state?.notification;
    if (!isNil(notification)) {
      form.notify(notification);
    }
  }, [location.state]);

  return (
    <LandingFormContainer title={"Sign In"} subTitle={"Cloud based budgeting at your fingertips."}>
      <LoginForm
        className={"mb--20 mt--20"}
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
            .catch((e: Error) => handleError(e))
            .finally(() => setLoading(false));
        }}
        onGoogleError={(error: any) => {
          notifications.error(error);
          form.notify("There was an error authenticating with Google.");
        }}
        onSubmit={(values: ILoginFormValues) => {
          let email = values.email;
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
              .catch((e: Error) => handleError(e))
              .finally(() => setLoading(false));
          }
        }}
      />
    </LandingFormContainer>
  );
};

export default Login;
