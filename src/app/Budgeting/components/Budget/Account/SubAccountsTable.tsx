import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { isNil, map } from "lodash";
import { createSelector } from "reselect";

import { CreateSubAccountGroupModal, EditGroupModal } from "components/modals";
import { simpleDeepEqualSelector, simpleShallowEqualSelector } from "store/selectors";

import BudgetSubAccountsTable from "../SubAccountsTable";
import { selectBudgetId, selectSubAccountUnits } from "../../../store/selectors";
import {
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
  updateGroupInStateAction,
  bulkCreateSubAccountsAction,
  addSubAccountToGroupAction
} from "../../../store/actions/budget/account";

const selectGroups = simpleDeepEqualSelector(
  (state: Redux.ApplicationStore) => state.budgeting.budget.account.subaccounts.groups.data
);
const selectSelectedRows = simpleDeepEqualSelector(
  (state: Redux.ApplicationStore) => state.budgeting.budget.account.subaccounts.selected
);
const selectData = simpleDeepEqualSelector(
  (state: Redux.ApplicationStore) => state.budgeting.budget.account.subaccounts.data
);
const selectTableSearch = simpleShallowEqualSelector(
  (state: Redux.ApplicationStore) => state.budgeting.budget.account.subaccounts.search
);
const selectSaving = createSelector(
  (state: Redux.ApplicationStore) => state.budgeting.budget.account.subaccounts.deleting,
  (state: Redux.ApplicationStore) => state.budgeting.budget.account.subaccounts.updating,
  (state: Redux.ApplicationStore) => state.budgeting.budget.account.subaccounts.creating,
  (deleting: Redux.ModelListActionInstance[], updating: Redux.ModelListActionInstance[], creating: boolean) =>
    deleting.length !== 0 || updating.length !== 0 || creating === true
);
const selectAccountDetail = simpleDeepEqualSelector(
  (state: Redux.ApplicationStore) => state.budgeting.budget.account.detail.data
);
const selectReadyToRender = createSelector(
  (state: Redux.ApplicationStore) => state.budgeting.budget.account.subaccounts.responseWasReceived,
  (state: Redux.ApplicationStore) => state.budgeting.budget.account.subaccounts.groups.responseWasReceived,
  (accountsResponseReceived: boolean, groupsResponseReceived: boolean) =>
    accountsResponseReceived === true && groupsResponseReceived === true
);

interface AccountBudgetTableProps {
  accountId: number;
}

const SubAccountsTable = ({ accountId }: AccountBudgetTableProps): JSX.Element => {
  const [groupSubAccounts, setGroupSubAccounts] = useState<number[] | undefined>(undefined);
  const [groupToEdit, setGroupToEdit] = useState<Model.BudgetGroup | undefined>(undefined);
  const dispatch = useDispatch();
  const history = useHistory();

  const budgetId = useSelector(selectBudgetId);
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
      <BudgetSubAccountsTable
        data={data}
        groups={groups}
        detail={accountDetail}
        selected={selected}
        renderFlag={readyToRender}
        subAccountUnits={subAccountUnits}
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
        onRowDelete={(row: Table.BudgetSubAccountRow) => dispatch(removeSubAccountAction(row.id))}
        onRowUpdate={(payload: Table.RowChange<Table.BudgetSubAccountRow>) => dispatch(updateSubAccountAction(payload))}
        onRowBulkUpdate={(changes: Table.RowChange<Table.BudgetSubAccountRow>[]) =>
          dispatch(bulkUpdateAccountAction(changes))
        }
        onRowExpand={(id: number) => history.push(`/budgets/${budgetId}/subaccounts/${id}`)}
        onBack={() => history.push(`/budgets/${budgetId}/accounts?row=${accountId}`)}
        onDeleteGroup={(group: Model.BudgetGroup) => dispatch(deleteGroupAction(group.id))}
        onRowRemoveFromGroup={(row: Table.BudgetSubAccountRow) => dispatch(removeSubAccountFromGroupAction(row.id))}
        onRowAddToGroup={(group: number, row: Table.BudgetSubAccountRow) =>
          dispatch(addSubAccountToGroupAction({ id: row.id, group }))
        }
        onGroupRows={(rows: Table.BudgetSubAccountRow[]) =>
          setGroupSubAccounts(map(rows, (row: Table.BudgetSubAccountRow) => row.id))
        }
        onEditGroup={(group: Model.BudgetGroup) => setGroupToEdit(group)}
        onSelectAll={() => dispatch(selectAllSubAccountsAction(null))}
      />
      {!isNil(groupSubAccounts) && (
        <CreateSubAccountGroupModal
          accountId={accountId}
          subaccounts={groupSubAccounts}
          open={true}
          onSuccess={(group: Model.BudgetGroup) => {
            setGroupSubAccounts(undefined);
            dispatch(addGroupToStateAction(group));
          }}
          onCancel={() => setGroupSubAccounts(undefined)}
        />
      )}
      {!isNil(groupToEdit) && (
        <EditGroupModal<Model.BudgetGroup>
          group={groupToEdit}
          open={true}
          onCancel={() => setGroupToEdit(undefined)}
          onSuccess={(group: Model.BudgetGroup) => {
            setGroupToEdit(undefined);
            dispatch(updateGroupInStateAction({ id: group.id, data: group }));
          }}
        />
      )}
    </React.Fragment>
  );
};

export default SubAccountsTable;
