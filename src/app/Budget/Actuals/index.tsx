import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { isNil, find } from "lodash";
import { createSelector } from "reselect";

import { CellClassParams } from "ag-grid-community";

import { WrapInApplicationSpinner } from "components/display";
import { simpleDeepEqualSelector, simpleShallowEqualSelector } from "store/selectors";

import { setAncestorsAction } from "../actions";
import { selectBudgetDetailLoading, selectBudgetDetail } from "../selectors";
import BudgetTable, { GetExportValueParams } from "../BudgetTable";
import {
  requestBudgetItemsAction,
  requestActualsAction,
  setSearchAction,
  addPlaceholdersAction,
  deselectRowAction,
  selectRowAction,
  removeActualAction,
  updateActualAction,
  selectAllRowsAction,
  requestBudgetItemsTreeAction
} from "./actions";
import { BudgetItemCell, PaymentMethodsCell } from "./cells";

const selectActualsLoading = simpleShallowEqualSelector(
  (state: Redux.IApplicationStore) => state.actuals.actuals.loading
);
const selectLoading = createSelector(
  selectBudgetDetailLoading,
  selectActualsLoading,
  (detailLoading: boolean, tableLoading: boolean) => detailLoading || tableLoading
);
const selectTableData = simpleDeepEqualSelector((state: Redux.IApplicationStore) => state.actuals.actuals.table);
const selectTableSearch = simpleShallowEqualSelector((state: Redux.IApplicationStore) => state.actuals.actuals.search);
const selectSaving = createSelector(
  (state: Redux.IApplicationStore) => state.actuals.actuals.deleting,
  (state: Redux.IApplicationStore) => state.actuals.actuals.updating,
  (state: Redux.IApplicationStore) => state.actuals.actuals.creating,
  (deleting: number[], updating: number[], creating: boolean) =>
    deleting.length !== 0 || updating.length !== 0 || creating === true
);
const selectBudgetItems = simpleDeepEqualSelector((state: Redux.IApplicationStore) => state.actuals.budgetItems.data);

const Actuals = (): JSX.Element => {
  const dispatch = useDispatch();
  const loading = useSelector(selectLoading);
  const budgetItems = useSelector(selectBudgetItems);
  const table = useSelector(selectTableData);
  const search = useSelector(selectTableSearch);
  const saving = useSelector(selectSaving);
  const budgetDetail = useSelector(selectBudgetDetail);

  useEffect(() => {
    dispatch(requestActualsAction());
    dispatch(requestBudgetItemsAction());
    dispatch(requestBudgetItemsTreeAction());
  }, []);

  useEffect(() => {
    if (!isNil(budgetDetail)) {
      dispatch(
        setAncestorsAction([
          {
            id: budgetDetail.id,
            identifier: budgetDetail.name,
            type: "budget"
          }
        ])
      );
    }
  }, [budgetDetail]);

  return (
    <WrapInApplicationSpinner loading={loading}>
      <BudgetTable<Table.ActualRow>
        table={table}
        nonEditableCells={["object_id", "payment_method"]}
        nonHighlightedNonEditableCells={["payment_method", "object_id"]}
        search={search}
        onSearch={(value: string) => dispatch(setSearchAction(value))}
        saving={saving}
        onRowAdd={() => dispatch(addPlaceholdersAction(1))}
        onRowSelect={(id: number) => dispatch(selectRowAction(id))}
        onRowDeselect={(id: number) => dispatch(deselectRowAction(id))}
        onRowDelete={(row: Table.ActualRow) => dispatch(removeActualAction(row))}
        onRowUpdate={(payload: Table.RowChange) => dispatch(updateActualAction(payload))}
        onSelectAll={() => dispatch(selectAllRowsAction())}
        frameworkComponents={{ BudgetItemCell, PaymentMethodsCell }}
        rowRefreshRequired={(existing: Table.ActualRow, row: Table.ActualRow) => {
          return (
            existing.object_id !== row.object_id ||
            existing.parent_type !== row.parent_type ||
            existing.payment_method !== row.payment_method
          );
        }}
        identifierField={"object_id"}
        identifierFieldHeader={"Account"}
        identifierFieldParams={{
          width: 200,
          cellClass: "borderless",
          cellRenderer: "BudgetItemCell",
          cellRendererParams: {
            onChange: (object_id: number, parent_type: BudgetItemType, row: Table.ActualRow) => {
              dispatch(
                updateActualAction({
                  id: row.id,
                  data: {
                    object_id: { newValue: object_id, oldValue: row.object_id },
                    parent_type: { oldValue: row.parent_type, newValue: parent_type }
                  }
                })
              );
            }
          }
        }}
        totals={{
          value: !isNil(budgetDetail) && !isNil(budgetDetail.actual) ? String(budgetDetail.actual) : "0.00"
        }}
        cellClass={(params: CellClassParams) => (params.colDef.field === "object_id" ? "no-select" : undefined)}
        exportFileName={"actuals.csv"}
        getExportValue={{
          object_id: ({ node }: GetExportValueParams) => {
            const item = find(budgetItems, { id: node.data.object_id, type: node.data.parent_type });
            if (!isNil(item)) {
              return item.identifier;
            }
            return "";
          }
        }}
        bodyColumns={[
          {
            field: "description",
            headerName: "Description"
          },
          {
            field: "vendor",
            headerName: "Vendor"
          },
          {
            field: "purchase_order",
            headerName: "Purchase Order"
          },
          {
            field: "date",
            headerName: "Date",
            cellStyle: { textAlign: "right" }
          },
          {
            field: "payment_method",
            headerName: "Payment Method",
            cellRenderer: "PaymentMethodsCell",
            cellClass: "cell--centered",
            cellRendererParams: {
              onChange: (paymentMethod: PaymentMethod, row: Table.ActualRow) =>
                dispatch(
                  updateActualAction({
                    id: row.id,
                    data: { payment_method: { newValue: paymentMethod, oldValue: row.payment_method } }
                  })
                )
            }
          },
          {
            field: "payment_id",
            headerName: "Payment ID"
          }
        ]}
        calculatedColumns={[
          {
            field: "value",
            headerName: "Actual"
          }
        ]}
      />
    </WrapInApplicationSpinner>
  );
};

export default Actuals;
