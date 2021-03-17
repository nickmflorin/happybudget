import React from "react";
import { Redirect, Switch, Route } from "react-router-dom";
import { useSelector } from "react-redux";

import { ShowHide, ApplicationSpinner } from "components/display";
import { PrivateRoute } from "components/routes";
import Logout from "./Logout";

const Dashboard = React.lazy(() => import("./Dashboard"));
const Budget = React.lazy(() => import("./Budget"));

const Application = (): JSX.Element => {
  const applicationLoading = useSelector((state: Redux.IApplicationStore) => state.loading.elements.length !== 0);

  return (
    <React.Fragment>
      <ShowHide show={applicationLoading}>
        <ApplicationSpinner />
      </ShowHide>
      <Switch>
        <Redirect exact from={"/"} to={"/budgets"} />
        <PrivateRoute path={"/budgets/:budgetId"} component={Budget} />
        <PrivateRoute path={["/budgets", "/contacts", "/templates", "/trash"]} component={Dashboard} />
        <Route exact path={"/logout"} component={Logout} />
      </Switch>
    </React.Fragment>
  );
};

export default Application;
