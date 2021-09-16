import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { createSelector } from "reselect";
import { isNil, map, filter, intersection } from "lodash";

import { tabling, budgeting, redux } from "lib";
import { CreateTemplateAccountGroupModal, EditGroupModal } from "components/modals";
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

  const dispatch = useDispatch();
  const history = useHistory();

  const table = tabling.hooks.useTable<R, M>();

  return (
    <React.Fragment>
      <ConnectedTable
        tableId={"accounts-table"}
        table={table}
        budget={template}
        menuPortalId={"supplementary-header"}
        savingChangesPortalId={"saving-changes"}
        onRowExpand={(row: Table.ModelRow<R>) => history.push(`/templates/${templateId}/accounts/${row.id}`)}
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
        onEditGroup={(group: Table.GroupRow<R>) => setGroupToEdit(group)}
      />
      {!isNil(groupAccounts) && !isNil(templateId) && (
        <CreateTemplateAccountGroupModal
          templateId={templateId}
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
    </React.Fragment>
  );
};

export default AccountsTable;
