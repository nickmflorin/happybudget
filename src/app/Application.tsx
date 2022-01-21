import React from "react";
import { Switch, Redirect, Route } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Dispatch } from "redux";

import { actions } from "store";

import { ConnectedApplicationSpinner } from "components";
import { SubscriptionPermissionModal } from "components/modals";
import { NotFoundRoute, PrivateRoute } from "components/routes";

import Budget from "./Budget";
import Template from "./Template";
import Dashboard from "./Dashboard";
import Settings from "./Settings";
import Logout from "./Logout";

const selectPermissionModalOpen = (state: Application.AuthenticatedStore) => state.subscriptionPermissionModalOpen;

const Application = (): JSX.Element => {
  const subscriptionPermissionModalOpen = useSelector(selectPermissionModalOpen);
  const dispatch: Dispatch = useDispatch();

  return (
    <React.Fragment>
      <ConnectedApplicationSpinner />
      <Switch>
        <Redirect exact from={"/"} to={"/budgets"} />
        <PrivateRoute path={"/budgets/:budgetId"} component={Budget} />
        <PrivateRoute path={"/templates/:budgetId"} component={Template} />
        <PrivateRoute path={["/budgets", "/contacts", "/templates", "/discover"]} component={Dashboard} />
        <PrivateRoute path={["/profile", "/security", "/billing"]} component={Settings} />
        <Route exact path={"/logout"} component={Logout} />
        <NotFoundRoute />
      </Switch>
      <SubscriptionPermissionModal
        open={subscriptionPermissionModalOpen}
        onCancel={() => dispatch(actions.authenticated.setSubscriptionPermissionModalOpenAction(false))}
      />
    </React.Fragment>
  );
};

export default Application;
