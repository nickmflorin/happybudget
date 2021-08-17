import { ReactNode, useEffect, useState } from "react";
import { Store } from "redux";
import { Provider } from "react-redux";
import { Redirect } from "react-router-dom";
import { isNil } from "lodash";

import { NetworkError, ServerError, ClientError, AuthenticationError } from "api";
import { ApplicationSpinner } from "components";
import { validateToken } from "api/services";
import { configureAuthenticatedStore } from "store";

interface WrapInAuthenticatedStoreProps {
  readonly children: ReactNode;
}

const WrapInAuthenticatedStore = ({ children }: WrapInAuthenticatedStoreProps): JSX.Element => {
  const [redirect, setRedirect] = useState(false);
  const [authenticating, setAuthenticating] = useState(true);
  const [reduxStore, setReduxStore] = useState<Store<Modules.Authenticated.Store, Redux.Action> | undefined>(undefined);

  useEffect(() => {
    setAuthenticating(true);
    validateToken()
      .then((response: Http.TokenValidationResponse) => {
        const store = configureAuthenticatedStore(response.user);
        setReduxStore(store);
      })
      .catch((e: Error) => {
        if (e instanceof AuthenticationError) {
          setRedirect(true);
        } else {
          if (e instanceof NetworkError || e instanceof ClientError || e instanceof ServerError) {
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
    if (isNil(reduxStore)) {
      if (authenticating) {
        return <ApplicationSpinner visible={true} />;
      }
      // If the Redux Store is not set and we are not authenticating anymore,
      // there was an error with the token validation, in which case we should
      // redirect to login.
      return <Redirect to={"/login"} />;
    } else {
      return <Provider store={reduxStore}>{children}</Provider>;
    }
  }
};

export default WrapInAuthenticatedStore;
