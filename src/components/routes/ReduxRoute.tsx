import React from "react";
import { Route, RouteProps } from "react-router-dom";

import WrapInStore, { WrapInStoreProps } from "./WrapInStore";

type ReduxRouteProps = RouteProps & {
  readonly config: WrapInStoreProps;
};

const ReduxRoute = ({ config, ...props }: ReduxRouteProps): JSX.Element => (
  <WrapInStore {...config}>
    <Route {...props} />
  </WrapInStore>
);

export default React.memo(ReduxRoute);
