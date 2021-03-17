import { Route } from "react-router-dom";

import WrapInApplicationStore from "./WrapInApplicationStore";

const ReduxRoute = ({ ...props }: { [key: string]: any }): JSX.Element => {
  return (
    <WrapInApplicationStore>
      <Route {...props} />
    </WrapInApplicationStore>
  );
};

export default ReduxRoute;
