import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Redirect, Route, Switch, useHistory, useLocation, useParams, useRouteMatch } from "react-router-dom";
import { filter, isNil, map } from "lodash";
import { createSelector } from "reselect";

import { budgeting } from "lib";
import { Icon, RenderIfValidId, SavingChanges } from "components";

import { wipeStateAction, setBudgetIdAction } from "../../store/actions/budget";
import { selectBudgetDetail } from "../../store/selectors";

import GenericLayout from "../GenericLayout";

import Account from "./Account";
import Accounts from "./Accounts";
import SubAccount from "./SubAccount";
import Actuals from "./Actuals";
import Analysis from "./Analysis";

const selectSaving = createSelector(
  (state: Modules.ApplicationStore) => state.budget.budget.actuals.deleting,
  (state: Modules.ApplicationStore) => state.budget.budget.actuals.updating,
  (state: Modules.ApplicationStore) => state.budget.budget.actuals.creating,
  (state: Modules.ApplicationStore) => state.budget.budget.subaccount.table.deleting,
  (state: Modules.ApplicationStore) => state.budget.budget.subaccount.table.updating,
  (state: Modules.ApplicationStore) => state.budget.budget.subaccount.table.creating,
  (state: Modules.ApplicationStore) => state.budget.budget.budget.table.deleting,
  (state: Modules.ApplicationStore) => state.budget.budget.budget.table.updating,
  (state: Modules.ApplicationStore) => state.budget.budget.budget.table.creating,
  (state: Modules.ApplicationStore) => state.budget.budget.account.table.deleting,
  (state: Modules.ApplicationStore) => state.budget.budget.account.table.updating,
  (state: Modules.ApplicationStore) => state.budget.budget.account.table.creating,
  (...args: (Redux.ModelListActionInstance[] | boolean)[]) => {
    return (
      filter(
        map(args, (arg: Redux.ModelListActionInstance[] | boolean) =>
          Array.isArray(arg) ? arg.length !== 0 : arg === true
        ),
        (value: boolean) => value === true
      ).length !== 0
    );
  }
);

const Budget = (): JSX.Element => {
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();
  const { budgetId } = useParams<{ budgetId: string }>();
  const match = useRouteMatch();
  const saving = useSelector(selectSaving);
  const budget = useSelector(selectBudgetDetail);

  useEffect(() => {
    dispatch(wipeStateAction(null));
    if (!isNaN(parseInt(budgetId))) {
      dispatch(setBudgetIdAction(parseInt(budgetId)));
    }
  }, [budgetId]);

  return (
    <GenericLayout
      toolbar={() => <SavingChanges saving={saving} />}
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
              const budgetLastVisited = budgeting.urls.getBudgetLastVisited(parseInt(budgetId));
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
    </GenericLayout>
  );
};

export default Budget;
