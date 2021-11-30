import React from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { createSelector } from "reselect";
import { isNil, map } from "lodash";

import { budgeting, redux, tabling } from "lib";
import { useGrouping, useMarkup } from "components/hooks";
import { AccountsTable as GenericAccountsTable, connectTableToStore } from "components/tabling";

import { actions } from "../../../store";

type R = Tables.AccountRowData;
type M = Model.Account;

const ActionMap = {
  tableChanged: actions.accounts.handleTableChangeEventAction,
  request: actions.accounts.requestAction,
  loading: actions.accounts.loadingAction,
  response: actions.accounts.responseAction,
  saving: actions.accounts.savingTableAction,
  addModelsToState: actions.accounts.addModelsToStateAction,
  setSearch: actions.accounts.setSearchAction,
  clear: actions.accounts.clearAction
};

const ConnectedTable = connectTableToStore<
  GenericAccountsTable.AuthenticatedBudgetProps,
  R,
  M,
  Tables.AccountTableStore
>({
  asyncId: "async-accounts-table",
  actions: ActionMap,
  footerRowSelectors: {
    footer: createSelector(
      [redux.selectors.simpleDeepEqualSelector((state: Application.Authenticated.Store) => state.budget.detail.data)],
      (budget: Model.Budget | null) => ({
        identifier: !isNil(budget) && !isNil(budget.name) ? `${budget.name} Total` : "Budget Total",
        estimated: !isNil(budget) ? budgeting.businessLogic.estimatedValue(budget) : 0.0,
        variance: !isNil(budget) ? budgeting.businessLogic.varianceValue(budget) : 0.0,
        actual: budget?.actual || 0.0
      })
    )
  },
  reducer: budgeting.reducers.createAuthenticatedAccountsTableReducer({
    tableId: "accounts-table",
    columns: GenericAccountsTable.Columns,
    actions: ActionMap,
    getModelRowChildren: (m: Model.Account) => m.children,
    initialState: redux.initialState.initialTableState
  })
})(GenericAccountsTable.AuthenticatedBudget);

interface AccountsTableProps {
  readonly budgetId: number;
  readonly budget: Model.Budget | null;
  readonly setPreviewModalVisible: (v: boolean) => void;
}

const AccountsTable = ({ budgetId, budget, setPreviewModalVisible }: AccountsTableProps): JSX.Element => {
  const dispatch = useDispatch();
  const history = useHistory();

  const table = tabling.hooks.useTable<R>();

  const [groupModals, onEditGroup, onCreateGroup] = useGrouping({
    parentId: budgetId,
    parentType: "budget",
    table: table.current,
    onGroupUpdated: (group: Model.Group) =>
      table.current.applyTableChange({
        type: "groupUpdated",
        payload: group
      })
  });

  const [markupModals, onEditMarkup, onCreateMarkup] = useMarkup({
    parentId: budgetId,
    parentType: "budget",
    table: table.current,
    onResponse: (response: Http.BudgetContextDetailResponse<Model.Markup, Model.Budget>) => {
      dispatch(actions.updateBudgetInStateAction({ id: response.budget.id, data: response.budget }));
    }
  });

  return (
    <React.Fragment>
      <ConnectedTable
        tableId={"accounts-table"}
        budget={budget}
        table={table}
        menuPortalId={"supplementary-header"}
        savingChangesPortalId={"saving-changes"}
        onExportPdf={() => setPreviewModalVisible(true)}
        onRowExpand={(row: Table.ModelRow<R>) => history.push(`/budgets/${budgetId}/accounts/${row.id}`)}
        onGroupRows={(rows: Table.ModelRow<R>[]) => onCreateGroup(map(rows, (row: Table.ModelRow<R>) => row.id))}
        onMarkupRows={(rows?: Table.ModelRow<R>[]) =>
          rows === undefined ? onCreateMarkup() : onCreateMarkup(map(rows, (row: Table.ModelRow<R>) => row.id))
        }
        onEditGroup={(group: Table.GroupRow<R>) => onEditGroup(group)}
        onEditMarkup={(row: Table.MarkupRow<R>) => onEditMarkup(tabling.managers.markupId(row.id))}
      />
      {groupModals}
      {markupModals}
    </React.Fragment>
  );
};

export default AccountsTable;
