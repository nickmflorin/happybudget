import { useState, useMemo } from "react";
import { useHistory } from "react-router-dom";
import { isNil } from "lodash";

import * as api from "api";
import { ui, notifications } from "lib";

import SignupForm, { ISignupFormValues } from "components/forms/SignupForm";
import { UnverifiedEmailNotification, UserNotOnWaitlistNotification } from "./Notifications";
import LandingFormContainer from "./LandingFormContainer";

const Signup = (): JSX.Element => {
  const [loading, setLoading] = useState(false);
  const form = ui.hooks.useForm<ISignupFormValues>();
  const history = useHistory();

  const handleAuthError = useMemo(
    () => (e: Http.AuthError) => {
      if (e.code === api.ErrorCodes.ACCOUNT_NOT_ON_WAITLIST) {
        form.notify(UserNotOnWaitlistNotification());
        return true;
      }
      return false;
    },
    [form.handleRequestError, form.notify]
  );

  const handleError = useMemo(
    () => (e: Error) => {
      if (e instanceof api.ClientError && !isNil(e.authenticationError)) {
        const handled = handleAuthError(e.authenticationError);
        if (!handled) {
          form.handleRequestError(e);
        }
      } else {
        form.handleRequestError(e);
      }
    },
    [form.handleRequestError, handleAuthError]
  );

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
            .catch((e: Error) => handleError(e))
            .finally(() => setLoading(false));
        }}
        onGoogleScriptLoadFailure={(error: Record<string, unknown>) => {
          notifications.notify({ level: "error", dispatchToSentry: true, message: notifications.objToJson(error) });
        }}
        onGoogleError={(error: Record<string, unknown>) => {
          notifications.notify({ level: "error", dispatchToSentry: true, message: notifications.objToJson(error) });
          form.notify("There was an error authenticating with Google.");
        }}
        onSubmit={(values: ISignupFormValues) => {
          api
            .register(values)
            .then((user: Model.User) => {
              form.notify(
                UnverifiedEmailNotification({
                  userId: user.id,
                  message: "Verify Email",
                  level: "success",
                  detail: `Successfully registered.  An email was sent to ${user.email} to verify the
								email address on the account.  Didn't receive it?`,
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
            })
            .catch((e: Error) => handleError(e))
            .finally(() => setLoading(false));
        }}
      />
    </LandingFormContainer>
  );
};

export default Signup;
