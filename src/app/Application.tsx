import React from "react";
import { Redirect, Switch, Route } from "react-router-dom";
import { useSelector } from "react-redux";

import { ApplicationSpinner } from "components";
import { PrivateRoute } from "components/routes";
import { componentLoader } from "lib/operational";
import Logout from "./Logout";

const Dashboard = React.lazy(() => componentLoader(() => import("./Dashboard")));
const Budget = React.lazy(() => componentLoader(() => import("./Budget")));
const Settings = React.lazy(() => componentLoader(() => import("./Settings")));

const Application = (): JSX.Element => {
  const applicationLoading = useSelector((state: Redux.ApplicationStore) => state.loading.loading);

  return (
    <React.Fragment>
      <ApplicationSpinner visible={applicationLoading} />
      <Switch>
        <Redirect exact from={"/"} to={"/budgets"} />
        <PrivateRoute path={"/budgets/:budgetId"} component={Budget} />
        <PrivateRoute path={["/budgets", "/contacts", "/templates", "/trash"]} component={Dashboard} />
        <PrivateRoute path={["/profile"]} component={Settings} />
        <Route exact path={"/logout"} component={Logout} />
      </Switch>
    </React.Fragment>
  );
};

export default Application;
