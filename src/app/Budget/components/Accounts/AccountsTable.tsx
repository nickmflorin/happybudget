import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { createSelector } from "reselect";
import { isNil, map, filter } from "lodash";

import { budgeting, redux, tabling } from "lib";
import {
  CreateBudgetAccountGroupModal,
  EditGroupModal,
  CreateBudgetAccountMarkupModal,
  EditMarkupModal
} from "components/modals";
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
        estimated: !isNil(budget) ? budget.estimated + budget.markup_contribution + budget.fringe_contribution : 0.0,
        variance: !isNil(budget)
          ? budget.estimated + budget.markup_contribution + budget.fringe_contribution - budget.actual
          : 0.0,
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
  const [groupAccounts, setGroupAccounts] = useState<number[] | undefined>(undefined);
  const [groupToEdit, setGroupToEdit] = useState<Table.GroupRow<R> | undefined>(undefined);
  const [markupToEdit, setMarkupToEdit] = useState<number | null>(null);

  const dispatch = useDispatch();
  const history = useHistory();

  const table = tabling.hooks.useTable<R, M>();

  return (
    <React.Fragment>
      <ConnectedTable
        tableId={"accounts-table"}
        budget={budget}
        table={table}
        menuPortalId={"supplementary-header"}
        savingChangesPortalId={"saving-changes"}
        onExportPdf={() => setPreviewModalVisible(true)}
        onRowExpand={(row: Table.DataRow<R, M>) => history.push(`/budgets/${budgetId}/accounts/${row.id}`)}
        onGroupRows={(rows: (Table.ModelRow<R, M> | Table.MarkupRow<R>)[]) =>
          setGroupAccounts(
            map(
              filter(rows, (row: Table.ModelRow<R, M> | Table.MarkupRow<R>) =>
                tabling.typeguards.isModelRow(row)
              ) as Table.ModelRow<R, M>[],
              (row: Table.ModelRow<R, M>) => row.id
            )
          )
        }
        onMarkupRows={(rows: (Table.ModelRow<R, M> | Table.GroupRow<R>)[]) =>
          setMarkupAccounts(
            map(
              filter(rows, (row: Table.ModelRow<R, M> | Table.GroupRow<R>) =>
                tabling.typeguards.isModelRow(row)
              ) as Table.ModelRow<R, M>[],
              (row: Table.ModelRow<R, M>) => row.id
            )
          )
        }
        onEditGroup={(group: Table.GroupRow<R>) => setGroupToEdit(group)}
        onEditMarkup={(row: Table.MarkupRow<R>) => setMarkupToEdit(row.markup)}
      />
      {!isNil(markupAccounts) && !isNil(budgetId) && (
        <CreateBudgetAccountMarkupModal
          budgetId={budgetId}
          accounts={markupAccounts}
          open={true}
          onSuccess={(markup: Model.Markup) => {
            setMarkupAccounts(undefined);
            dispatch(
              actions.accounts.handleTableChangeEventAction({
                type: "markupAdd",
                payload: markup
              })
            );
          }}
          onCancel={() => setMarkupAccounts(undefined)}
        />
      )}
      {!isNil(groupAccounts) && !isNil(budgetId) && (
        <CreateBudgetAccountGroupModal
          budgetId={budgetId}
          accounts={groupAccounts}
          open={true}
          onSuccess={(group: Model.Group) => {
            setGroupAccounts(undefined);
            dispatch(
              actions.accounts.handleTableChangeEventAction({
                type: "groupAdd",
                payload: group
              })
            );
          }}
          onCancel={() => setGroupAccounts(undefined)}
        />
      )}
      {!isNil(markupToEdit) && (
        <EditMarkupModal
          id={markupToEdit}
          open={true}
          onCancel={() => setMarkupToEdit(null)}
          onSuccess={(markup: Model.Markup) => {
            setMarkupToEdit(null);
            dispatch(
              actions.accounts.handleTableChangeEventAction({
                type: "markupUpdate",
                payload: { id: markup.id, data: markup }
              })
            );
          }}
        />
      )}
      {!isNil(groupToEdit) && (
        <EditGroupModal
          id={groupToEdit.group}
          open={true}
          onCancel={() => setGroupToEdit(undefined)}
          onSuccess={(group: Model.Group) => {
            setGroupToEdit(undefined);
            dispatch(
              actions.accounts.handleTableChangeEventAction({
                type: "groupUpdate",
                payload: { id: group.id, data: group }
              })
            );
            if (group.color !== groupToEdit.groupData.color) {
              table.current.applyGroupColorChange(group);
            }
          }}
        />
      )}
      <PreviewModal
        autoRenderPdf={false}
        visible={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        budgetId={budgetId}
        budgetName={!isNil(budget) ? `${budget.name} Budget` : `Sample Budget ${new Date().getFullYear()}`}
        filename={!isNil(budget) ? `${budget.name}.pdf` : "budget.pdf"}
      />
    </React.Fragment>
  );
};

export default AccountsTable;
