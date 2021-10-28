import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Route, Redirect } from "react-router-dom";
import { isNil } from "lodash";
import axios from "axios";

import * as api from "api";
import { ui, notifications } from "lib";
import { actions } from "store";
import { WrapInApplicationSpinner } from "components";

const PrivateRoute = ({ ...props }: { [key: string]: any }): JSX.Element => {
  const [redirect, setRedirect] = useState(false);
  const [authenticating, setAuthenticating] = useState(true);
  const dispatch: Redux.Dispatch = useDispatch();
  const [newCancelToken] = api.useCancelToken();
  const isMounted = ui.hooks.useIsMounted();

  useEffect(() => {
    setAuthenticating(true);
    api
      .validateToken({ cancelToken: newCancelToken() })
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
        if (!axios.isCancel(e)) {
          if (e instanceof api.ClientError && !isNil(e.authenticationError)) {
            setRedirect(true);
          } else {
            notifications.requestError(e, { notifyUser: false });
          }
        }
      })
      .finally(() => {
        if (isMounted.current === true) {
          setAuthenticating(false);
        }
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
