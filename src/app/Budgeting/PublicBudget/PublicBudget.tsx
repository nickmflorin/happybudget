import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Redirect, Switch, useHistory, useLocation } from "react-router-dom";
import { isNil } from "lodash";

import { budgeting } from "lib";
import { Icon } from "components";
import { CollapsedLayout } from "components/layout";
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
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();
  const budget = useSelector((s: Application.Store) =>
    selectors.selectBudgetDetail(s, { domain: "budget", public: true })
  ) as Model.Budget | null;

  useEffect(() => {
    dispatch(actions.pub.requestBudgetAction(props.budgetId));
  }, [props.budgetId]);

  return (
    <CollapsedLayout
      className={"layout--budget"}
      sidebar={[
        {
          icon: <Icon weight={"light"} icon={"file-spreadsheet"} />,
          activeIcon: <Icon weight={"solid"} icon={"file-spreadsheet"} />,
          onClick: () => {
            if (!budgeting.urls.isBudgetRelatedUrl(location.pathname, props.budgetId, props.tokenId)) {
              const budgetLastVisited = budgeting.urls.getLastVisited("budget", props.budgetId, props.tokenId);
              if (!isNil(budgetLastVisited)) {
                history.push(budgetLastVisited);
              } else {
                history.push(budgeting.urls.getUrl({ domain: "budget", id: props.budgetId }, undefined, props.tokenId));
              }
            }
          },
          active: budgeting.urls.isBudgetRelatedUrl(location.pathname, props.budgetId, props.tokenId),
          tooltip: {
            title: "Budget",
            placement: "right"
          }
        }
      ]}
    >
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
    </CollapsedLayout>
  );
};

export default PublicBudget;
