import { createSelector } from "reselect";
import { isNil } from "lodash";

import { budgeting, redux } from "lib";
import { AccountsTable as GenericAccountsTable, connectTableToStore } from "tabling";

import { actions } from "../../store";

type R = Tables.AccountRowData;
type M = Model.Account;

const ActionMap = {
  loading: actions.accounts.loadingAction,
  response: actions.accounts.responseAction,
  setSearch: actions.accounts.setSearchAction
};

const ConnectedTable = connectTableToStore<
  GenericAccountsTable.UnauthenticatedBudgetProps,
  R,
  M,
  Tables.AccountTableStore
>({
  asyncId: "async-accounts-table",
  actions: ActionMap,
  footerRowSelectors: {
    footer: createSelector(
      [redux.selectors.simpleDeepEqualSelector((state: Application.Unauthenticated.Store) => state.share.detail.data)],
      (budget: Model.Budget | null) => ({
        identifier: !isNil(budget) && !isNil(budget.name) ? `${budget.name} Total` : "Budget Total",
        estimated: !isNil(budget) ? budgeting.businessLogic.estimatedValue(budget) : 0.0,
        variance: !isNil(budget) ? budgeting.businessLogic.varianceValue(budget) : 0.0,
        actual: budget?.actual || 0.0
      })
    )
  },
  reducer: budgeting.reducers.createUnauthenticatedAccountsTableReducer({
    columns: GenericAccountsTable.Columns,
    actions: ActionMap,
    clearOn: [actions.accounts.requestAction, actions.setBudgetIdAction],
    getModelRowChildren: (m: Model.Account) => m.children,
    initialState: redux.initialState.initialTableState
  })
})(GenericAccountsTable.UnauthenticatedBudget);

interface AccountsTableProps {
  readonly budgetId: number;
  readonly budget: Model.Budget | null;
}

const AccountsTable = ({ budgetId, budget }: AccountsTableProps): JSX.Element => {
  return <ConnectedTable budget={budget} />;
};

export default AccountsTable;
