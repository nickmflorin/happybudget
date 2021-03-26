import React from "react";
import { Route, Redirect, Switch, useRouteMatch } from "react-router-dom";

const Account = React.lazy(() => import("./Account"));
const Budget = React.lazy(() => import("./Budget"));
const SubAccount = React.lazy(() => import("./SubAccount"));

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
