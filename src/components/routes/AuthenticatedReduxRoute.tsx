import { Route } from "react-router-dom";

import WrapInAuthenticatedStore from "./WrapInAuthenticatedStore";

const AuthenticatedReduxRoute = ({ ...props }: Record<string, unknown>): JSX.Element => {
  return (
    <WrapInAuthenticatedStore>
      <Route {...props} />
    </WrapInAuthenticatedStore>
  );
};

export default AuthenticatedReduxRoute;
