import React from "react";
import { Switch, Redirect, Route } from "react-router-dom";

import { ConnectedApplicationSpinner } from "components";
import { NotFoundRoute, PrivateRoute } from "components/routes";

import Budget from "./Budget";
import Template from "./Template";
import Dashboard from "./Dashboard";
import Settings from "./Settings";
import Logout from "./Logout";

const Application = (): JSX.Element => {
  return (
    <React.Fragment>
      <ConnectedApplicationSpinner />
      <Switch>
        <Redirect exact from={"/"} to={"/budgets"} />
        <PrivateRoute path={"/budgets/:budgetId"} component={Budget} />
        <PrivateRoute path={"/templates/:templateId"} component={Template} />
        <PrivateRoute path={["/budgets", "/contacts", "/templates", "/discover", "/new"]} component={Dashboard} />
        <PrivateRoute path={["/profile", "/security"]} component={Settings} />
        <Route exact path={"/logout"} component={Logout} />
        <NotFoundRoute />
      </Switch>
    </React.Fragment>
  );
};

export default Application;
