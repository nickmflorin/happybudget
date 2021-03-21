import { useState } from "react";
import { useHistory } from "react-router-dom";
import { isNil } from "lodash";

import { Typography, Form } from "antd";

import { ClientError, NetworkError, renderFieldErrorsInForm } from "api";
import { login, socialLogin } from "services";

import LoginForm, { ILoginFormValues } from "./LoginForm";

import "./index.scss";

const Login = (): JSX.Element => {
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | undefined>(undefined);
  const [form] = Form.useForm();
  const history = useHistory();

  return (
    <div className={"form-container"}>
      <Typography.Title className={"title"}>{"Sign In"}</Typography.Title>
      <Typography.Title className={"sub-title"}>{"Cloud based budgeting at your fingertips."}</Typography.Title>
      {!isNil(globalError) && <div className={"global-error"}>{globalError}</div>}
      <LoginForm
        className={"mb--20 mt--20"}
        form={form}
        loading={loading}
        onGoogleSuccess={(token: string) => {
          setLoading(true);
          socialLogin({ token_id: token, provider: "google" })
            .then(() => {
              history.push("/");
            })
            .catch((e: Error) => {
              if (e instanceof ClientError) {
                if (!isNil(e.errors.__all__)) {
                  setGlobalError(e.errors.__all__[0].message);
                } else {
                  // Render the errors for each field next to the form field.
                  renderFieldErrorsInForm(form, e);
                }
              } else if (e instanceof NetworkError) {
                setGlobalError("There was a problem communicating with the server.");
              } else {
                throw e;
              }
            })
            .finally(() => {
              setLoading(false);
            });
        }}
        onGoogleError={(error: any) => {
          // TODO: Try to do a better job parsing the error.
          /* eslint-disable no-console */
          console.error(error);
          setGlobalError("There was an error authenticating with Google.");
        }}
        onSubmit={(values: ILoginFormValues) => {
          if (!isNil(values.email) && !isNil(values.password)) {
            login(values.email.toLowerCase(), values.password)
              .then(() => {
                console.log("LOGGED IN");
              })
              .catch((e: Error) => {
                if (e instanceof ClientError) {
                  if (!isNil(e.errors.__all__)) {
                    setGlobalError(e.errors.__all__[0].message);
                  } else {
                    // Render the errors for each field next to the form field.
                    renderFieldErrorsInForm(form, e);
                  }
                } else if (e instanceof NetworkError) {
                  setGlobalError("There was a problem communicating with the server.");
                } else {
                  throw e;
                }
              })
              .finally(() => {
                setLoading(false);
              });
          }
        }}
      />
    </div>
  );
};

export default Login;
