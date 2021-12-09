import { useState } from "react";
import { useHistory } from "react-router-dom";

import * as api from "api";
import { ui, notifications } from "lib";

import SignupForm, { ISignupFormValues } from "components/forms/SignupForm";
import { UnverifiedEmailNotification } from "./Notifications";
import LandingFormContainer from "./LandingFormContainer";

const Signup = (): JSX.Element => {
  const [loading, setLoading] = useState(false);
  const form = ui.hooks.useForm<ISignupFormValues>();
  const history = useHistory();

  return (
    <LandingFormContainer title={"Register"} subTitle={"Cloud based budgeting at your fingertips."}>
      <SignupForm
        form={form}
        loading={loading}
        onGoogleSuccess={(token: string) => {
          setLoading(true);
          api
            .socialLogin({ token_id: token, provider: "google" })
            .then((user: Model.User) => {
              /* It might not be the the case that the User has not already
								 logged in if doing Social Registration, because the User might
								 already exist for that Social Account. */
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
          notifications.error(error);
          form.notify("There was an error authenticating with Google.");
        }}
        onSubmit={(values: ISignupFormValues) => {
          api
            .register(values)
            .then((user: Model.User) => {
              form.notify(
                <UnverifiedEmailNotification
                  userId={user.id}
                  title={"Verify Email"}
                  type={"success"}
                  message={`Successfully registered.  An email was sent to ${user.email} to verify the
										email address on the account.  Didn't receive it?`}
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
            })
            .catch((e: Error) => {
              form.handleRequestError(e);
            })
            .finally(() => {
              setLoading(false);
            });
        }}
      />
    </LandingFormContainer>
  );
};

export default Signup;
