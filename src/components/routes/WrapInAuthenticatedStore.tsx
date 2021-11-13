import { ReactNode, useEffect, useState } from "react";
import { Store } from "redux";
import { Provider } from "react-redux";
import { Redirect } from "react-router-dom";
import { ConnectedRouter } from "connected-react-router";
import axios from "axios";
import { isNil } from "lodash";

import * as api from "api";
import { ui, notifications, plugins } from "lib";
import { ApplicationSpinner } from "components";
import { history, configureAuthenticatedStore } from "store/configureStore";

interface WrapInAuthenticatedStoreProps {
  readonly children: ReactNode;
}

const WrapInAuthenticatedStore = ({ children }: WrapInAuthenticatedStoreProps): JSX.Element => {
  const [redirect, setRedirect] = useState(false);
  const [authenticating, setAuthenticating] = useState(true);
  const [reduxStore, setReduxStore] = useState<Store<Application.AuthenticatedStore, Redux.Action> | undefined>(
    undefined
  );
  const [newCancelToken] = api.useCancelToken();
  const isMounted = ui.hooks.useIsMounted();

  useEffect(() => {
    setAuthenticating(true);
    api
      .validateAuthToken({ force_reload_from_stripe: true }, { cancelToken: newCancelToken() })
      .then((response: Model.User) => {
        const store = configureAuthenticatedStore(response);
        setReduxStore(store);

        plugins.identify(response);
      })
      .catch((e: Error) => {
        if (!axios.isCancel(e)) {
          if (e instanceof api.ClientError && !isNil(e.authenticationError)) {
            setRedirect(true);
          } else {
            notifications.requestError(e);
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
      /* If the Redux Store is not set and we are not authenticating anymore,
         there was an error with the token validation, in which case we should
         redirect to login. */
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
