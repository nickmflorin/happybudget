import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { createSelector } from "reselect";
import { isNil, map, filter, intersection } from "lodash";

import { tabling, budgeting, redux, model } from "lib";
import { CreateGroupModal, EditGroupModal } from "components/modals";
import { AccountsTable as GenericAccountsTable, connectTableToStore } from "components/tabling";

import { actions } from "../../store";

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
  GenericAccountsTable.AuthenticatedTemplateProps,
  R,
  M,
  Tables.AccountTableStore
>({
  asyncId: "async-accounts-table",
  actions: ActionMap,
  footerRowSelectors: {
    footer: createSelector(
      [redux.selectors.simpleDeepEqualSelector((state: Application.Authenticated.Store) => state.template.detail.data)],
      (budget: Model.Template | null) => ({
        identifier: !isNil(budget) && !isNil(budget.name) ? `${budget.name} Total` : "Budget Total",
        estimated: !isNil(budget) ? model.businessLogic.estimatedValue(budget) : 0.0
      })
    )
  },
  reducer: budgeting.reducers.createAuthenticatedAccountsTableReducer({
    tableId: "accounts-table",
    columns: filter(
      GenericAccountsTable.Columns,
      (c: Table.Column<R, M>) => intersection([c.field, c.colId], ["variance", "actual"]).length === 0
    ),
    actions: ActionMap,
    getModelRowChildren: (m: Model.Account) => m.children,
    initialState: redux.initialState.initialTableState
  })
})(GenericAccountsTable.AuthenticatedTemplate);

interface AccountsTableProps {
  readonly templateId: number;
  readonly template: Model.Template | null;
}

const AccountsTable = ({ templateId, template }: AccountsTableProps): JSX.Element => {
  const [groupAccounts, setGroupAccounts] = useState<number[] | undefined>(undefined);
  const [groupToEdit, setGroupToEdit] = useState<Table.GroupRow<R> | undefined>(undefined);

  const history = useHistory();

  const table = tabling.hooks.useTable<R>();

  return (
    <React.Fragment>
      <ConnectedTable
        tableId={"accounts-table"}
        table={table}
        budget={template}
        menuPortalId={"supplementary-header"}
        savingChangesPortalId={"saving-changes"}
        onRowExpand={(row: Table.ModelRow<R>) => history.push(`/templates/${templateId}/accounts/${row.id}`)}
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
        onEditGroup={(group: Table.GroupRow<R>) => setGroupToEdit(group)}
      />
      {!isNil(groupAccounts) && !isNil(templateId) && (
        <CreateGroupModal
          id={templateId}
          parentType={"template"}
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
    </React.Fragment>
  );
};

export default AccountsTable;
