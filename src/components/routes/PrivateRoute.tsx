import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Route, Redirect } from "react-router-dom";
import { Dispatch } from "redux";

import * as api from "api";
import { actions } from "store";
import { WrapInApplicationSpinner } from "components";

const PrivateRoute = ({ ...props }: { [key: string]: any }): JSX.Element => {
  const [redirect, setRedirect] = useState(false);
  const [authenticating, setAuthenticating] = useState(true);
  const dispatch: Dispatch = useDispatch();

  useEffect(() => {
    setAuthenticating(true);
    api
      .validateToken()
      .then((response: Http.TokenValidationResponse) => {
        dispatch(actions.authenticated.updateLoggedInUserAction(response.user));
        // TODO: Figure out how to do this just on login.
        if (process.env.NODE_ENV !== "development") {
          window.analytics.identify(response.user.id, {
            name: response.user.full_name,
            email: response.user.email
          });
        }
      })
      .catch((e: Error) => {
        if (e instanceof api.AuthenticationError) {
          setRedirect(true);
        } else {
          if (e instanceof api.NetworkError || e instanceof api.ClientError || e instanceof api.ServerError) {
            /* eslint-disable no-console */
            console.error(e);
          } else {
            throw e;
          }
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
