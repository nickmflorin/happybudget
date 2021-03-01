import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";

import { ApplicationRoute } from "./routes";

const Logout = React.lazy(() => import("components/auth/Logout"));
const Dashboard = React.lazy(() => import("components/workspace/Dashboard"));
const Budgets = React.lazy(() => import("components/workspace/Budgets"));

const Application = (): JSX.Element => {
  return (
    <React.Fragment>
      <Switch>
        <Redirect exact from={"/"} to={"/dashboard"} />
        <ApplicationRoute exact path={"/dashboard"} component={Dashboard} />
        <ApplicationRoute exact path={"/budgets"} component={Budgets} />
        <Route exact path={"/logout"} component={Logout} />
      </Switch>
    </React.Fragment>
  );
};

export default Application;
