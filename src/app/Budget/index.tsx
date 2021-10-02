import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Redirect, Route, Switch, useHistory, useLocation, useParams, useRouteMatch } from "react-router-dom";
import { isNil } from "lodash";

import { budgeting } from "lib";
import { Icon, RenderIfValidId } from "components";
import { Layout } from "components/layout";

import { Account, Accounts, SubAccount, Actuals, Analysis } from "./components";
import { actions, selectors } from "./store";

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
    <Layout
      collapsed
      className={"layout--budget"}
      sidebar={[
        {
          icon: <Icon weight={"light"} icon={"file-plus"} />,
          activeIcon: <Icon weight={"solid"} icon={"file-plus"} />,
          onClick: () => history.push("/templates"),
          tooltip: {
            title: "Templates",
            placement: "right"
          }
        },
        {
          icon: <Icon weight={"light"} icon={"copy"} />,
          activeIcon: <Icon weight={"solid"} icon={"copy"} />,
          onClick: () => history.push("/budgets"),
          tooltip: {
            title: "My Budgets",
            placement: "right"
          }
        },
        {
          icon: <Icon weight={"light"} icon={"address-book"} flip={"horizontal"} />,
          activeIcon: <Icon weight={"solid"} icon={"address-book"} flip={"horizontal"} />,
          onClick: () => history.push("/contacts"),
          separatorAfter: true,
          tooltip: {
            title: "Contacts",
            placement: "right"
          }
        },
        {
          icon: <Icon weight={"light"} icon={"file-chart-line"} />,
          activeIcon: <Icon weight={"solid"} icon={"file-chart-line"} />,
          onClick: () => history.push(`/budgets/${budgetId}/analysis`),
          active: location.pathname.startsWith(`/budgets/${budgetId}/analysis`),
          tooltip: {
            title: "Analysis",
            placement: "right"
          }
        },
        {
          icon: <Icon weight={"light"} icon={"file-spreadsheet"} />,
          activeIcon: <Icon weight={"solid"} icon={"file-spreadsheet"} />,
          onClick: () => {
            if (!isNaN(parseInt(budgetId)) && !budgeting.urls.isBudgetRelatedUrl(location.pathname)) {
              const budgetLastVisited = budgeting.urls.getLastVisited("budget-last-visited", budgetId);
              if (!isNil(budgetLastVisited)) {
                history.push(budgetLastVisited);
              } else {
                history.push(`/budgets/${budgetId}`);
              }
            }
          },
          active: budgeting.urls.isBudgetRelatedUrl(location.pathname),
          tooltip: {
            title: "Budget",
            placement: "right"
          }
        },
        {
          icon: <Icon weight={"light"} icon={"file-invoice"} />,
          activeIcon: <Icon weight={"solid"} icon={"file-invoice"} />,
          onClick: () => history.push(`/budgets/${budgetId}/actuals`),
          active: location.pathname.startsWith(`/budgets/${budgetId}/actuals`),
          tooltip: {
            title: "Actuals",
            placement: "right"
          }
        }
      ]}
    >
      <RenderIfValidId id={[budgetId]}>
        <Switch>
          <Redirect exact from={match.url} to={`${match.url}/accounts`} />
          <Route
            path={"/budgets/:budgetId/actuals"}
            render={() => <Actuals budgetId={parseInt(budgetId)} budget={budget} />}
          />
          <Route path={"/budgets/:budgetId/analysis"} component={Analysis} />
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
    </Layout>
  );
};

export default Budget;
