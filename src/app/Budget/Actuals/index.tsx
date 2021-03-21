import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { isNil, find } from "lodash";

import { CellClassParams } from "ag-grid-community";

import { RenderWithSpinner } from "components/display";
import { BudgetTable } from "components/tables";
import { GetExportValueParams } from "components/tables/BudgetTable";
import { setAncestorsAction } from "../actions";
import {
  requestBudgetItemsAction,
  requestActualsAction,
  setActualsSearchAction,
  addActualsTablePlaceholdersAction,
  deselectActualsTableRowAction,
  selectActualsTableRowAction,
  removeActualAction,
  updateActualAction,
  selectAllActualsTableRowsAction,
  requestBudgetItemsTreeAction
} from "./actions";
import { BudgetItemCell, PaymentMethodsCell } from "./cells";

const Actuals = (): JSX.Element => {
  const dispatch = useDispatch();
  const actuals = useSelector((state: Redux.IApplicationStore) => state.actuals);
  const budget = useSelector((state: Redux.IApplicationStore) => state.budget.budget);
  const budgetItems = useSelector((state: Redux.IApplicationStore) => state.actuals.budgetItems);

  useEffect(() => {
    dispatch(requestActualsAction());
    dispatch(requestBudgetItemsAction());
    dispatch(requestBudgetItemsTreeAction());
  }, []);

  useEffect(() => {
    if (!isNil(budget.detail.data)) {
      dispatch(
        setAncestorsAction([
          {
            id: budget.detail.data.id,
            identifier: budget.detail.data.name,
            type: "budget"
          }
        ])
      );
    }
  }, [budget.detail.data]);

  return (
    <RenderWithSpinner loading={actuals.table.loading || budget.detail.loading}>
      <BudgetTable<Table.ActualRow>
        table={actuals.table.data}
        nonEditableCells={["object_id", "payment_method"]}
        nonHighlightedNonEditableCells={["payment_method", "object_id"]}
        search={actuals.table.search}
        onSearch={(value: string) => dispatch(setActualsSearchAction(value))}
        saving={actuals.deleting.length !== 0 || actuals.updating.length !== 0 || actuals.creating}
        onRowAdd={() => dispatch(addActualsTablePlaceholdersAction(1))}
        onRowSelect={(id: number) => dispatch(selectActualsTableRowAction(id))}
        onRowDeselect={(id: number) => dispatch(deselectActualsTableRowAction(id))}
        onRowDelete={(row: Table.ActualRow) => dispatch(removeActualAction(row))}
        onRowUpdate={(payload: Table.RowChange) => dispatch(updateActualAction(payload))}
        onSelectAll={() => dispatch(selectAllActualsTableRowsAction())}
        frameworkComponents={{ BudgetItemCell, PaymentMethodsCell }}
        rowRefreshRequired={(existing: Table.ActualRow, row: Table.ActualRow) => {
          return (
            existing.object_id !== row.object_id ||
            existing.parent_type !== row.parent_type ||
            existing.payment_method !== row.payment_method
          );
        }}
        footerRow={{
          description: "Grand Total",
          value:
            !isNil(budget.detail.data) && !isNil(budget.detail.data.actual) ? String(budget.detail.data.actual) : "0.00"
        }}
        cellClass={(params: CellClassParams) => (params.colDef.field === "object_id" ? "no-select" : undefined)}
        exportFileName={"actuals.csv"}
        getExportValue={{
          object_id: ({ node }: GetExportValueParams) => {
            const item = find(budgetItems.data, { id: node.data.object_id, type: node.data.parent_type });
            if (!isNil(item)) {
              return item.identifier;
            }
            return "";
          }
        }}
        columns={[
          {
            field: "object_id",
            headerName: "Account",
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
          },
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
          },
          {
            field: "value",
            headerName: "Actual",
            cellStyle: { textAlign: "right" },
            cellRendererParams: { formatter: (value: string | number) => `$${value}` }
          }
        ]}
      />
    </RenderWithSpinner>
  );
};

export default Actuals;
