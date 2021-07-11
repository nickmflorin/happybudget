import { useEffect, useState } from "react";
import { map, isNil, filter, reduce, includes } from "lodash";

import { ColSpanParams } from "@ag-grid-community/core";

import { useDeepEqualMemo } from "lib/hooks";

import Grid from "./Grid";

const BudgetFooterGrid = <R extends Table.Row>({
  options,
  columns,
  loadingBudget,
  onGridReady,
  onFirstDataRendered
}: BudgetTable.BudgetFooterGridProps<R>): JSX.Element => {
  const [data, setData] = useState<R[]>([]);

  const transformColumn = (column: Table.Column<R>): Table.Column<R> => {
    return {
      ...column,
      cellRenderer: column.isCalculated === true ? "BudgetFooterCalculatedCell" : column.cellRenderer,
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
              errors: []
            }
          }
        ) as R
      ]);
    }
  }, [useDeepEqualMemo(columns), loadingBudget]);

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
