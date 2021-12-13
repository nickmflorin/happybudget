import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Redirect, Route, Switch, useHistory, useLocation, useParams, useRouteMatch } from "react-router-dom";

import { budgeting } from "lib";
import { RenderIfValidId, Icon } from "components";
import { CollapsedLayout } from "components/layout";

import { actions, selectors } from "./store";

import { Account, Accounts, SubAccount } from "./components";

const Budget = (): JSX.Element => {
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();
  const { budgetId } = useParams<{ budgetId: string }>();
  const match = useRouteMatch();
  const budget = useSelector(selectors.selectBudgetDetail);

  useEffect(() => {
    if (!isNaN(parseInt(budgetId))) {
      dispatch(actions.setBudgetIdAction(parseInt(budgetId)));
    }
  }, [budgetId]);

  return (
    <CollapsedLayout
      className={"layout--budget"}
      sidebar={[
        {
          icon: <Icon weight={"light"} icon={"file-spreadsheet"} />,
          activeIcon: <Icon weight={"solid"} icon={"file-spreadsheet"} />,
          onClick: () => history.push(`/budgets/${budgetId}`),
          active: budgeting.urls.isBudgetRelatedUrl(location.pathname),
          tooltip: {
            title: "Budget",
            placement: "right"
          }
        }
      ]}
    >
      <RenderIfValidId id={[budgetId]}>
        <Switch>
          <Redirect exact from={match.url} to={`${match.url}/accounts`} />
          <Route
            exact
            path={"/budgets/:budgetId/accounts/:accountId"}
            render={() => <Account budgetId={parseInt(budgetId)} budget={budget} />}
          />
          <Route
            path={"/budgets/:budgetId/accounts"}
            render={() => <Accounts budgetId={parseInt(budgetId)} budget={budget} />}
          />
          <Route
            path={"/budgets/:budgetId/subaccounts/:subaccountId"}
            render={() => <SubAccount budgetId={parseInt(budgetId)} budget={budget} />}
          />
        </Switch>
      </RenderIfValidId>
    </CollapsedLayout>
  );
};

export default Budget;
