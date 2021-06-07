import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { isNil, map } from "lodash";
import { createSelector } from "reselect";

import { CreateSubAccountGroupModal, EditGroupModal } from "components/modals";
import { simpleDeepEqualSelector, simpleShallowEqualSelector } from "store/selectors";

import TemplateSubAccountsTable from "../SubAccountsTable";
import { selectTemplateId, selectSubAccountUnits } from "../../../store/selectors";
import {
  deselectSubAccountAction,
  removeSubAccountAction,
  selectSubAccountAction,
  setSubAccountsSearchAction,
  selectAllSubAccountsAction,
  deleteGroupAction,
  addGroupToStateAction,
  removeSubAccountFromGroupAction,
  tableChangedAction,
  updateGroupInStateAction,
  bulkCreateSubAccountsAction,
  addSubAccountToGroupAction
} from "../../../store/actions/template/account";

const selectGroups = simpleDeepEqualSelector(
  (state: Redux.ApplicationStore) => state.budgeting.template.account.subaccounts.groups.data
);
const selectSelectedRows = simpleDeepEqualSelector(
  (state: Redux.ApplicationStore) => state.budgeting.template.account.subaccounts.selected
);
const selectData = simpleDeepEqualSelector(
  (state: Redux.ApplicationStore) => state.budgeting.template.account.subaccounts.data
);
const selectTableSearch = simpleShallowEqualSelector(
  (state: Redux.ApplicationStore) => state.budgeting.template.account.subaccounts.search
);
const selectSaving = createSelector(
  (state: Redux.ApplicationStore) => state.budgeting.template.account.subaccounts.deleting,
  (state: Redux.ApplicationStore) => state.budgeting.template.account.subaccounts.updating,
  (state: Redux.ApplicationStore) => state.budgeting.template.account.subaccounts.creating,
  (deleting: Redux.ModelListActionInstance[], updating: Redux.ModelListActionInstance[], creating: boolean) =>
    deleting.length !== 0 || updating.length !== 0 || creating === true
);
const selectAccountDetail = simpleDeepEqualSelector(
  (state: Redux.ApplicationStore) => state.budgeting.template.account.detail.data
);
const selectReadyToRender = createSelector(
  (state: Redux.ApplicationStore) => state.budgeting.template.account.subaccounts.responseWasReceived,
  (state: Redux.ApplicationStore) => state.budgeting.template.account.subaccounts.groups.responseWasReceived,
  (accountsResponseReceived: boolean, groupsResponseReceived: boolean) =>
    accountsResponseReceived === true && groupsResponseReceived === true
);

interface SubAccountsTableProps {
  accountId: number;
}

const SubAccountsTable = ({ accountId }: SubAccountsTableProps): JSX.Element => {
  const [groupSubAccounts, setGroupSubAccounts] = useState<number[] | undefined>(undefined);
  const [groupToEdit, setGroupToEdit] = useState<Model.TemplateGroup | undefined>(undefined);
  const dispatch = useDispatch();
  const history = useHistory();

  const templateId = useSelector(selectTemplateId);
  const data = useSelector(selectData);
  const selected = useSelector(selectSelectedRows);
  const search = useSelector(selectTableSearch);
  const saving = useSelector(selectSaving);
  const accountDetail = useSelector(selectAccountDetail);
  const groups = useSelector(selectGroups);
  const readyToRender = useSelector(selectReadyToRender);
  const subAccountUnits = useSelector(selectSubAccountUnits);

  return (
    <React.Fragment>
      <TemplateSubAccountsTable
        data={data}
        groups={groups}
        selected={selected}
        detail={accountDetail}
        subAccountUnits={subAccountUnits}
        renderFlag={readyToRender}
        tableFooterIdentifierValue={
          !isNil(accountDetail) && !isNil(accountDetail.description)
            ? `${accountDetail.description} Total`
            : "Account Total"
        }
        search={search}
        onSearch={(value: string) => dispatch(setSubAccountsSearchAction(value))}
        saving={saving}
        categoryName={"Sub Account"}
        identifierFieldHeader={"Account"}
        cookies={!isNil(accountDetail) ? { ordering: `account-${accountDetail.id}-table-ordering` } : {}}
        onRowAdd={() => dispatch(bulkCreateSubAccountsAction(1))}
        onRowSelect={(id: number) => dispatch(selectSubAccountAction(id))}
        onRowDeselect={(id: number) => dispatch(deselectSubAccountAction(id))}
        onRowDelete={(row: Table.TemplateSubAccountRow) => dispatch(removeSubAccountAction(row.id))}
        onTableChange={(payload: Table.Change<Table.TemplateSubAccountRow>) => dispatch(tableChangedAction(payload))}
        onRowExpand={(id: number) => history.push(`/templates/${templateId}/subaccounts/${id}`)}
        onBack={() => history.push(`/templates/${templateId}/accounts?row=${accountId}`)}
        onDeleteGroup={(group: Model.TemplateGroup) => dispatch(deleteGroupAction(group.id))}
        onRowRemoveFromGroup={(row: Table.TemplateSubAccountRow) => dispatch(removeSubAccountFromGroupAction(row.id))}
        onRowAddToGroup={(group: number, row: Table.TemplateSubAccountRow) =>
          dispatch(addSubAccountToGroupAction({ id: row.id, group }))
        }
        onGroupRows={(rows: Table.TemplateSubAccountRow[]) =>
          setGroupSubAccounts(map(rows, (row: Table.TemplateSubAccountRow) => row.id))
        }
        onEditGroup={(group: Model.TemplateGroup) => setGroupToEdit(group)}
        onSelectAll={() => dispatch(selectAllSubAccountsAction(null))}
      />
      {!isNil(groupSubAccounts) && (
        <CreateSubAccountGroupModal
          accountId={accountId}
          subaccounts={groupSubAccounts}
          open={true}
          onSuccess={(group: Model.TemplateGroup) => {
            setGroupSubAccounts(undefined);
            dispatch(addGroupToStateAction(group));
          }}
          onCancel={() => setGroupSubAccounts(undefined)}
        />
      )}
      {!isNil(groupToEdit) && (
        <EditGroupModal<Model.TemplateGroup>
          group={groupToEdit}
          open={true}
          onCancel={() => setGroupToEdit(undefined)}
          onSuccess={(group: Model.TemplateGroup) => {
            setGroupToEdit(undefined);
            dispatch(updateGroupInStateAction({ id: group.id, data: group }));
          }}
        />
      )}
    </React.Fragment>
  );
};

export default SubAccountsTable;
