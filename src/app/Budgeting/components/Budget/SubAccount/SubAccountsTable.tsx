import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { isNil, map } from "lodash";
import { createSelector } from "reselect";

import { CreateSubAccountGroupModal, EditGroupModal } from "components/modals";
import { simpleDeepEqualSelector, simpleShallowEqualSelector } from "store/selectors";

import BudgetSubAccountsTable from "../SubAccountsTable";
import { selectBudgetId } from "../../../store/selectors";
import {
  setSubAccountsSearchAction,
  selectSubAccountAction,
  deselectSubAccountAction,
  removeSubAccountAction,
  updateSubAccountAction,
  selectAllSubAccountsAction,
  deleteGroupAction,
  addGroupToStateAction,
  removeSubAccountFromGroupAction,
  bulkUpdateSubAccountAction,
  updateGroupInStateAction,
  bulkCreateSubAccountsAction
} from "../../../store/actions/budget/subAccount";

const selectGroups = simpleDeepEqualSelector(
  (state: Redux.ApplicationStore) => state.budget.subaccount.subaccounts.groups.data
);
const selectSelectedRows = simpleDeepEqualSelector(
  (state: Redux.ApplicationStore) => state.budget.subaccount.subaccounts.selected
);
const selectSubAccounts = simpleDeepEqualSelector(
  (state: Redux.ApplicationStore) => state.budget.subaccount.subaccounts.data
);
const selectTableSearch = simpleShallowEqualSelector(
  (state: Redux.ApplicationStore) => state.budget.subaccount.subaccounts.search
);
const selectSaving = createSelector(
  (state: Redux.ApplicationStore) => state.budget.subaccount.subaccounts.deleting,
  (state: Redux.ApplicationStore) => state.budget.subaccount.subaccounts.updating,
  (state: Redux.ApplicationStore) => state.budget.subaccount.subaccounts.creating,
  (deleting: Redux.ModelListActionInstance[], updating: Redux.ModelListActionInstance[], creating: boolean) =>
    deleting.length !== 0 || updating.length !== 0 || creating === true
);
const selectSubAccountDetail = simpleDeepEqualSelector(
  (state: Redux.ApplicationStore) => state.budget.subaccount.detail.data
);
const selectReadyToRender = createSelector(
  (state: Redux.ApplicationStore) => state.budget.subaccount.subaccounts.responseWasReceived,
  (state: Redux.ApplicationStore) => state.budget.subaccount.subaccounts.groups.responseWasReceived,
  (accountsResponseReceived: boolean, groupsResponseReceived: boolean) =>
    accountsResponseReceived === true && groupsResponseReceived === true
);

interface SubAccountsTableProps {
  subaccountId: number;
}

const SubAccountsTable = ({ subaccountId }: SubAccountsTableProps): JSX.Element => {
  const [groupSubAccounts, setGroupSubAccounts] = useState<number[] | undefined>(undefined);
  const [groupToEdit, setGroupToEdit] = useState<Model.BudgetGroup | undefined>(undefined);

  const dispatch = useDispatch();
  const history = useHistory();
  const budgetId = useSelector(selectBudgetId);
  const data = useSelector(selectSubAccounts);
  const selected = useSelector(selectSelectedRows);
  const search = useSelector(selectTableSearch);
  const saving = useSelector(selectSaving);
  const subaccountDetail = useSelector(selectSubAccountDetail);
  const groups = useSelector(selectGroups);
  const readyToRender = useSelector(selectReadyToRender);

  return (
    <React.Fragment>
      <BudgetSubAccountsTable
        data={data}
        groups={groups}
        selected={selected}
        renderFlag={readyToRender}
        tableFooterIdentifierValue={
          !isNil(subaccountDetail) && !isNil(subaccountDetail.description)
            ? `${subaccountDetail.description} Total`
            : "Sub Account Total"
        }
        search={search}
        onSearch={(value: string) => dispatch(setSubAccountsSearchAction(value))}
        saving={saving}
        onRowAdd={() => dispatch(bulkCreateSubAccountsAction(1))}
        onRowSelect={(id: number) => dispatch(selectSubAccountAction(id))}
        onRowDeselect={(id: number) => dispatch(deselectSubAccountAction(id))}
        onRowDelete={(row: Table.BudgetSubAccountRow) => dispatch(removeSubAccountAction(row.id))}
        onRowUpdate={(payload: Table.RowChange<Table.BudgetSubAccountRow>) => dispatch(updateSubAccountAction(payload))}
        onRowBulkUpdate={(changes: Table.RowChange<Table.BudgetSubAccountRow>[]) =>
          dispatch(bulkUpdateSubAccountAction(changes))
        }
        onRowExpand={(id: number) => history.push(`/budgets/${budgetId}/subaccounts/${id}`)}
        onBack={() => {
          if (!isNil(subaccountDetail)) {
            const ancestor = subaccountDetail.ancestors[subaccountDetail.ancestors.length - 1];
            if (ancestor.type === "subaccount") {
              history.push(`/budgets/${budgetId}/subaccounts/${ancestor.id}`);
            } else {
              history.push(`/budgets/${budgetId}/accounts/${ancestor.id}`);
            }
          }
        }}
        cookies={!isNil(subaccountDetail) ? { ordering: `subaccount-${subaccountDetail.id}-table-ordering` } : {}}
        onDeleteGroup={(group: Model.BudgetGroup) => dispatch(deleteGroupAction(group.id))}
        onRowRemoveFromGroup={(row: Table.BudgetSubAccountRow) => dispatch(removeSubAccountFromGroupAction(row.id))}
        onGroupRows={(rows: Table.BudgetSubAccountRow[]) =>
          setGroupSubAccounts(map(rows, (row: Table.BudgetSubAccountRow) => row.id))
        }
        onEditGroup={(group: Model.BudgetGroup) => setGroupToEdit(group)}
        onSelectAll={() => dispatch(selectAllSubAccountsAction(null))}
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
