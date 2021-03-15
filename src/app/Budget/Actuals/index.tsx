import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { isNil, find } from "lodash";

import { CellClassParams, ColDef } from "ag-grid-community";

import { RenderWithSpinner } from "components/display";
import { GenericBudgetTable } from "components/tables";
import { GetExportValueParams } from "components/tables/GenericBudgetTable";
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
import { BudgetItemCell } from "./cells";

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
      <GenericBudgetTable<Table.ActualRowField, Table.IActualRowMeta, Table.IActualRow>
        table={actuals.table.data}
        isCellEditable={(row: Table.IActualRow, col: ColDef) => col.field !== "object_id"}
        highlightNonEditableCell={(row: Table.IActualRow, col: ColDef) => col.field !== "object_id"}
        search={actuals.table.search}
        onSearch={(value: string) => dispatch(setActualsSearchAction(value))}
        saving={actuals.deleting.length !== 0 || actuals.updating.length !== 0 || actuals.creating}
        onRowAdd={() => dispatch(addActualsTablePlaceholdersAction())}
        onRowSelect={(id: number) => dispatch(selectActualsTableRowAction(id))}
        onRowDeselect={(id: number) => dispatch(deselectActualsTableRowAction(id))}
        onRowDelete={(row: Table.IActualRow) => dispatch(removeActualAction(row))}
        onRowUpdate={(id: number, data: { [key: string]: any }) => dispatch(updateActualAction({ id, data }))}
        onSelectAll={() => dispatch(selectAllActualsTableRowsAction())}
        frameworkComponents={{ BudgetItemCell }}
        rowRefreshRequired={(existing: Table.IActualRow, row: Table.IActualRow) =>
          existing.object_id !== row.object_id || existing.parent_type !== row.parent_type
        }
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
              onChange: (object_id: number, parent_type: BudgetItemType, row: Table.IActualRow) => {
                dispatch(updateActualAction({ id: row.id, data: { object_id, parent_type } }));
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
            headerName: "Payment Method"
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
