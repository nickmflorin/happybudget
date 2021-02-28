import React from "react";
import { Route, Switch } from "react-router-dom";

const Logout = React.lazy(() => import("components/auth/Logout"));

const Application = (): JSX.Element => {
  return (
    <React.Fragment>
      <Switch>
        <Route exact path={"/logout"} component={Logout} />
      </Switch>
    </React.Fragment>
  );
};

export default Application;
