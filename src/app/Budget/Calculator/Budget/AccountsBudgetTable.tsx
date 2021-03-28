import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { isNil, includes } from "lodash";
import { ColDef } from "ag-grid-community";
import { createSelector } from "reselect";
import { map } from "lodash";

import { CreateAccountGroupModal } from "components/modals";
import { simpleDeepEqualSelector, simpleShallowEqualSelector } from "store/selectors";
import { AccountMapping } from "model/tableMappings";

import BudgetTable from "../../BudgetTable";
import { selectBudgetId, selectBudgetDetail } from "../../selectors";
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
  removeAccountFromGroupAction
} from "./actions";

const selectSelectedRows = simpleDeepEqualSelector(
  (state: Redux.IApplicationStore) => state.calculator.budget.accounts.selected
);
const selectAccounts = simpleDeepEqualSelector(
  (state: Redux.IApplicationStore) => state.calculator.budget.accounts.data
);
const selectTableSearch = simpleShallowEqualSelector(
  (state: Redux.IApplicationStore) => state.calculator.budget.accounts.search
);
const selectPlaceholders = simpleShallowEqualSelector(
  (state: Redux.IApplicationStore) => state.calculator.budget.accounts.placeholders
);
const selectSaving = createSelector(
  (state: Redux.IApplicationStore) => state.calculator.budget.accounts.deleting,
  (state: Redux.IApplicationStore) => state.calculator.budget.accounts.updating,
  (state: Redux.IApplicationStore) => state.calculator.budget.accounts.creating,
  (deleting: number[], updating: number[], creating: boolean) =>
    deleting.length !== 0 || updating.length !== 0 || creating === true
);

const AccountsBudgetTable = (): JSX.Element => {
  const [groupAccounts, setGroupAccounts] = useState<number[] | undefined>(undefined);

  const dispatch = useDispatch();
  const history = useHistory();

  const budgetId = useSelector(selectBudgetId);
  const data = useSelector(selectAccounts);
  const placeholders = useSelector(selectPlaceholders);
  const selected = useSelector(selectSelectedRows);
  const search = useSelector(selectTableSearch);
  const saving = useSelector(selectSaving);
  const budgetDetail = useSelector(selectBudgetDetail);

  return (
    <React.Fragment>
      <BudgetTable<Table.AccountRow, IAccount, Http.IAccountPayload, INestedGroup, ISimpleSubAccount>
        data={data}
        placeholders={placeholders}
        mapping={AccountMapping}
        selected={selected}
        identifierField={"identifier"}
        identifierFieldHeader={"Account"}
        // TODO: It might make more sense to just treat all of the cells corresponding
        // to the calculatedColumns as non-editable.
        isCellEditable={(row: Table.AccountRow, colDef: ColDef) => {
          if (includes(["estimated", "actual", "variance"], colDef.field)) {
            return false;
          }
          return true;
        }}
        search={search}
        onSearch={(value: string) => dispatch(setAccountsSearchAction(value))}
        saving={saving}
        onRowAdd={() => dispatch(addPlaceholdersToStateAction(1))}
        onRowSelect={(id: number) => dispatch(selectAccountAction(id))}
        onRowDeselect={(id: number) => dispatch(deselectAccountAction(id))}
        onRowDelete={(row: Table.AccountRow) => dispatch(removeAccountAction(row.id))}
        onRowUpdate={(payload: Table.RowChange) => dispatch(updateAccountAction(payload))}
        onRowExpand={(id: number) => history.push(`/budgets/${budgetId}/accounts/${id}`)}
        groupParams={{
          onDeleteGroup: (group: INestedGroup) => dispatch(deleteGroupAction(group.id)),
          onRowRemoveFromGroup: (row: Table.AccountRow) => dispatch(removeAccountFromGroupAction(row.id)),
          onGroupRows: (rows: Table.AccountRow[]) => setGroupAccounts(map(rows, (row: Table.AccountRow) => row.id))
        }}
        onSelectAll={() => dispatch(selectAllAccountsAction())}
        totals={{
          estimated: !isNil(budgetDetail) && !isNil(budgetDetail.estimated) ? budgetDetail.estimated : 0.0,
          variance: !isNil(budgetDetail) && !isNil(budgetDetail.variance) ? budgetDetail.variance : 0.0,
          actual: !isNil(budgetDetail) && !isNil(budgetDetail.actual) ? budgetDetail.actual : 0.0
        }}
        bodyColumns={[
          {
            field: "description",
            headerName: "Category Description"
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
        <CreateAccountGroupModal
          budgetId={budgetId}
          accounts={groupAccounts}
          open={true}
          onSuccess={(group: IGroup<ISimpleAccount>) => {
            setGroupAccounts(undefined);
            dispatch(addGroupToStateAction(group));
          }}
          onCancel={() => setGroupAccounts(undefined)}
        />
      )}
    </React.Fragment>
  );
};

export default AccountsBudgetTable;
