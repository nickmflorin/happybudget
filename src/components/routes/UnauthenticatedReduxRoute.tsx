import { Route } from "react-router-dom";

import WrapInUnauthenticatedStore from "./WrapInUnauthenticatedStore";

const UnauthenticatedReduxRoute = ({ ...props }: { [key: string]: any }): JSX.Element => {
  return (
    <WrapInUnauthenticatedStore>
      <Route {...props} />
    </WrapInUnauthenticatedStore>
  );
};

export default UnauthenticatedReduxRoute;
