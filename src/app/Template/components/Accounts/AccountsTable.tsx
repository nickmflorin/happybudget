import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { createSelector } from "reselect";
import { isNil, map } from "lodash";

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
  setSearch: actions.accounts.setSearchAction
};

const ConnectedTable = connectTableToStore<
  GenericAccountsTable.AuthenticatedTemplateProps,
  R,
  M,
  Model.BudgetGroup,
  Tables.AccountTableStore
>({
  storeId: "async-TemplateAccountsTable",
  actions: ActionMap,
  footerRowSelectors: {
    footer: createSelector(
      [redux.selectors.simpleDeepEqualSelector((state: Application.Authenticated.Store) => state.template.detail.data)],
      (template: Model.Template | undefined) => ({
        identifier: !isNil(template) && !isNil(template.name) ? `${template.name} Total` : "Template Total",
        estimated: template?.estimated || 0.0
      })
    )
  },
  reducer: budgeting.reducers.createAuthenticatedAccountsTableReducer({
    columns: GenericAccountsTable.TemplateColumns,
    actions: ActionMap,
    getModelRowLabel: (r: R) => r.identifier,
    getModelRowName: "Account",
    getPlaceholderRowLabel: (r: R) => r.identifier,
    getPlaceholderRowName: "Account",
    initialState: redux.initialState.initialTableState
  })
})(GenericAccountsTable.AuthenticatedTemplate);

interface AccountsTableProps {
  readonly templateId: number;
  readonly template: Model.Template | undefined;
}

const AccountsTable = ({ templateId, template }: AccountsTableProps): JSX.Element => {
  const [groupAccounts, setGroupAccounts] = useState<ID[] | undefined>(undefined);
  const [groupToEdit, setGroupToEdit] = useState<Model.BudgetGroup | undefined>(undefined);

  const dispatch = useDispatch();
  const history = useHistory();

  const tableRef = tabling.hooks.useAuthenticatedTable<R>();

  return (
    <React.Fragment>
      <ConnectedTable
        tableRef={tableRef}
        budget={template}
        menuPortalId={"supplementary-header"}
        savingChangesPortalId={"saving-changes"}
        onRowExpand={(row: Table.ModelRow<R>) => history.push(`/templates/${templateId}/accounts/${row.id}`)}
        onGroupRows={(rows: Table.DataRow<R>[]) => setGroupAccounts(map(rows, (row: Table.DataRow<R>) => row.id))}
        onEditGroup={(group: Model.BudgetGroup) => setGroupToEdit(group)}
      />
      {!isNil(groupAccounts) && !isNil(templateId) && (
        <CreateTemplateAccountGroupModal
          templateId={templateId}
          accounts={groupAccounts}
          open={true}
          onSuccess={(group: Model.BudgetGroup) => {
            setGroupAccounts(undefined);
            dispatch(actions.accounts.addGroupToStateAction(group));
          }}
          onCancel={() => setGroupAccounts(undefined)}
        />
      )}
      {!isNil(groupToEdit) && (
        <EditGroupModal
          group={groupToEdit}
          open={true}
          onCancel={() => setGroupToEdit(undefined)}
          onSuccess={(group: Model.BudgetGroup) => {
            setGroupToEdit(undefined);
            dispatch(actions.accounts.updateGroupInStateAction({ id: group.id, data: group }));
            if (group.color !== groupToEdit.color) {
              tableRef.current.applyGroupColorChange(group);
            }
          }}
        />
      )}
    </React.Fragment>
  );
};

export default AccountsTable;
