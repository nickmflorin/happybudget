import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { isNil } from "lodash";
import { createSelector } from "reselect";
import { map } from "lodash";

import * as models from "lib/model";
import { CreateBudgetAccountGroupModal, EditGroupModal } from "components/modals";
import { simpleDeepEqualSelector, simpleShallowEqualSelector } from "store/selectors";

import { selectBudgetId, selectBudgetDetail } from "../../../store/selectors";
import {
  setAccountsSearchAction,
  deselectAccountAction,
  selectAccountAction,
  removeAccountAction,
  selectAllAccountsAction,
  addGroupToStateAction,
  deleteGroupAction,
  removeAccountFromGroupAction,
  tableChangedAction,
  updateGroupInStateAction,
  bulkCreateAccountsAction,
  addAccountToGroupAction
} from "../../../store/actions/budget/accounts";
import { GenericAccountsTable } from "../../Generic";

const selectGroups = simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budgeting.budget.accounts.groups.data
);
const selectSelectedRows = simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budgeting.budget.accounts.selected
);
const selectData = simpleDeepEqualSelector((state: Modules.ApplicationStore) => state.budgeting.budget.accounts.data);
const selectTableSearch = simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budgeting.budget.accounts.search
);

const selectSaving = createSelector(
  (state: Modules.ApplicationStore) => state.budgeting.budget.accounts.deleting,
  (state: Modules.ApplicationStore) => state.budgeting.budget.accounts.updating,
  (state: Modules.ApplicationStore) => state.budgeting.budget.accounts.creating,
  (deleting: Redux.ModelListActionInstance[], updating: Redux.ModelListActionInstance[], creating: boolean) =>
    deleting.length !== 0 || updating.length !== 0 || creating === true
);
const selectReadyToRender = createSelector(
  (state: Modules.ApplicationStore) => state.budgeting.budget.accounts.responseWasReceived,
  (state: Modules.ApplicationStore) => state.budgeting.budget.accounts.groups.responseWasReceived,
  (accountsResponseReceived: boolean, groupsResponseReceived: boolean) =>
    accountsResponseReceived === true && groupsResponseReceived === true
);

const AccountsTable = (): JSX.Element => {
  const [groupAccounts, setGroupAccounts] = useState<number[] | undefined>(undefined);
  const [groupToEdit, setGroupToEdit] = useState<Model.BudgetGroup | undefined>(undefined);

  const dispatch = useDispatch();
  const history = useHistory();

  const budgetId = useSelector(selectBudgetId);
  const data = useSelector(selectData);
  const selected = useSelector(selectSelectedRows);
  const search = useSelector(selectTableSearch);
  const saving = useSelector(selectSaving);
  const budgetDetail = useSelector(selectBudgetDetail);
  const groups = useSelector(selectGroups);
  const readyToRender = useSelector(selectReadyToRender);

  return (
    <React.Fragment>
      <GenericAccountsTable<
        BudgetTable.BudgetAccountRow,
        Model.BudgetAccount,
        Model.BudgetGroup,
        Http.BudgetAccountPayload
      >
        data={data}
        groups={groups}
        manager={models.BudgetAccountRowManager}
        selected={selected}
        renderFlag={readyToRender}
        detail={budgetDetail}
        search={search}
        onSearch={(value: string) => dispatch(setAccountsSearchAction(value))}
        saving={saving}
        onRowAdd={(payload: Table.RowAddPayload<BudgetTable.BudgetAccountRow>) =>
          dispatch(bulkCreateAccountsAction(payload))
        }
        onRowSelect={(id: number) => dispatch(selectAccountAction(id))}
        onRowDeselect={(id: number) => dispatch(deselectAccountAction(id))}
        onRowDelete={(row: BudgetTable.BudgetAccountRow) => dispatch(removeAccountAction(row.id))}
        onTableChange={(payload: Table.Change<BudgetTable.BudgetAccountRow>) => dispatch(tableChangedAction(payload))}
        onRowExpand={(id: number) => history.push(`/budgets/${budgetId}/accounts/${id}`)}
        onDeleteGroup={(group: Model.BudgetGroup) => dispatch(deleteGroupAction(group.id))}
        onRowRemoveFromGroup={(row: BudgetTable.BudgetAccountRow) => dispatch(removeAccountFromGroupAction(row.id))}
        onRowAddToGroup={(group: number, row: BudgetTable.BudgetAccountRow) =>
          dispatch(addAccountToGroupAction({ id: row.id, group }))
        }
        onGroupRows={(rows: BudgetTable.BudgetAccountRow[]) =>
          setGroupAccounts(map(rows, (row: BudgetTable.BudgetAccountRow) => row.id))
        }
        onEditGroup={(group: Model.BudgetGroup) => setGroupToEdit(group)}
        onSelectAll={() => dispatch(selectAllAccountsAction(null))}
        columns={[
          {
            field: "estimated",
            headerName: "Estimated",
            isCalculated: true,
            tableTotal: !isNil(budgetDetail) && !isNil(budgetDetail.estimated) ? budgetDetail.estimated : 0.0,
            type: "sum"
          },
          {
            field: "actual",
            headerName: "Actual",
            isCalculated: true,
            tableTotal: !isNil(budgetDetail) && !isNil(budgetDetail.actual) ? budgetDetail.actual : 0.0,
            type: "sum"
          },
          {
            field: "variance",
            headerName: "Variance",
            isCalculated: true,
            tableTotal: !isNil(budgetDetail) && !isNil(budgetDetail.variance) ? budgetDetail.variance : 0.0,
            type: "sum"
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

export default AccountsTable;
