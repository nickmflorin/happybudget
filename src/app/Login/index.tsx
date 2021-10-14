import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { isNil } from "lodash";

import { Typography } from "antd";

import * as api from "api";
import { ui } from "lib";

import { ButtonLink } from "components/buttons";
import { FormNotification } from "components/forms";
import { Logo } from "components/svgs";

import LoginForm, { ILoginFormValues } from "./LoginForm";

const Login = (): JSX.Element => {
  const [loading, setLoading] = useState(false);
  const form = ui.hooks.useForm();
  const history = useHistory();

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
            form.setGlobalError("There was an error authenticating with Google.");
          }}
          onSubmit={(values: ILoginFormValues) => {
            if (!isNil(values.email) && !isNil(values.password)) {
              api
                .login(values.email.toLowerCase(), values.password, { ignoreForceLogout: true })
                .then((user: Model.User) => {
                  if (user.is_first_time === true) {
                    history.push("/discover");
                  } else {
                    history.push("/");
                  }
                })
                .catch((e: Error) => {
                  if (e instanceof api.AuthenticationError && e.errors[0].code === "email_not_verified") {
                    form.renderNotification(
                      <FormNotification type={"warning"} title={"Your email address is not verified."}>
                        <span>
                          {"Your email address needs to be verified in order to login."}
                          <ButtonLink loading={false} style={{ marginLeft: 6 }} onClick={() => {}}>
                            {"Resend Email"}
                          </ButtonLink>
                        </span>
                      </FormNotification>
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
