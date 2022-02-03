import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { createSelector } from "reselect";
import { isNil } from "lodash";

import { budgeting, tabling } from "lib";
import { AccountsTable as GenericAccountsTable, connectTableToAuthenticatedStore } from "tabling";

import { actions, selectors, sagas } from "../../store";

type R = Tables.AccountRowData;
type M = Model.Account;

const ConnectedTable = connectTableToAuthenticatedStore<
  GenericAccountsTable.AuthenticatedBudgetProps,
  R,
  M,
  Tables.AccountTableStore,
  Tables.AccountTableContext
>({
  actions: {
    tableChanged: actions.budget.accounts.handleTableChangeEventAction,
    loading: actions.budget.accounts.loadingAction,
    response: actions.budget.accounts.responseAction,
    addModelsToState: actions.budget.accounts.addModelsToStateAction,
    setSearch: actions.budget.accounts.setSearchAction
  },
  tableId: "budget-accounts",
  selector: (s: Application.Store) => selectors.selectAccountsTableStore(s, { domain: "budget" }),
  createSaga: (table: Table.TableInstance<R, M>) => sagas.budget.accounts.createTableSaga(table),
  footerRowSelectors: {
    footer: createSelector(
      (state: Application.Store) => state.budget.detail.data,
      (budget: Model.Budget | null) => ({
        identifier: !isNil(budget) && !isNil(budget.name) ? `${budget.name} Total` : "Budget Total",
        estimated: !isNil(budget) ? budgeting.businessLogic.estimatedValue(budget) : 0.0,
        variance: !isNil(budget) ? budgeting.businessLogic.varianceValue(budget) : 0.0,
        actual: budget?.actual || 0.0
      })
    )
  }
})(GenericAccountsTable.AuthenticatedBudget);

interface AccountsTableProps {
  readonly budgetId: number;
  readonly budget: Model.Budget | null;
  readonly setPreviewModalVisible: (v: boolean) => void;
}

const AccountsTable = ({ setPreviewModalVisible, ...props }: AccountsTableProps): JSX.Element => {
  const dispatch = useDispatch();
  const table = tabling.hooks.useTable<R, M>();

  useEffect(() => {
    dispatch(actions.budget.accounts.requestAction(null, { budgetId: props.budgetId }));
  }, [props.budgetId]);

  return (
    <ConnectedTable
      id={props.budgetId}
      parent={props.budget}
      actionContext={{ budgetId: props.budgetId }}
      table={table}
      onExportPdf={() => setPreviewModalVisible(true)}
      onParentUpdated={(p: Model.Budget) => dispatch(actions.budget.updateBudgetInStateAction({ id: p.id, data: p }))}
      onShared={(publicToken: Model.PublicToken) =>
        dispatch(actions.budget.updateBudgetInStateAction({ id: props.budgetId, data: { public_token: publicToken } }))
      }
      onShareUpdated={(publicToken: Model.PublicToken) =>
        dispatch(actions.budget.updateBudgetInStateAction({ id: props.budgetId, data: { public_token: publicToken } }))
      }
      onUnshared={() =>
        dispatch(actions.budget.updateBudgetInStateAction({ id: props.budgetId, data: { public_token: null } }))
      }
    />
  );
};

export default AccountsTable;
