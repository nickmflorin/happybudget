import React from "react";
import { Redirect, Switch, Route, useRouteMatch } from "react-router-dom";

const Account = React.lazy(() => import("./Account"));
const Accounts = React.lazy(() => import("./Accounts"));
const SubAccount = React.lazy(() => import("./SubAccount"));

const Calculator = (): JSX.Element => {
  const match = useRouteMatch();
  return (
    <Switch>
      <Redirect exact from={match.url} to={`${match.url}/accounts`} />
      <Route exact path={"/budgets/:budgetId/accounts/:accountId"} component={Account} />
      <Route path={"/budgets/:budgetId/accounts"} component={Accounts} />
      <Route path={"/budgets/:budgetId/subaccounts/:subaccountId"} component={SubAccount} />
    </Switch>
  );
};

export default Calculator;
