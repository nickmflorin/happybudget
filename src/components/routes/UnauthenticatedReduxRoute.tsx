import { Route, RouteProps } from "react-router-dom";

import WrapInUnauthenticatedStore from "./WrapInUnauthenticatedStore";

const UnauthenticatedReduxRoute = (props: RouteProps): JSX.Element => {
  return (
    <WrapInUnauthenticatedStore>
      <Route {...props} />
    </WrapInUnauthenticatedStore>
  );
};

export default UnauthenticatedReduxRoute;
