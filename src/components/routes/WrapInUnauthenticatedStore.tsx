import { ReactNode, useEffect, useState } from "react";
import { Store } from "redux";
import { Provider } from "react-redux";
import { Redirect } from "react-router-dom";
import { isNil } from "lodash";

import { ApplicationSpinner } from "components";
import { configureUnauthenticatedStore } from "store/configureStore";

interface WrapInAuthenticatedStoreProps {
  readonly children: ReactNode;
}

const WrapInAuthenticatedStore = ({ children }: WrapInAuthenticatedStoreProps): JSX.Element => {
  const [authenticating, setAuthenticating] = useState(true);
  const [reduxStore, setReduxStore] = useState<Store<Application.UnauthenticatedStore, Redux.Action> | undefined>(
    undefined
  );

  useEffect(() => {
    setAuthenticating(true);
    const store = configureUnauthenticatedStore();
    setReduxStore(store);
    setAuthenticating(false);
  }, []);

  if (isNil(reduxStore)) {
    if (authenticating) {
      return <ApplicationSpinner visible={true} />;
    }
    return <Redirect to={"/login"} />;
  } else {
    return <Provider store={reduxStore}>{children}</Provider>;
  }
};

export default WrapInAuthenticatedStore;
