import { useEffect, useState } from "react";
import { map, isNil, reduce, includes } from "lodash";

import { ColSpanParams } from "@ag-grid-community/core";

import * as models from "lib/model";
import { useDeepEqualMemo } from "lib/hooks";

import Grid from "./Grid";

const BudgetFooterGrid = <R extends Table.Row, M extends Model.Model>({
  options,
  columns,
  loadingBudget,
  onGridReady,
  onFirstDataRendered
}: BudgetTable.BudgetFooterGridProps<R, M>): JSX.Element => {
  const [data, setData] = useState<R[]>([]);

  const transformColumn = (column: Table.Column<R, M>): Table.Column<R, M> => {
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
    setData([
      reduce(
        columns,
        (obj: { [key: string]: any }, col: Table.Column<R, M>) => {
          const fieldBehavior: Table.FieldBehavior[] = col.fieldBehavior || ["read", "write"];
          if (includes(fieldBehavior, "read")) {
            if (!isNil(col.budget) && !isNil(col.budget.value)) {
              obj[col.field as string] = col.budget.value;
            } else {
              obj[col.field as string] = null;
            }
          }
          return obj;
        },
        {
          id: "budget_footer_row",
          meta: {
            ...models.DefaultRowMeta,
            isBudgetFooter: true
          }
        }
      ) as R
    ]);
  }, [useDeepEqualMemo(columns), loadingBudget]);

  return (
    <div className={"budget-footer-grid"}>
      <Grid<R, M>
        {...options}
        columns={map(columns, (col: Table.Column<R, M>) => transformColumn(col))}
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
