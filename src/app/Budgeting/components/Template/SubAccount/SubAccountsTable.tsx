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
  setSubAccountsSearchAction,
  selectSubAccountAction,
  deselectSubAccountAction,
  removeSubAccountAction,
  selectAllSubAccountsAction,
  deleteGroupAction,
  addGroupToStateAction,
  removeSubAccountFromGroupAction,
  tableChangedAction,
  updateGroupInStateAction,
  bulkCreateSubAccountsAction,
  addSubAccountToGroupAction
} from "../../../store/actions/template/subAccount";

const selectGroups = simpleDeepEqualSelector(
  (state: Redux.ApplicationStore) => state.budgeting.template.subaccount.subaccounts.groups.data
);
const selectSelectedRows = simpleDeepEqualSelector(
  (state: Redux.ApplicationStore) => state.budgeting.template.subaccount.subaccounts.selected
);
const selectSubAccounts = simpleDeepEqualSelector(
  (state: Redux.ApplicationStore) => state.budgeting.template.subaccount.subaccounts.data
);
const selectTableSearch = simpleShallowEqualSelector(
  (state: Redux.ApplicationStore) => state.budgeting.template.subaccount.subaccounts.search
);
const selectSaving = createSelector(
  (state: Redux.ApplicationStore) => state.budgeting.template.subaccount.subaccounts.deleting,
  (state: Redux.ApplicationStore) => state.budgeting.template.subaccount.subaccounts.updating,
  (state: Redux.ApplicationStore) => state.budgeting.template.subaccount.subaccounts.creating,
  (deleting: Redux.ModelListActionInstance[], updating: Redux.ModelListActionInstance[], creating: boolean) =>
    deleting.length !== 0 || updating.length !== 0 || creating === true
);
const selectSubAccountDetail = simpleDeepEqualSelector(
  (state: Redux.ApplicationStore) => state.budgeting.template.subaccount.detail.data
);
const selectReadyToRender = createSelector(
  (state: Redux.ApplicationStore) => state.budgeting.template.subaccount.subaccounts.responseWasReceived,
  (state: Redux.ApplicationStore) => state.budgeting.template.subaccount.subaccounts.groups.responseWasReceived,
  (accountsResponseReceived: boolean, groupsResponseReceived: boolean) =>
    accountsResponseReceived === true && groupsResponseReceived === true
);

interface SubAccountsTableProps {
  subaccountId: number;
}

const SubAccountsTable = ({ subaccountId }: SubAccountsTableProps): JSX.Element => {
  const [groupSubAccounts, setGroupSubAccounts] = useState<number[] | undefined>(undefined);
  const [groupToEdit, setGroupToEdit] = useState<Model.TemplateGroup | undefined>(undefined);

  const dispatch = useDispatch();
  const history = useHistory();
  const templateId = useSelector(selectTemplateId);
  const data = useSelector(selectSubAccounts);
  const selected = useSelector(selectSelectedRows);
  const search = useSelector(selectTableSearch);
  const saving = useSelector(selectSaving);
  const subaccountDetail = useSelector(selectSubAccountDetail);
  const groups = useSelector(selectGroups);
  const readyToRender = useSelector(selectReadyToRender);
  const subAccountUnits = useSelector(selectSubAccountUnits);

  return (
    <React.Fragment>
      <TemplateSubAccountsTable
        data={data}
        groups={groups}
        selected={selected}
        renderFlag={readyToRender}
        subAccountUnits={subAccountUnits}
        // Right now, the SubAccount recursion only goes 1 layer deep.
        // Account -> SubAccount -> Detail (Recrusive SubAccount).
        onRowExpand={null}
        detail={subaccountDetail}
        tableFooterIdentifierValue={
          !isNil(subaccountDetail) && !isNil(subaccountDetail.description)
            ? `${subaccountDetail.description} Total`
            : "Sub Account Total"
        }
        search={search}
        onSearch={(value: string) => dispatch(setSubAccountsSearchAction(value))}
        saving={saving}
        categoryName={"Detail"}
        identifierFieldHeader={"Line"}
        onRowAdd={() => dispatch(bulkCreateSubAccountsAction(1))}
        onRowSelect={(id: number) => dispatch(selectSubAccountAction(id))}
        onRowDeselect={(id: number) => dispatch(deselectSubAccountAction(id))}
        onRowDelete={(row: Table.TemplateSubAccountRow) => dispatch(removeSubAccountAction(row.id))}
        onTableChange={(payload: Table.Change<Table.TemplateSubAccountRow>) => dispatch(tableChangedAction(payload))}
        onBack={() => {
          if (!isNil(subaccountDetail)) {
            const ancestor = subaccountDetail.ancestors[subaccountDetail.ancestors.length - 1];
            if (ancestor.type === "subaccount") {
              history.push(`/templates/${templateId}/subaccounts/${ancestor.id}?row=${subaccountId}`);
            } else {
              history.push(`/templates/${templateId}/accounts/${ancestor.id}?row=${subaccountId}`);
            }
          }
        }}
        cookies={!isNil(subaccountDetail) ? { ordering: `subaccount-${subaccountDetail.id}-table-ordering` } : {}}
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
        <CreateSubAccountGroupModal<Model.TemplateGroup>
          subaccountId={subaccountId}
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
