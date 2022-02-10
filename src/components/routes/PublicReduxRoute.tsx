import { Route, RouteProps } from "react-router-dom";

import WrapInPublicStore from "./WrapInPublicStore";

const PublicReduxRoute = (props: RouteProps): JSX.Element => {
  return (
    <WrapInPublicStore>
      <Route {...props} />
    </WrapInPublicStore>
  );
};

export default PublicReduxRoute;
