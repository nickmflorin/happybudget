import { ReactNode, useEffect, useState } from "react";
import { Store } from "redux";
import { Provider } from "react-redux";
import { Redirect } from "react-router-dom";
import { isNil } from "lodash";

import { ApplicationSpinner } from "components";
import { configureUnauthenticatedStore } from "store";

interface WrapInAuthenticatedStoreProps {
  readonly children: ReactNode;
}

const WrapInAuthenticatedStore = ({ children }: WrapInAuthenticatedStoreProps): JSX.Element => {
  const [authenticating, setAuthenticating] = useState(true);
  const [reduxStore, setReduxStore] = useState<Store<Modules.Unauthenticated.StoreObj, Redux.Action> | undefined>(
    undefined
  );

  useEffect(() => {
    // TODO: Is this where we might want to authenticate based on the share param of the URL?
  }, []);

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
