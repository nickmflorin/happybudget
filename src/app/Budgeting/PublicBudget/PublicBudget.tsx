import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Redirect, Switch } from "react-router-dom";

import { PublicBudgetLayout } from "components/layout";
import { Route, PathParamsRoute } from "components/routes";

import { actions, selectors } from "../store";

import Account from "./Account";
import Accounts from "./Accounts";
import SubAccount from "./SubAccount";

type PublicBudgetProps = {
  readonly budgetId: number;
  readonly tokenId: string;
};

const PublicBudget = (props: PublicBudgetProps): JSX.Element => {
  const dispatch = useDispatch();
  const budget = useSelector((s: Application.Store) =>
    selectors.selectBudgetDetail(s, { domain: "budget", public: true })
  ) as Model.Budget | null;
  const budgetLoading = useSelector((s: Application.Store) =>
    selectors.selectBudgetLoading(s, { domain: "budget", public: true })
  );

  useEffect(() => {
    dispatch(actions.pub.requestBudgetAction(props.budgetId));
  }, [props.budgetId]);

  return (
    <PublicBudgetLayout budgetLoading={budgetLoading}>
      <Switch>
        <Redirect exact from={"/pub/:tokenId/budgets/:budgetId"} to={"/pub/:tokenId/budgets/:budgetId/accounts"} />
        <PathParamsRoute<{ accountId: number }>
          pub={true}
          params={["accountId"]}
          path={"/pub/:tokenId/budgets/:budgetId/accounts/:accountId"}
          render={(params: { accountId: number }) => <Account {...props} id={params.accountId} budget={budget} />}
        />
        <Route
          pub={true}
          path={"/pub/:tokenId/budgets/:budgetId/accounts"}
          render={() => <Accounts {...props} budget={budget} />}
        />
        <PathParamsRoute<{ subaccountId: number }>
          pub={true}
          params={["subaccountId"]}
          path={"/pub/:tokenId/budgets/:budgetId/subaccounts/:subaccountId"}
          render={(params: { subaccountId: number }) => (
            <SubAccount {...props} id={params.subaccountId} budget={budget} />
          )}
        />
      </Switch>
    </PublicBudgetLayout>
  );
};

export default PublicBudget;
