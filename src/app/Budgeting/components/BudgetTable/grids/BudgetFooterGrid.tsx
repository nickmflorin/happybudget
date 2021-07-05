import { useEffect, useState, useRef } from "react";
import { map, isNil, filter, reduce, includes, forEach, find } from "lodash";

import { Column, ColSpanParams } from "@ag-grid-community/core";

import { useDeepEqualMemo } from "lib/hooks";

import Grid from "./Grid";

const BudgetFooterGrid = <R extends Table.Row>({
  apis,
  options,
  columns,
  loadingBudget,
  onGridReady,
  onFirstDataRendered
}: BudgetTable.BudgetFooterGridProps<R>): JSX.Element => {
  const dataWasRendered = useRef(false);
  const [data, setData] = useState<R[]>([]);

  const transformColumn = (column: Table.Column<R>): Table.Column<R> => {
    return {
      ...column,
      colSpan: (params: ColSpanParams) => {
        if (!isNil(column.budget) && !isNil(column.budget.colSpan)) {
          return column.budget.colSpan(params);
        }
        return !isNil(column.colSpan) ? column.colSpan(params) : 1;
      }
    };
  };

  useEffect(() => {
    const baseColumns = filter(columns, (c: Table.Column<R>) => includes(["index", "expand"], c.field));
    if (columns.length > baseColumns.length) {
      const calculatedColumns = filter(columns, (col: Table.Column<R>) => col.isCalculated === true);
      setData([
        reduce(
          columns,
          (obj: { [key: string]: any }, col: Table.Column<R>) => {
            if (!isNil(col.budget) && !isNil(col.budget.value)) {
              obj[col.field] = col.budget.value;
            } else {
              obj[col.field] = null;
            }
            return obj;
          },
          {
            id: "budget_footer_row",
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
  }, [useDeepEqualMemo(columns), loadingBudget]);

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
        columns={map(columns, (col: Table.Column<R>) => transformColumn(col))}
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
