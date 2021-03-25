import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { isNil, includes } from "lodash";
import { createSelector } from "reselect";
import { ColDef, ColSpanParams } from "ag-grid-community";

import BudgetTable from "lib/BudgetTable";
import { simpleDeepEqualSelector, simpleShallowEqualSelector } from "store/selectors";
import { formatCurrencyWithoutDollarSign } from "util/string";
import { floatValueSetter, integerValueSetter } from "util/table";

import {
  setSubAccountSubAccountsSearchAction,
  selectSubAccountSubAccountsTableRowAction,
  addSubAccountSubAccountsTablePlaceholdersAction,
  deselectSubAccountSubAccountsTableRowAction,
  removeSubAccountSubAccountAction,
  updateSubAccountSubAccountAction,
  selectAllSubAccountSubAccountsTableRowsAction
} from "../actions";
import { selectBudgetId } from "../selectors";

const selectTableData = simpleDeepEqualSelector(
  (state: Redux.IApplicationStore) => state.calculator.subaccount.subaccounts.table.data
);
const selectTableSearch = simpleShallowEqualSelector(
  (state: Redux.IApplicationStore) => state.calculator.subaccount.subaccounts.table.search
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

const SubAccountBudgetTable = (): JSX.Element => {
  const dispatch = useDispatch();
  const history = useHistory();
  const budgetId = useSelector(selectBudgetId);
  const table = useSelector(selectTableData);
  const search = useSelector(selectTableSearch);
  const saving = useSelector(selectSaving);
  const subaccountDetail = useSelector(selectSubAccountDetail);

  return (
    <BudgetTable<Table.SubAccountRow>
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
      onSearch={(value: string) => dispatch(setSubAccountSubAccountsSearchAction(value))}
      saving={saving}
      rowRefreshRequired={(existing: Table.SubAccountRow, row: Table.SubAccountRow) => existing.unit !== row.unit}
      onRowAdd={() => dispatch(addSubAccountSubAccountsTablePlaceholdersAction(1))}
      onRowSelect={(id: number) => dispatch(selectSubAccountSubAccountsTableRowAction(id))}
      onRowDeselect={(id: number) => dispatch(deselectSubAccountSubAccountsTableRowAction(id))}
      onRowDelete={(row: Table.SubAccountRow) => dispatch(removeSubAccountSubAccountAction(row.id))}
      onRowUpdate={(payload: Table.RowChange) => dispatch(updateSubAccountSubAccountAction(payload))}
      onRowExpand={(id: number) => history.push(`/budgets/${budgetId}/subaccounts/${id}`)}
      onSelectAll={() => dispatch(selectAllSubAccountSubAccountsTableRowsAction())}
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
            // Not totally sure why this conditional is necessary, but it's necessity might
            // be a symptom of another problem.  We should investigate.
            if (
              !isNil(params.node) &&
              params.node.group === false &&
              !isNil(params.node) &&
              params.node.group === false
            ) {
              return row.meta.children.length !== 0 ? 5 : 1;
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
          cellClass: "cell--centered",
          cellRenderer: "UnitCell",
          width: 20,
          cellRendererParams: {
            onChange: (unit: Unit, row: Table.SubAccountRow) =>
              dispatch(
                updateSubAccountSubAccountAction({
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
          headerName: "Estimated",
          cellStyle: { textAlign: "right" },
          cellRendererParams: { formatter: formatCurrencyWithoutDollarSign }
        },
        {
          field: "actual",
          headerName: "Actual",
          cellStyle: { textAlign: "right" },
          cellRendererParams: { formatter: formatCurrencyWithoutDollarSign }
        },
        {
          field: "variance",
          headerName: "Variance",
          cellStyle: { textAlign: "right" },
          cellRendererParams: { formatter: formatCurrencyWithoutDollarSign, renderRedIfNegative: true }
        }
      ]}
    />
  );
};

export default SubAccountBudgetTable;
