import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { createSelector } from "reselect";
import { isNil, map } from "lodash";

import { budgeting, redux, tabling, model } from "lib";
import { CreateMarkupModal, EditMarkupModal } from "components/modals";
import { AccountsTable as GenericAccountsTable, connectTableToStore } from "components/tabling";

import { actions } from "../../store";
import PreviewModal from "../PreviewModal";

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
        estimated: !isNil(budget) ? model.businessLogic.estimatedValue(budget) : 0.0,
        variance: !isNil(budget) ? model.businessLogic.varianceValue(budget) : 0.0,
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
}

const AccountsTable = ({ budgetId, budget }: AccountsTableProps): JSX.Element => {
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [markupAccounts, setMarkupAccounts] = useState<number[] | undefined>(undefined);
  const [markupToEdit, setMarkupToEdit] = useState<number | null>(null);

  const dispatch = useDispatch();
  const history = useHistory();

  const table = tabling.hooks.useTable<R>();

  const [groupModals, onEditGroup, onCreateGroup] = budgeting.hooks.useGrouping({
    parentId: budgetId,
    parentType: "budget",
    table: table.current,
    onGroupUpdated: (group: Model.Group) =>
      dispatch(
        actions.account.handleTableChangeEventAction({
          type: "groupUpdated",
          payload: { id: group.id, data: group }
        })
      )
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
        onMarkupRows={(rows: Table.ModelRow<R>[]) => setMarkupAccounts(map(rows, (row: Table.ModelRow<R>) => row.id))}
        onEditGroup={(group: Table.GroupRow<R>) => onEditGroup(group)}
        onEditMarkup={(row: Table.MarkupRow<R>) => setMarkupToEdit(tabling.rows.markupId(row.id))}
      />
      {groupModals}
      {!isNil(markupAccounts) && !isNil(budgetId) && (
        <CreateMarkupModal<
          Model.SimpleSubAccount,
          Model.Budget,
          Http.BudgetContextDetailResponse<Model.Markup, Model.Budget>
        >
          id={budgetId}
          parentType={"budget"}
          children={markupAccounts}
          open={true}
          onSuccess={(response: Http.BudgetContextDetailResponse<Model.Markup, Model.Budget>) => {
            setMarkupAccounts(undefined);
            table.current.applyTableChange({
              type: "markupAdded",
              payload: response.data
            });
            dispatch(actions.updateBudgetInStateAction({ id: response.budget.id, data: response.budget }));
          }}
          onCancel={() => setMarkupAccounts(undefined)}
        />
      )}
      {!isNil(markupToEdit) && (
        <EditMarkupModal<
          Model.SimpleSubAccount,
          Model.Budget,
          Http.BudgetContextDetailResponse<Model.Markup, Model.Budget>
        >
          id={markupToEdit}
          parentId={budgetId}
          parentType={"budget"}
          open={true}
          onCancel={() => setMarkupToEdit(null)}
          onSuccess={(response: Http.BudgetContextDetailResponse<Model.Markup, Model.Budget>) => {
            setMarkupToEdit(null);
            table.current.applyTableChange({
              type: "markupUpdated",
              payload: { id: response.data.id, data: response.data }
            });
            dispatch(actions.updateBudgetInStateAction({ id: response.budget.id, data: response.budget }));
          }}
        />
      )}
      <PreviewModal
        autoRenderPdf={false}
        visible={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        budgetId={budgetId}
        budgetName={!isNil(budget) ? `${budget.name}` : `Sample Budget ${new Date().getFullYear()}`}
        filename={!isNil(budget) ? `${budget.name}.pdf` : "budget.pdf"}
      />
    </React.Fragment>
  );
};

export default AccountsTable;
