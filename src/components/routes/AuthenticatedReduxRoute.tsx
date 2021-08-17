import { Route } from "react-router-dom";

import WrapInAuthenticatedStore from "./WrapInAuthenticatedStore";

const AuthenticatedReduxRoute = ({ ...props }: { [key: string]: any }): JSX.Element => {
  return (
    <WrapInAuthenticatedStore>
      <Route {...props} />
    </WrapInAuthenticatedStore>
  );
};

export default AuthenticatedReduxRoute;
