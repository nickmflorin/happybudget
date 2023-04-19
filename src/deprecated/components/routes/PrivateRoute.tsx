import { useEffect, useState } from "react";

import axios from "axios";
import { Route, Redirect, RouteProps } from "react-router-dom";

import * as api from "api";
import { notifications, http } from "lib";
import { WrapInApplicationSpinner } from "components";
import * as store from "application/store";

export type PrivateRouteProps = RouteProps & {
  readonly forceReloadFromStripe?: boolean;
  readonly revalidate?: boolean;
};

const PrivateRoute = ({
  forceReloadFromStripe,
  revalidate,
  ...props
}: PrivateRouteProps): JSX.Element => {
  const authenticatedUser = store.hooks.useUser();
  const [redirect, setRedirect] = useState(false);
  const [authenticating, setAuthenticating] = useState(true);
  const [newCancelToken] = http.useCancelToken();
  const [_, updateUser] = store.hooks.useLoggedInUser();

  useEffect(() => {
    /* If there is not already an authenticated user in the store, we want to
       redirect them out of the application regardless of whether or not the
       validation would have been successful. */
    if (authenticatedUser === null) {
      setRedirect(true);
    } else if (revalidate === true || forceReloadFromStripe === true) {
      api
        .validateAuthToken(
          { force_reload_from_stripe: forceReloadFromStripe || false },
          { cancelToken: newCancelToken() },
        )
        .then((response: Model.User) => {
          if (response.id !== authenticatedUser.id) {
            notifications.internal.notify({
              dispatchToSentry: true,
              level: "error",
              message:
                `Auth token validation returned user with ID ${response.id} but ` +
                `current user is ${authenticatedUser.id}.  Logging them out.`,
            });
            setAuthenticating(false);
          } else {
            updateUser(response);
            setAuthenticating(false);
          }
        })
        .catch((e: Error) => {
          if (!axios.isCancel(e)) {
            /* An authentication error is expected if the validation fails - in
               which case we do not want to dispatch the error to Sentry */
            if (!(e instanceof api.AuthenticationError)) {
              notifications.internal.handleRequestError(e);
            }
            setRedirect(true);
          }
          setAuthenticating(false);
        });
    } else {
      setAuthenticating(false);
    }
  }, [authenticatedUser]);

  if (redirect === true) {
    return <Redirect to="/" />;
  } else {
    return (
      <WrapInApplicationSpinner loading={authenticating} hideWhileLoading={true}>
        <Route {...props} />
      </WrapInApplicationSpinner>
    );
  }
};

export default PrivateRoute;
