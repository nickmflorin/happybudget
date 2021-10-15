import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { isNil } from "lodash";

import { Typography } from "antd";

import * as api from "api";
import { ui } from "lib";

import { ButtonLink } from "components/buttons";
import { Notify } from "components/feedback";
import { LoginForm } from "components/forms";
import { ILoginFormValues } from "components/forms/LoginForm";
import { Logo } from "components/svgs";

interface NotificationProps {
  readonly email: string;
  readonly onError: (e: Error) => void;
  readonly onSuccess: () => void;
}

const ExpiredTokenNotification = (props: NotificationProps): JSX.Element => {
  const [loading, setLoading] = useState(false);

  return (
    <Notify type={"warning"} title={"There was an error verifying your email."}>
      <span>
        {"The previously created token has expired."}
        <ButtonLink
          loading={loading}
          style={{ marginLeft: 6 }}
          onClick={() => {
            setLoading(true);
            api
              .sendVerificationEmail(props.email, { ignoreForceLogout: true })
              .then(() => props.onSuccess())
              .catch((e: Error) => props.onError(e))
              .finally(() => setLoading(false));
          }}
        >
          {"Resend Email"}
        </ButtonLink>
      </span>
    </Notify>
  );
};

const UnverifiedEmailNotification = (props: NotificationProps): JSX.Element => {
  const [loading, setLoading] = useState(false);

  return (
    <Notify type={"warning"} title={"Your email address is not verified."}>
      <span>
        {"Your email address needs to be verified in order to login."}
        <ButtonLink
          loading={loading}
          style={{ marginLeft: 6 }}
          onClick={() => {
            setLoading(true);
            api
              .sendVerificationEmail(props.email, { ignoreForceLogout: true })
              .then(() => props.onSuccess())
              .catch((e: Error) => props.onError(e))
              .finally(() => setLoading(false));
          }}
        >
          {"Resend Email"}
        </ButtonLink>
      </span>
    </Notify>
  );
};

const Login = (): JSX.Element => {
  const [loading, setLoading] = useState(false);
  const form = ui.hooks.useForm<ILoginFormValues>();
  const history = useHistory();
  const location = useLocation<{ readonly error: Error }>();

  useEffect(() => {
    if (!isNil(location.state) && !isNil(location.state.error)) {
      const e = location.state.error;
      const { state, ...statelessLocation } = location;
      history.replace(statelessLocation);
      if (e instanceof api.ClientError) {
        if (e.authenticationErrors.length !== 0 && e.authenticationErrors[0].code === "token_expired") {
          // TODO: We need to get the email address in the case that we are being redirected
          // from the verification page.
          form.notify(<ExpiredTokenNotification email={""} onError={(err: Error) => {}} onSuccess={() => {}} />);
        } else if (e.errors[0].code === "token_not_valid") {
          form.notify({
            type: "error",
            title: "There was an error verifying your email.",
            message: "The token is malformed or corrupted."
          });
        }
      } else {
        form.handleRequestError(e);
      }
    }
  }, [location.state]);

  return (
    <React.Fragment>
      <div className={"logo-container"}>
        <Logo color={"green"} />
      </div>
      <div className={"landing-form-container"}>
        <Typography.Title className={"title"}>{"Sign In"}</Typography.Title>
        <Typography.Title className={"sub-title"}>{"Cloud based budgeting at your fingertips."}</Typography.Title>
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
              .catch((e: Error) => {
                form.handleRequestError(e);
              })
              .finally(() => {
                setLoading(false);
              });
          }}
          onGoogleError={(error: any) => {
            // TODO: Try to do a better job parsing the error.
            /* eslint-disable no-console */
            console.error(error);
            form.notify("There was an error authenticating with Google.");
          }}
          onSubmit={(values: ILoginFormValues) => {
            let email = values.email;
            if (!isNil(email) && !isNil(values.password)) {
              api
                .login(email.toLowerCase(), values.password, { ignoreForceLogout: true })
                .then((user: Model.User) => {
                  if (user.is_first_time === true) {
                    history.push("/discover");
                  } else {
                    history.push("/");
                  }
                })
                .catch((e: Error) => {
                  if (
                    e instanceof api.ClientError &&
                    e.authenticationErrors.length !== 0 &&
                    e.authenticationErrors[0].code === "email_not_verified"
                  ) {
                    form.notify(
                      <UnverifiedEmailNotification
                        email={(email as string).toLowerCase()}
                        onSuccess={() => {}}
                        onError={(err: Error) => {}}
                      />
                    );
                  } else {
                    form.handleRequestError(e);
                  }
                })
                .finally(() => {
                  setLoading(false);
                });
            }
          }}
        />
      </div>
    </React.Fragment>
  );
};

export default Login;
