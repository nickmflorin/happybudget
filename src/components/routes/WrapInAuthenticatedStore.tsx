import { ReactNode, useEffect, useState } from "react";
import { Store } from "redux";
import { Provider } from "react-redux";
import { Redirect } from "react-router-dom";
import { ConnectedRouter } from "connected-react-router";
import axios from "axios";
import { isNil } from "lodash";

import * as api from "api";
import { ui, notifications } from "lib";
import { ApplicationSpinner } from "components";
import { history, configureAuthenticatedStore } from "store/configureStore";

interface WrapInAuthenticatedStoreProps {
  readonly children: ReactNode;
}

const WrapInAuthenticatedStore = ({ children }: WrapInAuthenticatedStoreProps): JSX.Element => {
  const [redirect, setRedirect] = useState(false);
  const [authenticating, setAuthenticating] = useState(true);
  const [reduxStore, setReduxStore] = useState<Store<Application.Authenticated.Store, Redux.Action> | undefined>(
    undefined
  );
  const [newCancelToken] = api.useCancelToken();
  const isMounted = ui.hooks.useIsMounted();

  useEffect(() => {
    setAuthenticating(true);
    api
      .validateToken({ cancelToken: newCancelToken() })
      .then((response: Model.User) => {
        if (process.env.NODE_ENV !== "development") {
          window.analytics.identify(response.id, {
            name: response.full_name,
            email: response.email
          });
        }
        const store = configureAuthenticatedStore(response);
        setReduxStore(store);

        // When a user clicks the "Feedback" link in the profile image
        // dropdown menu they will be redirected to and authenticated in
        // Canny. This allows them to leave feedback without having to create
        // a Canny account. Their feedback will be tied to their existing
        // Greenbudget user account.

        // We do not want to makes calls to Canny's API in local development by default.
        if (!isNil(process.env.REACT_APP_CANNY_APP_ID)) {
          window.Canny("identify", {
            appID: process.env.REACT_APP_CANNY_APP_ID,
            user: {
              id: response.id,
              email: response.email,
              name: response.full_name,
              avatarURL: response.profile_image?.url,
              created: new Date(response.created_at).toISOString()
            }
          });
        } else if (process.env.NODE_ENV === "production") {
          console.warn("Could not identify Canny user as ENV variable `REACT_APP_CANNY_APP_ID` is not defined.");
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
        if (isMounted.current) {
          setAuthenticating(false);
        }
      });
  }, []);

  if (redirect === true) {
    return <Redirect to={"/login"} />;
  } else {
    if (isNil(reduxStore)) {
      if (authenticating) {
        return <ApplicationSpinner visible={true} />;
      }
      // If the Redux Store is not set and we are not authenticating anymore,
      // there was an error with the token validation, in which case we should
      // redirect to login.
      return <Redirect to={"/login"} />;
    } else {
      return (
        <Provider store={reduxStore}>
          <ConnectedRouter history={history}>{children}</ConnectedRouter>
        </Provider>
      );
    }
  }
};

export default WrapInAuthenticatedStore;
