import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { isNil } from "lodash";
import { createSelector } from "reselect";
import { map } from "lodash";

import { CreateTemplateAccountGroupModal, EditGroupModal } from "components/modals";
import { simpleDeepEqualSelector, simpleShallowEqualSelector } from "store/selectors";
import { TemplateAccountRowManager } from "lib/tabling/managers";

import BudgetTable from "../../BudgetTable";
import { selectTemplateId, selectTemplateDetail } from "../../../store/selectors";
import {
  setAccountsSearchAction,
  addPlaceholdersToStateAction,
  deselectAccountAction,
  selectAccountAction,
  removeAccountAction,
  updateAccountAction,
  selectAllAccountsAction,
  addGroupToStateAction,
  deleteGroupAction,
  removeAccountFromGroupAction,
  bulkUpdateTemplateAccountsAction,
  updateGroupInStateAction
} from "../../../store/actions/template/accounts";

const selectGroups = simpleDeepEqualSelector((state: Redux.ApplicationStore) => state.template.accounts.groups.data);
const selectSelectedRows = simpleDeepEqualSelector((state: Redux.ApplicationStore) => state.template.accounts.selected);
const selectData = simpleDeepEqualSelector((state: Redux.ApplicationStore) => state.template.accounts.data);
const selectTableSearch = simpleShallowEqualSelector((state: Redux.ApplicationStore) => state.template.accounts.search);
const selectPlaceholders = simpleShallowEqualSelector(
  (state: Redux.ApplicationStore) => state.template.accounts.placeholders
);
const selectSaving = createSelector(
  (state: Redux.ApplicationStore) => state.template.accounts.deleting,
  (state: Redux.ApplicationStore) => state.template.accounts.updating,
  (state: Redux.ApplicationStore) => state.template.accounts.creating,
  (deleting: Redux.ModelListActionInstance[], updating: Redux.ModelListActionInstance[], creating: boolean) =>
    deleting.length !== 0 || updating.length !== 0 || creating === true
);
const selectReadyToRender = createSelector(
  (state: Redux.ApplicationStore) => state.template.accounts.responseWasReceived,
  (state: Redux.ApplicationStore) => state.template.accounts.groups.responseWasReceived,
  (accountsResponseReceived: boolean, groupsResponseReceived: boolean) =>
    accountsResponseReceived === true && groupsResponseReceived === true
);

const AccountsBudgetTable = (): JSX.Element => {
  const [groupAccounts, setGroupAccounts] = useState<number[] | undefined>(undefined);
  const [groupToEdit, setGroupToEdit] = useState<Model.TemplateGroup | undefined>(undefined);

  const dispatch = useDispatch();
  const history = useHistory();

  const templateId = useSelector(selectTemplateId);
  const data = useSelector(selectData);
  const placeholders = useSelector(selectPlaceholders);
  const selected = useSelector(selectSelectedRows);
  const search = useSelector(selectTableSearch);
  const saving = useSelector(selectSaving);
  const templateDetail = useSelector(selectTemplateDetail);
  const groups = useSelector(selectGroups);
  const readyToRender = useSelector(selectReadyToRender);

  return (
    <React.Fragment>
      <BudgetTable<Table.TemplateAccountRow, Model.TemplateAccount, Model.TemplateGroup, Http.TemplateAccountPayload>
        data={data}
        groups={groups}
        placeholders={placeholders}
        manager={TemplateAccountRowManager}
        selected={selected}
        renderFlag={readyToRender}
        identifierField={"identifier"}
        identifierFieldHeader={"Account"}
        sizeColumnsToFit={false}
        tableFooterIdentifierValue={!isNil(templateDetail) ? `${templateDetail.name} Total` : "Total"}
        search={search}
        onSearch={(value: string) => dispatch(setAccountsSearchAction(value))}
        saving={saving}
        onRowAdd={() => dispatch(addPlaceholdersToStateAction(1))}
        onRowSelect={(id: number) => dispatch(selectAccountAction(id))}
        onRowDeselect={(id: number) => dispatch(deselectAccountAction(id))}
        onRowDelete={(row: Table.TemplateAccountRow) => dispatch(removeAccountAction(row.id))}
        onRowUpdate={(payload: Table.RowChange<Table.TemplateAccountRow>) => dispatch(updateAccountAction(payload))}
        onRowBulkUpdate={(changes: Table.RowChange<Table.TemplateAccountRow>[]) =>
          dispatch(bulkUpdateTemplateAccountsAction(changes))
        }
        onRowExpand={(id: number) => history.push(`/templates/${templateId}/accounts/${id}`)}
        groupParams={{
          onDeleteGroup: (group: Model.TemplateGroup) => dispatch(deleteGroupAction(group.id)),
          onRowRemoveFromGroup: (row: Table.TemplateAccountRow) => dispatch(removeAccountFromGroupAction(row.id)),
          onGroupRows: (rows: Table.TemplateAccountRow[]) =>
            setGroupAccounts(map(rows, (row: Table.TemplateAccountRow) => row.id)),
          onEditGroup: (group: Model.TemplateGroup) => setGroupToEdit(group)
        }}
        onSelectAll={() => dispatch(selectAllAccountsAction(null))}
        tableTotals={{
          estimated: !isNil(templateDetail) && !isNil(templateDetail.estimated) ? templateDetail.estimated : 0.0
        }}
        bodyColumns={[
          {
            field: "description",
            headerName: "Category Description",
            flex: 100
          }
        ]}
        calculatedColumns={[
          {
            field: "estimated",
            headerName: "Estimated"
          }
        ]}
      />
      {!isNil(groupAccounts) && !isNil(templateId) && (
        <CreateTemplateAccountGroupModal
          templateId={templateId}
          accounts={groupAccounts}
          open={true}
          onSuccess={(group: Model.TemplateGroup) => {
            setGroupAccounts(undefined);
            dispatch(addGroupToStateAction(group));
          }}
          onCancel={() => setGroupAccounts(undefined)}
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

export default AccountsBudgetTable;
