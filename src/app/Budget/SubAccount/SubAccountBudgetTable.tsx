import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { isNil, map } from "lodash";
import { createSelector } from "reselect";

import { CreateSubAccountGroupModal, EditSubAccountGroupModal } from "components/modals";
import { simpleDeepEqualSelector, simpleShallowEqualSelector } from "store/selectors";

import SubAccountsTable from "../SubAccountsTable";
import { selectBudgetId } from "../store/selectors";
import {
  setSubAccountsSearchAction,
  selectSubAccountAction,
  addPlaceholdersToStateAction,
  deselectSubAccountAction,
  removeSubAccountAction,
  updateSubAccountAction,
  selectAllSubAccountsAction,
  deleteGroupAction,
  addGroupToStateAction,
  removeSubAccountFromGroupAction,
  bulkUpdateSubAccountAction,
  updateGroupInStateAction
} from "../store/actions/subAccount";

const selectGroups = simpleDeepEqualSelector(
  (state: Redux.IApplicationStore) => state.budget.subaccount.subaccounts.groups.data
);
const selectSelectedRows = simpleDeepEqualSelector(
  (state: Redux.IApplicationStore) => state.budget.subaccount.subaccounts.selected
);
const selectSubAccounts = simpleDeepEqualSelector(
  (state: Redux.IApplicationStore) => state.budget.subaccount.subaccounts.data
);
const selectTableSearch = simpleShallowEqualSelector(
  (state: Redux.IApplicationStore) => state.budget.subaccount.subaccounts.search
);
const selectPlaceholders = simpleShallowEqualSelector(
  (state: Redux.IApplicationStore) => state.budget.subaccount.subaccounts.placeholders
);
const selectSaving = createSelector(
  (state: Redux.IApplicationStore) => state.budget.subaccount.subaccounts.deleting,
  (state: Redux.IApplicationStore) => state.budget.subaccount.subaccounts.updating,
  (state: Redux.IApplicationStore) => state.budget.subaccount.subaccounts.creating,
  (deleting: number[], updating: number[], creating: boolean) =>
    deleting.length !== 0 || updating.length !== 0 || creating === true
);
const selectSubAccountDetail = simpleDeepEqualSelector(
  (state: Redux.IApplicationStore) => state.budget.subaccount.detail.data
);
const selectAncestors = simpleDeepEqualSelector((state: Redux.IApplicationStore) => state.budget.ancestors);

interface SubAccountBudgetTableProps {
  subaccountId: number;
}

const SubAccountBudgetTable = ({ subaccountId }: SubAccountBudgetTableProps): JSX.Element => {
  const [groupSubAccounts, setGroupSubAccounts] = useState<number[] | undefined>(undefined);
  const [groupToEdit, setGroupToEdit] = useState<IGroup<ISimpleSubAccount> | undefined>(undefined);

  const dispatch = useDispatch();
  const history = useHistory();
  const budgetId = useSelector(selectBudgetId);
  const data = useSelector(selectSubAccounts);
  const placeholders = useSelector(selectPlaceholders);
  const selected = useSelector(selectSelectedRows);
  const search = useSelector(selectTableSearch);
  const saving = useSelector(selectSaving);
  const subaccountDetail = useSelector(selectSubAccountDetail);
  const groups = useSelector(selectGroups);
  const ancestors = useSelector(selectAncestors);
  const ancestor = ancestors[ancestors.length - 2];

  return (
    <React.Fragment>
      <SubAccountsTable
        data={data}
        groups={groups}
        placeholders={placeholders}
        selected={selected}
        tableFooterIdentifierValue={
          !isNil(subaccountDetail) && !isNil(subaccountDetail.description)
            ? `${subaccountDetail.description} Total`
            : "Sub Account Total"
        }
        search={search}
        onSearch={(value: string) => dispatch(setSubAccountsSearchAction(value))}
        saving={saving}
        onRowAdd={() => dispatch(addPlaceholdersToStateAction(1))}
        onRowSelect={(id: number) => dispatch(selectSubAccountAction(id))}
        onRowDeselect={(id: number) => dispatch(deselectSubAccountAction(id))}
        onRowDelete={(row: Table.SubAccountRow) => dispatch(removeSubAccountAction(row.id))}
        onRowUpdate={(payload: Table.RowChange) => dispatch(updateSubAccountAction(payload))}
        onRowBulkUpdate={(changes: Table.RowChange[]) => dispatch(bulkUpdateSubAccountAction(changes))}
        onRowExpand={(id: number) => history.push(`/budgets/${budgetId}/subaccounts/${id}`)}
        onBack={() => history.push(`/budgets/${budgetId}/${ancestor.type}s/${ancestor.id}`)}
        onDeleteGroup={(group: IGroup<ISimpleSubAccount>) => dispatch(deleteGroupAction(group.id))}
        onRowRemoveFromGroup={(row: Table.SubAccountRow) => dispatch(removeSubAccountFromGroupAction(row.id))}
        onGroupRows={(rows: Table.SubAccountRow[]) =>
          setGroupSubAccounts(map(rows, (row: Table.SubAccountRow) => row.id))
        }
        onEditGroup={(group: IGroup<ISimpleSubAccount>) => setGroupToEdit(group)}
        onSelectAll={() => dispatch(selectAllSubAccountsAction())}
        tableTotals={{
          estimated: !isNil(subaccountDetail) && !isNil(subaccountDetail.estimated) ? subaccountDetail.estimated : 0.0,
          variance: !isNil(subaccountDetail) && !isNil(subaccountDetail.variance) ? subaccountDetail.variance : 0.0,
          actual: !isNil(subaccountDetail) && !isNil(subaccountDetail.actual) ? subaccountDetail.actual : 0.0
        }}
      />
      {!isNil(groupSubAccounts) && (
        <CreateSubAccountGroupModal
          subaccountId={subaccountId}
          subaccounts={groupSubAccounts}
          open={true}
          onSuccess={(group: IGroup<ISimpleSubAccount>) => {
            setGroupSubAccounts(undefined);
            dispatch(addGroupToStateAction(group));
          }}
          onCancel={() => setGroupSubAccounts(undefined)}
        />
      )}
      {!isNil(groupToEdit) && (
        <EditSubAccountGroupModal
          group={groupToEdit}
          open={true}
          onCancel={() => setGroupToEdit(undefined)}
          onSuccess={(group: IGroup<ISimpleSubAccount>) => {
            setGroupToEdit(undefined);
            dispatch(updateGroupInStateAction(group));
          }}
        />
      )}
    </React.Fragment>
  );
};

export default SubAccountBudgetTable;
