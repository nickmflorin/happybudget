import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { createSelector } from "reselect";
import { isNil, map, filter } from "lodash";

import { budgeting, redux, tabling, model } from "lib";
import { CreateGroupModal, EditGroupModal, CreateMarkupModal, EditMarkupModal } from "components/modals";
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
    columns: map(GenericAccountsTable.Columns, (c: Table.LazyColumn<R, M>) => c.column({})),
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

  const table = tabling.hooks.useTable<R>();

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
        onGroupRows={(rows: (Table.ModelRow<R> | Table.MarkupRow<R>)[]) =>
          setGroupAccounts(
            map(
              filter(rows, (row: Table.ModelRow<R> | Table.MarkupRow<R>) =>
                tabling.typeguards.isModelRow(row)
              ) as Table.ModelRow<R>[],
              (row: Table.ModelRow<R>) => row.id
            )
          )
        }
        onMarkupRows={(rows: (Table.ModelRow<R> | Table.GroupRow<R>)[]) =>
          setMarkupAccounts(
            map(
              filter(rows, (row: Table.ModelRow<R> | Table.GroupRow<R>) =>
                tabling.typeguards.isModelRow(row)
              ) as Table.ModelRow<R>[],
              (row: Table.ModelRow<R>) => row.id
            )
          )
        }
        onEditGroup={(group: Table.GroupRow<R>) => setGroupToEdit(group)}
        onEditMarkup={(row: Table.MarkupRow<R>) => setMarkupToEdit(tabling.rows.markupId(row.id))}
      />
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
      {!isNil(groupAccounts) && !isNil(budgetId) && (
        <CreateGroupModal
          id={budgetId}
          parentType={"budget"}
          children={groupAccounts}
          open={true}
          onSuccess={(group: Model.Group) => {
            setGroupAccounts(undefined);
            table.current.applyTableChange({
              type: "groupAdded",
              payload: group
            });
          }}
          onCancel={() => setGroupAccounts(undefined)}
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
      {!isNil(groupToEdit) && (
        <EditGroupModal
          id={tabling.rows.groupId(groupToEdit.id)}
          open={true}
          onCancel={() => setGroupToEdit(undefined)}
          onSuccess={(group: Model.Group) => {
            setGroupToEdit(undefined);
            table.current.applyTableChange({
              type: "groupUpdated",
              payload: { id: group.id, data: group }
            });
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
        budgetName={!isNil(budget) ? `${budget.name}` : `Sample Budget ${new Date().getFullYear()}`}
        filename={!isNil(budget) ? `${budget.name}.pdf` : "budget.pdf"}
      />
    </React.Fragment>
  );
};

export default AccountsTable;
