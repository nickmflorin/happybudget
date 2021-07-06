import { useState } from "react";
import { useHistory } from "react-router-dom";
import { isNil } from "lodash";

import { Typography } from "antd";

import { login, socialLogin } from "api/services";
import { Form } from "components";
import { Logo } from "components/svgs";

import LoginForm, { ILoginFormValues } from "./LoginForm";

import "./index.scss";

const Login = (): JSX.Element => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const history = useHistory();

  return (
    <>
      <div className={"logo-container"}>
        <Logo color={"black"} />
      </div>
      <div className={"form-container"}>
        <Typography.Title className={"title"}>{"Sign In"}</Typography.Title>
        <Typography.Title className={"sub-title"}>{"Cloud based budgeting at your fingertips."}</Typography.Title>
        <LoginForm
          className={"mb--20 mt--20"}
          form={form}
          loading={loading}
          onGoogleSuccess={(token: string) => {
            setLoading(true);
            socialLogin({ token_id: token, provider: "google" })
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
              login(values.email.toLowerCase(), values.password)
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
            }
          }}
        />
      </div>
    </>
  );
};

export default Login;
