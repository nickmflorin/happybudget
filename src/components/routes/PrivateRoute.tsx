import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Route, Redirect } from "react-router-dom";

import * as api from "api";
import { actions } from "store";
import { WrapInApplicationSpinner } from "components";

const PrivateRoute = ({ ...props }: { [key: string]: any }): JSX.Element => {
  const [redirect, setRedirect] = useState(false);
  const [authenticating, setAuthenticating] = useState(true);
  const dispatch: Redux.Dispatch = useDispatch();

  useEffect(() => {
    setAuthenticating(true);
    api
      .validateToken()
      .then((response: Model.User) => {
        dispatch(actions.authenticated.updateLoggedInUserAction(response));
        // TODO: Figure out how to do this just on login.
        if (process.env.NODE_ENV !== "development") {
          window.analytics.identify(response.id, {
            name: response.full_name,
            email: response.email
          });
        }
      })
      .catch((e: Error) => {
        if (e instanceof api.ClientError && e.authenticationErrors.length !== 0) {
          setRedirect(true);
        } else if (e instanceof api.NetworkError || e instanceof api.ClientError || e instanceof api.ServerError) {
          /* eslint-disable no-console */
          console.error(e);
        } else {
          throw e;
        }
      })
      .finally(() => {
        setAuthenticating(false);
      });
  }, []);

  if (redirect === true) {
    return <Redirect to={"/login"} />;
  } else {
    return (
      <WrapInApplicationSpinner loading={authenticating}>
        <Route {...props} />
      </WrapInApplicationSpinner>
    );
  }
};

export default PrivateRoute;
