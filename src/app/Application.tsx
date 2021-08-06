import React from "react";
import { Redirect, Switch, Route } from "react-router-dom";

import { ConnectedApplicationSpinner } from "components";
import { PrivateRoute } from "components/routes";

import { operational } from "lib";

import Logout from "./Logout";

const Dashboard = operational.lazyWithRetry(() => import("./Dashboard"));
const Budget = operational.lazyWithRetry(() => import("./Budgeting/components/Budget"));
const Template = operational.lazyWithRetry(() => import("./Budgeting/components/Template"));
const Settings = operational.lazyWithRetry(() => import("./Settings"));

const Application = (): JSX.Element => {
  return (
    <React.Fragment>
      <ConnectedApplicationSpinner />
      <Switch>
        <Redirect exact from={"/"} to={"/budgets"} />
        <PrivateRoute path={"/budgets/:budgetId"} component={Budget} />
        <PrivateRoute path={"/templates/:templateId"} component={Template} />
        <PrivateRoute path={["/budgets", "/contacts", "/templates", "/discover", "/new"]} component={Dashboard} />
        <PrivateRoute path={["/profile"]} component={Settings} />
        <Route exact path={"/logout"} component={Logout} />
      </Switch>
    </React.Fragment>
  );
};

export default Application;
