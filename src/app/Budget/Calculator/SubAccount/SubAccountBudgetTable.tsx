import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { isNil, includes, map } from "lodash";
import { createSelector } from "reselect";
import classNames from "classnames";

import { ColDef, ColSpanParams } from "ag-grid-community";

import { CreateSubAccountGroupModal } from "components/modals";
import { simpleDeepEqualSelector, simpleShallowEqualSelector } from "store/selectors";
import { floatValueSetter, integerValueSetter } from "util/table";

import BudgetTable from "../../BudgetTable";
import { selectBudgetId } from "../../selectors";
import {
  setSubAccountsSearchAction,
  selectSubAccountAction,
  addPlaceholdersAction,
  deselectSubAccountAction,
  removeSubAccountAction,
  updateSubAccountAction,
  selectAllSubAccountsAction,
  deleteGroupAction,
  addGroupToStateAction
} from "./actions";

const selectTableData = simpleDeepEqualSelector(
  (state: Redux.IApplicationStore) => state.calculator.subaccount.subaccounts.table
);
const selectTableSearch = simpleShallowEqualSelector(
  (state: Redux.IApplicationStore) => state.calculator.subaccount.subaccounts.search
);
const selectSaving = createSelector(
  (state: Redux.IApplicationStore) => state.calculator.subaccount.subaccounts.deleting,
  (state: Redux.IApplicationStore) => state.calculator.subaccount.subaccounts.updating,
  (state: Redux.IApplicationStore) => state.calculator.subaccount.subaccounts.creating,
  (deleting: number[], updating: number[], creating: boolean) =>
    deleting.length !== 0 || updating.length !== 0 || creating === true
);
const selectSubAccountDetail = simpleDeepEqualSelector(
  (state: Redux.IApplicationStore) => state.calculator.subaccount.detail.data
);

interface SubAccountBudgetTableProps {
  subaccountId: number;
}

const SubAccountBudgetTable = ({ subaccountId }: SubAccountBudgetTableProps): JSX.Element => {
  const [groupSubAccounts, setGroupSubAccounts] = useState<number[] | undefined>(undefined);

  const dispatch = useDispatch();
  const history = useHistory();
  const budgetId = useSelector(selectBudgetId);
  const table = useSelector(selectTableData);
  const search = useSelector(selectTableSearch);
  const saving = useSelector(selectSaving);
  const subaccountDetail = useSelector(selectSubAccountDetail);

  return (
    <React.Fragment>
      <BudgetTable<Table.SubAccountRow, INestedGroup, ISimpleSubAccount>
        identifierField={"identifier"}
        identifierFieldHeader={"Account"}
        table={table}
        isCellEditable={(row: Table.SubAccountRow, colDef: ColDef) => {
          if (includes(["estimated", "actual", "variance", "unit"], colDef.field)) {
            return false;
          } else if (includes(["identifier", "description", "name"], colDef.field)) {
            return true;
          } else {
            return row.meta.children.length === 0;
          }
        }}
        highlightNonEditableCell={(row: Table.SubAccountRow, colDef: ColDef) => {
          return !includes(["quantity", "multiplier", "rate", "unit"], colDef.field);
        }}
        search={search}
        onSearch={(value: string) => dispatch(setSubAccountsSearchAction(value))}
        saving={saving}
        rowRefreshRequired={(existing: Table.SubAccountRow, row: Table.SubAccountRow) => existing.unit !== row.unit}
        onRowAdd={() => dispatch(addPlaceholdersAction(1))}
        onRowSelect={(id: number) => dispatch(selectSubAccountAction(id))}
        onRowDeselect={(id: number) => dispatch(deselectSubAccountAction(id))}
        onRowDelete={(row: Table.SubAccountRow) => dispatch(removeSubAccountAction(row.id))}
        onRowUpdate={(payload: Table.RowChange) => dispatch(updateSubAccountAction(payload))}
        onRowExpand={(id: number) => history.push(`/budgets/${budgetId}/subaccounts/${id}`)}
        groupParams={{
          onDeleteGroup: (group: INestedGroup) => dispatch(deleteGroupAction(group.id)),
          onGroupRows: (rows: Table.SubAccountRow[]) =>
            setGroupSubAccounts(map(rows, (row: Table.SubAccountRow) => row.id))
        }}
        onSelectAll={() => dispatch(selectAllSubAccountsAction())}
        totals={{
          estimated: !isNil(subaccountDetail) && !isNil(subaccountDetail.estimated) ? subaccountDetail.estimated : 0.0,
          variance: !isNil(subaccountDetail) && !isNil(subaccountDetail.variance) ? subaccountDetail.variance : 0.0,
          actual: !isNil(subaccountDetail) && !isNil(subaccountDetail.actual) ? subaccountDetail.actual : 0.0
        }}
        bodyColumns={[
          {
            field: "description",
            headerName: "Category Description",
            flex: 100,
            colSpan: (params: ColSpanParams) => {
              const row: Table.SubAccountRow = params.data;
              if (!isNil(params.data.meta) && !isNil(params.data.meta.children)) {
                return row.meta.children.length !== 0 ? 6 : 1;
              }
              return 1;
            }
          },
          {
            field: "name",
            headerName: "Name",
            width: 15
          },
          {
            field: "quantity",
            headerName: "Quantity",
            width: 10,
            cellStyle: { textAlign: "right" },
            valueSetter: integerValueSetter("quantity")
          },
          {
            field: "unit",
            headerName: "Unit",
            cellClass: classNames("cell--centered", "cell--not-editable-bordered"),
            cellRenderer: "UnitCell",
            width: 20,
            cellRendererParams: {
              onChange: (unit: Unit, row: Table.SubAccountRow) =>
                dispatch(
                  updateSubAccountAction({
                    id: row.id,
                    data: {
                      unit: {
                        oldValue: row.unit,
                        newValue: unit
                      }
                    }
                  })
                )
            }
          },
          {
            field: "multiplier",
            headerName: "X",
            width: 10,
            cellStyle: { textAlign: "right" },
            valueSetter: floatValueSetter("multiplier")
          },
          {
            field: "rate",
            headerName: "Rate",
            width: 10,
            cellStyle: { textAlign: "right" },
            valueSetter: floatValueSetter("rate")
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
    </React.Fragment>
  );
};

export default SubAccountBudgetTable;
