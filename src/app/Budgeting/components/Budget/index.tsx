import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Redirect, Route, Switch, useHistory, useLocation, useParams, useRouteMatch } from "react-router-dom";
import { filter, isNil, map } from "lodash";
import { createSelector } from "reselect";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilePlus as faFilePlusSolid,
  faCopy as faCopySolid,
  faAddressBook as faAddressBookSolid,
  faFileSpreadsheet as faFileSpreadsheetSolid,
  faFileInvoice as faFileInvoiceSolid,
  faFileChartLine as faFileChartLineSolid
} from "@fortawesome/pro-solid-svg-icons";
import {
  faFilePlus,
  faCopy,
  faAddressBook,
  faFileSpreadsheet,
  faFileInvoice,
  faFileChartLine
} from "@fortawesome/pro-light-svg-icons";

import { budgeting } from "lib";
import { RenderIfValidId, SavingChanges } from "components";

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
  (state: Modules.ApplicationStore) => state.budget.budget.subaccount.children.deleting,
  (state: Modules.ApplicationStore) => state.budget.budget.subaccount.children.updating,
  (state: Modules.ApplicationStore) => state.budget.budget.subaccount.children.creating,
  (state: Modules.ApplicationStore) => state.budget.budget.budget.children.deleting,
  (state: Modules.ApplicationStore) => state.budget.budget.budget.children.updating,
  (state: Modules.ApplicationStore) => state.budget.budget.budget.children.creating,
  (state: Modules.ApplicationStore) => state.budget.budget.account.children.deleting,
  (state: Modules.ApplicationStore) => state.budget.budget.account.children.updating,
  (state: Modules.ApplicationStore) => state.budget.budget.account.children.creating,
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
          icon: <FontAwesomeIcon icon={faFilePlus} />,
          activeIcon: <FontAwesomeIcon icon={faFilePlusSolid} />,
          onClick: () => history.push("/templates"),
          tooltip: {
            title: "Templates",
            placement: "right"
          }
        },
        {
          icon: <FontAwesomeIcon icon={faCopy} />,
          activeIcon: <FontAwesomeIcon icon={faCopySolid} />,
          onClick: () => history.push("/budgets"),
          tooltip: {
            title: "My Budgets",
            placement: "right"
          }
        },
        {
          icon: <FontAwesomeIcon icon={faAddressBook} flip={"horizontal"} />,
          activeIcon: <FontAwesomeIcon icon={faAddressBookSolid} flip={"horizontal"} />,
          onClick: () => history.push("/contacts"),
          separatorAfter: true,
          tooltip: {
            title: "Contacts",
            placement: "right"
          }
        },
        {
          icon: <FontAwesomeIcon icon={faFileChartLine} />,
          activeIcon: <FontAwesomeIcon icon={faFileChartLineSolid} />,
          onClick: () => history.push(`/budgets/${budgetId}/analysis`),
          active: location.pathname.startsWith(`/budgets/${budgetId}/analysis`),
          tooltip: {
            title: "Analysis",
            placement: "right"
          }
        },
        {
          icon: <FontAwesomeIcon icon={faFileSpreadsheet} />,
          activeIcon: <FontAwesomeIcon icon={faFileSpreadsheetSolid} />,
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
          icon: <FontAwesomeIcon icon={faFileInvoice} />,
          activeIcon: <FontAwesomeIcon icon={faFileInvoiceSolid} />,
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
