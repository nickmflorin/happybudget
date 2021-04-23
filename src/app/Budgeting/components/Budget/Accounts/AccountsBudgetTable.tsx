import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { isNil } from "lodash";
import { createSelector } from "reselect";
import { map } from "lodash";

import { CreateBudgetAccountGroupModal, EditGroupModal } from "components/modals";
import { simpleDeepEqualSelector, simpleShallowEqualSelector } from "store/selectors";
import { BudgetAccountRowManager } from "lib/tabling/managers";

import BudgetTable from "../../BudgetTable";
import { selectBudgetId, selectBudgetDetail } from "../../../store/selectors";
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
  bulkUpdateBudgetAccountsAction,
  updateGroupInStateAction
} from "../../../store/actions/budget/accounts";

const selectGroups = simpleDeepEqualSelector((state: Redux.ApplicationStore) => state.budget.accounts.groups.data);
const selectSelectedRows = simpleDeepEqualSelector((state: Redux.ApplicationStore) => state.budget.accounts.selected);
const selectData = simpleDeepEqualSelector((state: Redux.ApplicationStore) => state.budget.accounts.data);
const selectTableSearch = simpleShallowEqualSelector((state: Redux.ApplicationStore) => state.budget.accounts.search);
const selectPlaceholders = simpleShallowEqualSelector(
  (state: Redux.ApplicationStore) => state.budget.accounts.placeholders
);
const selectSaving = createSelector(
  (state: Redux.ApplicationStore) => state.budget.accounts.deleting,
  (state: Redux.ApplicationStore) => state.budget.accounts.updating,
  (state: Redux.ApplicationStore) => state.budget.accounts.creating,
  (deleting: Redux.ModelListActionInstance[], updating: Redux.ModelListActionInstance[], creating: boolean) =>
    deleting.length !== 0 || updating.length !== 0 || creating === true
);
const selectReadyToRender = createSelector(
  (state: Redux.ApplicationStore) => state.budget.accounts.responseWasReceived,
  (state: Redux.ApplicationStore) => state.budget.accounts.groups.responseWasReceived,
  (accountsResponseReceived: boolean, groupsResponseReceived: boolean) =>
    accountsResponseReceived === true && groupsResponseReceived === true
);

const AccountsBudgetTable = (): JSX.Element => {
  const [groupAccounts, setGroupAccounts] = useState<number[] | undefined>(undefined);
  const [groupToEdit, setGroupToEdit] = useState<Model.BudgetGroup | undefined>(undefined);

  const dispatch = useDispatch();
  const history = useHistory();

  const budgetId = useSelector(selectBudgetId);
  const data = useSelector(selectData);
  const placeholders = useSelector(selectPlaceholders);
  const selected = useSelector(selectSelectedRows);
  const search = useSelector(selectTableSearch);
  const saving = useSelector(selectSaving);
  const budgetDetail = useSelector(selectBudgetDetail);
  const groups = useSelector(selectGroups);
  const readyToRender = useSelector(selectReadyToRender);

  return (
    <React.Fragment>
      <BudgetTable<Table.BudgetAccountRow, Model.BudgetAccount, Model.BudgetGroup, Http.BudgetAccountPayload>
        data={data}
        groups={groups}
        placeholders={placeholders}
        manager={BudgetAccountRowManager}
        selected={selected}
        renderFlag={readyToRender}
        identifierField={"identifier"}
        identifierFieldHeader={"Account"}
        sizeColumnsToFit={false}
        tableFooterIdentifierValue={!isNil(budgetDetail) ? `${budgetDetail.name} Total` : "Total"}
        search={search}
        onSearch={(value: string) => dispatch(setAccountsSearchAction(value))}
        saving={saving}
        onRowAdd={() => dispatch(addPlaceholdersToStateAction(1))}
        onRowSelect={(id: number) => dispatch(selectAccountAction(id))}
        onRowDeselect={(id: number) => dispatch(deselectAccountAction(id))}
        onRowDelete={(row: Table.BudgetAccountRow) => dispatch(removeAccountAction(row.id))}
        onRowUpdate={(payload: Table.RowChange<Table.BudgetAccountRow>) => dispatch(updateAccountAction(payload))}
        onRowBulkUpdate={(changes: Table.RowChange<Table.BudgetAccountRow>[]) =>
          dispatch(bulkUpdateBudgetAccountsAction(changes))
        }
        onRowExpand={(id: number) => history.push(`/budgets/${budgetId}/accounts/${id}`)}
        groupParams={{
          onDeleteGroup: (group: Model.BudgetGroup) => dispatch(deleteGroupAction(group.id)),
          onRowRemoveFromGroup: (row: Table.BudgetAccountRow) => dispatch(removeAccountFromGroupAction(row.id)),
          onGroupRows: (rows: Table.BudgetAccountRow[]) =>
            setGroupAccounts(map(rows, (row: Table.BudgetAccountRow) => row.id)),
          onEditGroup: (group: Model.BudgetGroup) => setGroupToEdit(group)
        }}
        onSelectAll={() => dispatch(selectAllAccountsAction(null))}
        tableTotals={{
          estimated: !isNil(budgetDetail) && !isNil(budgetDetail.estimated) ? budgetDetail.estimated : 0.0,
          variance: !isNil(budgetDetail) && !isNil(budgetDetail.variance) ? budgetDetail.variance : 0.0,
          actual: !isNil(budgetDetail) && !isNil(budgetDetail.actual) ? budgetDetail.actual : 0.0
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
          },
          {
            field: "actual",
            headerName: "Actual"
          },
          {
            field: "variance",
            headerName: "Variance"
          }
        ]}
      />
      {!isNil(groupAccounts) && !isNil(budgetId) && (
        <CreateBudgetAccountGroupModal
          budgetId={budgetId}
          accounts={groupAccounts}
          open={true}
          onSuccess={(group: Model.BudgetGroup) => {
            setGroupAccounts(undefined);
            dispatch(addGroupToStateAction(group));
          }}
          onCancel={() => setGroupAccounts(undefined)}
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

export default AccountsBudgetTable;
