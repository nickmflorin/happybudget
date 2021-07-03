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

import { RenderIfValidId, SavingChanges } from "components";

import { wipeStateAction, setBudgetIdAction } from "../../store/actions/budget";
import { GenericLayout } from "../Generic";
import { getBudgetLastVisited, isBudgetRelatedUrl } from "../../urls";

import Account from "./Account";
import Accounts from "./Accounts";
import SubAccount from "./SubAccount";
import Actuals from "./Actuals";
import Analysis from "./Analysis";

const selectSaving = createSelector(
  (state: Modules.ApplicationStore) => state.budgeting.budget.actuals.deleting,
  (state: Modules.ApplicationStore) => state.budgeting.budget.actuals.updating,
  (state: Modules.ApplicationStore) => state.budgeting.budget.actuals.creating,
  (state: Modules.ApplicationStore) => state.budgeting.budget.subaccount.subaccounts.deleting,
  (state: Modules.ApplicationStore) => state.budgeting.budget.subaccount.subaccounts.updating,
  (state: Modules.ApplicationStore) => state.budgeting.budget.subaccount.subaccounts.creating,
  (state: Modules.ApplicationStore) => state.budgeting.budget.accounts.deleting,
  (state: Modules.ApplicationStore) => state.budgeting.budget.accounts.updating,
  (state: Modules.ApplicationStore) => state.budgeting.budget.accounts.creating,
  (state: Modules.ApplicationStore) => state.budgeting.budget.account.subaccounts.deleting,
  (state: Modules.ApplicationStore) => state.budgeting.budget.account.subaccounts.updating,
  (state: Modules.ApplicationStore) => state.budgeting.budget.account.subaccounts.creating,
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
            if (!isNaN(parseInt(budgetId)) && !isBudgetRelatedUrl(location.pathname)) {
              const budgetLastVisited = getBudgetLastVisited(parseInt(budgetId));
              if (!isNil(budgetLastVisited)) {
                history.push(budgetLastVisited);
              } else {
                history.push(`/budgets/${budgetId}`);
              }
            }
          },
          active: isBudgetRelatedUrl(location.pathname),
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
          <Route path={"/budgets/:budgetId/actuals"} component={Actuals} />
          <Route path={"/budgets/:budgetId/analysis"} component={Analysis} />
          <Route exact path={"/budgets/:budgetId/accounts/:accountId"} component={Account} />
          <Route path={"/budgets/:budgetId/accounts"} component={Accounts} />
          <Route path={"/budgets/:budgetId/subaccounts/:subaccountId"} component={SubAccount} />
        </Switch>
      </RenderIfValidId>
    </GenericLayout>
  );
};

export default Budget;
