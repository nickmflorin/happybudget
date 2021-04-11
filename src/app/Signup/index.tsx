import { useState } from "react";
import { useHistory } from "react-router-dom";

import { Typography } from "antd";

import { register, socialLogin } from "api/services";
import { Form } from "components";

import SignupForm, { ISignupFormValues } from "./SignupForm";

import "./index.scss";

const Signup = (): JSX.Element => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const history = useHistory();

  return (
    <div className={"form-container"}>
      <Typography.Title className={"title"}>{"Register"}</Typography.Title>
      <Typography.Title className={"sub-title"}>{"Cloud based budgeting at your fingertips."}</Typography.Title>
      <SignupForm
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
        onSubmit={(values: ISignupFormValues) => {
          register(values)
            .then(() => {
              history.push("/");
            })
            .catch((e: Error) => {
              form.handleRequestError(e);
            })
            .finally(() => {
              setLoading(false);
            });
        }}
      />
    </div>
  );
};

export default Signup;
