import React from "react";
import { Redirect, Switch, Route } from "react-router-dom";

import { Logout } from "components/auth";
import { ApplicationRoute } from "components/routes";

const Dashboard = React.lazy(() => import("./Dashboard"));
const Budget = React.lazy(() => import("./Budget"));

const Application = (): JSX.Element => {
  return (
    <Switch>
      <Redirect exact from={"/"} to={"/budgets"} />
      <ApplicationRoute exact path={"/budgets/:budgetId"} component={Budget} />
      <ApplicationRoute path={["/budgets", "/contacts", "/templates", "/trash"]} component={Dashboard} />
      <Route exact path={"/logout"} component={Logout} />
    </Switch>
  );
};

export default Application;
