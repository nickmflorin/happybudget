import React from "react";
import { Route, Redirect, Switch, useRouteMatch } from "react-router-dom";
import { componentLoader } from "operational";

const Account = React.lazy(() => componentLoader(() => import("./Account")));
const Budget = React.lazy(() => componentLoader(() => import("./Budget")));
const SubAccount = React.lazy(() => componentLoader(() => import("./SubAccount")));

const Calculator = (): JSX.Element => {
  const match = useRouteMatch();
  return (
    <Switch>
      <Redirect exact from={match.url} to={`${match.url}/accounts`} />
      <Route exact path={"/budgets/:budgetId/accounts/:accountId"} component={Account} />
      <Route path={"/budgets/:budgetId/accounts"} component={Budget} />
      <Route path={"/budgets/:budgetId/subaccounts/:subaccountId"} component={SubAccount} />
    </Switch>
  );
};

export default Calculator;
