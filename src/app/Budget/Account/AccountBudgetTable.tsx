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
  addPlaceholdersToStateAction,
  deselectSubAccountAction,
  removeSubAccountAction,
  selectSubAccountAction,
  setSubAccountsSearchAction,
  updateSubAccountAction,
  selectAllSubAccountsAction,
  deleteGroupAction,
  addGroupToStateAction,
  removeSubAccountFromGroupAction,
  bulkUpdateAccountAction,
  updateGroupInStateAction
} from "../store/actions/account";

const selectGroups = simpleDeepEqualSelector(
  (state: Redux.IApplicationStore) => state.budget.account.subaccounts.groups.data
);
const selectSelectedRows = simpleDeepEqualSelector(
  (state: Redux.IApplicationStore) => state.budget.account.subaccounts.selected
);
const selectData = simpleDeepEqualSelector((state: Redux.IApplicationStore) => state.budget.account.subaccounts.data);
const selectTableSearch = simpleShallowEqualSelector(
  (state: Redux.IApplicationStore) => state.budget.account.subaccounts.search
);
const selectPlaceholders = simpleShallowEqualSelector(
  (state: Redux.IApplicationStore) => state.budget.account.subaccounts.placeholders
);
const selectSaving = createSelector(
  (state: Redux.IApplicationStore) => state.budget.account.subaccounts.deleting,
  (state: Redux.IApplicationStore) => state.budget.account.subaccounts.updating,
  (state: Redux.IApplicationStore) => state.budget.account.subaccounts.creating,
  (deleting: Redux.ModelListActionInstance[], updating: Redux.ModelListActionInstance[], creating: boolean) =>
    deleting.length !== 0 || updating.length !== 0 || creating === true
);
const selectAccountDetail = simpleDeepEqualSelector(
  (state: Redux.IApplicationStore) => state.budget.account.detail.data
);

interface AccountBudgetTableProps {
  accountId: number;
}

const AccountBudgetTable = ({ accountId }: AccountBudgetTableProps): JSX.Element => {
  const [groupSubAccounts, setGroupSubAccounts] = useState<number[] | undefined>(undefined);
  const [groupToEdit, setGroupToEdit] = useState<IGroup<ISimpleSubAccount> | undefined>(undefined);
  const dispatch = useDispatch();
  const history = useHistory();

  const budgetId = useSelector(selectBudgetId);
  const data = useSelector(selectData);
  const placeholders = useSelector(selectPlaceholders);
  const selected = useSelector(selectSelectedRows);
  const search = useSelector(selectTableSearch);
  const saving = useSelector(selectSaving);
  const accountDetail = useSelector(selectAccountDetail);
  const groups = useSelector(selectGroups);

  return (
    <React.Fragment>
      <SubAccountsTable
        data={data}
        groups={groups}
        placeholders={placeholders}
        selected={selected}
        tableFooterIdentifierValue={
          !isNil(accountDetail) && !isNil(accountDetail.description)
            ? `${accountDetail.description} Total`
            : "Account Total"
        }
        search={search}
        onSearch={(value: string) => dispatch(setSubAccountsSearchAction(value))}
        saving={saving}
        onRowAdd={() => dispatch(addPlaceholdersToStateAction(1))}
        onRowSelect={(id: number) => dispatch(selectSubAccountAction(id))}
        onRowDeselect={(id: number) => dispatch(deselectSubAccountAction(id))}
        onRowDelete={(row: Table.SubAccountRow) => dispatch(removeSubAccountAction(row.id))}
        onRowUpdate={(payload: Table.RowChange) => dispatch(updateSubAccountAction(payload))}
        onRowBulkUpdate={(changes: Table.RowChange[]) => dispatch(bulkUpdateAccountAction(changes))}
        onRowExpand={(id: number) => history.push(`/budgets/${budgetId}/subaccounts/${id}`)}
        onDeleteGroup={(group: IGroup<ISimpleSubAccount>) => dispatch(deleteGroupAction(group.id))}
        onRowRemoveFromGroup={(row: Table.SubAccountRow) => dispatch(removeSubAccountFromGroupAction(row.id))}
        onGroupRows={(rows: Table.SubAccountRow[]) =>
          setGroupSubAccounts(map(rows, (row: Table.SubAccountRow) => row.id))
        }
        onEditGroup={(group: IGroup<ISimpleSubAccount>) => setGroupToEdit(group)}
        onSelectAll={() => dispatch(selectAllSubAccountsAction(null))}
        tableTotals={{
          estimated: !isNil(accountDetail) && !isNil(accountDetail.estimated) ? accountDetail.estimated : 0.0,
          variance: !isNil(accountDetail) && !isNil(accountDetail.variance) ? accountDetail.variance : 0.0,
          actual: !isNil(accountDetail) && !isNil(accountDetail.actual) ? accountDetail.actual : 0.0
        }}
      />
      {!isNil(groupSubAccounts) && (
        <CreateSubAccountGroupModal
          accountId={accountId}
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

export default AccountBudgetTable;
