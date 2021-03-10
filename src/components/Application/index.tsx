import React from "react";
import { Redirect, Switch, Route } from "react-router-dom";

import { ApplicationRoute } from "components/routes";
import Logout from "./Logout";

const Dashboard = React.lazy(() => import("./Dashboard"));
const Budget = React.lazy(() => import("./Budget"));

const Application = (): JSX.Element => {
  return (
    <Switch>
      <Redirect exact from={"/"} to={"/budgets"} />
      <ApplicationRoute path={"/budgets/:budgetId"} component={Budget} />
      <ApplicationRoute path={["/budgets", "/contacts", "/templates", "/trash"]} component={Dashboard} />
      <Route exact path={"/logout"} component={Logout} />
    </Switch>
  );
};

export default Application;
