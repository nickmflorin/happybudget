import { useEffect, useState, useRef } from "react";
import { map, isNil, filter, reduce, includes, forEach, find } from "lodash";

import { Column } from "@ag-grid-community/core";

import { useDeepEqualMemo } from "lib/hooks";

import Grid from "./Grid";

const BudgetFooterGrid = <R extends Table.Row>({
  apis,
  identifierValue,
  options,
  columns,
  loadingBudget,
  onGridReady,
  onFirstDataRendered
}: BudgetTable.BudgetFooterGridProps<R>): JSX.Element => {
  const dataWasRendered = useRef(false);
  const [data, setData] = useState<R[]>([]);

  useEffect(() => {
    const baseColumns = filter(columns, (c: Table.Column<R>) => includes(["index", "expand"], c.field));
    if (columns.length > baseColumns.length) {
      const calculatedColumns = filter(columns, (col: Table.Column<R>) => col.isCalculated === true);
      setData([
        reduce(
          [...columns.slice(0, baseColumns.length), ...columns.slice(baseColumns.length + 1)],
          (obj: { [key: string]: any }, col: Table.Column<R>) => {
            if (!isNil(col.field)) {
              if (!isNil(col.budgetTotal)) {
                obj[col.field] = col.budgetTotal;
              } else {
                obj[col.field] = null;
              }
            }
            return obj;
          },
          {
            id: "budget_footer_row",
            [columns[baseColumns.length].field]: identifierValue,
            meta: {
              isGroupFooter: false,
              isTableFooter: false,
              isBudgetFooter: true,
              selected: false,
              children: [],
              errors: [],
              fieldsLoading:
                dataWasRendered.current === true && loadingBudget === true
                  ? map(calculatedColumns, (col: Table.Column<R>) => col.field)
                  : []
            }
          }
        ) as R
      ]);
      dataWasRendered.current = true;
    }
  }, [useDeepEqualMemo(columns), loadingBudget, identifierValue]);

  useEffect(() => {
    if (!isNil(apis) && data.length !== 0) {
      const node = apis.grid.getRowNode("budget_footer_row");
      if (!isNil(node)) {
        const allColumns = apis.column.getAllColumns();
        const calculatedColumns: Column[] = [];
        if (!isNil(allColumns)) {
          forEach(allColumns, (col: Column) => {
            const custom = find(columns, { field: col.getColId() });
            if (!isNil(custom) && custom.isCalculated === true) {
              calculatedColumns.push(col);
            }
          });
        }
        apis.grid.applyTransaction({
          update: [
            {
              ...node.data,
              meta: {
                ...node.data.meta,
                fieldsLoading: loadingBudget === true ? map(calculatedColumns, (col: Column) => col.getColId()) : []
              }
            }
          ]
        });
        apis.grid.refreshCells({
          rowNodes: [node],
          columns: calculatedColumns,
          force: true
        });
      }
    }
  }, [apis, useDeepEqualMemo(data)]);

  return (
    <div className={"budget-footer-grid"}>
      <Grid
        {...options}
        columns={columns}
        rowData={data}
        rowClass={"row--budget-footer"}
        onGridReady={onGridReady}
        onFirstDataRendered={onFirstDataRendered}
        immutableData={true}
        getRowNodeId={(r: any) => r.id}
        headerHeight={0}
        rowHeight={28}
      />
    </div>
  );
};

export default BudgetFooterGrid;
