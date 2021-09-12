import { useHistory } from "react-router-dom";
import { createSelector } from "reselect";
import { isNil } from "lodash";

import { budgeting, tabling, redux } from "lib";
import { AccountsTable as GenericAccountsTable, connectTableToStore } from "components/tabling";

import { actions } from "../../store";

type R = Tables.AccountRowData;
type M = Model.Account;

const ActionMap = {
  request: actions.accounts.requestAction,
  loading: actions.accounts.loadingAction,
  response: actions.accounts.responseAction,
  setSearch: actions.accounts.setSearchAction
};

const ConnectedTable = connectTableToStore<
  GenericAccountsTable.UnauthenticatedBudgetProps,
  R,
  M,
  Model.BudgetGroup,
  Tables.AccountTableStore
>({
  storeId: "async-ShareAccountsTable",
  actions: ActionMap,
  footerRowSelectors: {
    footer: createSelector(
      [redux.selectors.simpleDeepEqualSelector((state: Application.Unauthenticated.Store) => state.share.detail.data)],
      (budget: Model.Budget | undefined) => ({
        identifier: !isNil(budget) && !isNil(budget.name) ? `${budget.name} Total` : "Budget Total",
        estimated: budget?.estimated || 0.0,
        variance: budget?.variance || 0.0,
        actual: budget?.actual || 0.0
      })
    )
  },
  reducer: budgeting.reducers.createAuthenticatedAccountsTableReducer({
    columns: GenericAccountsTable.BudgetColumns,
    actions: ActionMap,
    getModelRowLabel: (r: R) => r.identifier,
    getModelRowName: "Account",
    getPlaceholderRowLabel: (r: R) => r.identifier,
    getPlaceholderRowName: "Account",
    initialState: redux.initialState.initialTableState
  })
})(GenericAccountsTable.UnauthenticatedBudget);

interface AccountsTableProps {
  readonly budgetId: number;
  readonly budget: Model.Budget | undefined;
}

const AccountsTable = ({ budgetId, budget }: AccountsTableProps): JSX.Element => {
  const history = useHistory();
  const table = tabling.hooks.useAuthenticatedTable<R>();

  return (
    <ConnectedTable
      tableRef={table}
      budget={budget}
      onRowExpand={(row: Table.ModelRow<R>) => history.push(`/budgets/${budgetId}/accounts/${row.id}`)}
    />
  );
};

export default AccountsTable;
