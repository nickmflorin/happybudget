import { useMemo } from "react";
import { map, isNil, filter, reduce, includes } from "lodash";

import { useDynamicCallback, useDeepEqualMemo } from "lib/hooks";
import { hashString } from "lib/util";

import Grid from "./Grid";

const BudgetFooterGrid = <R extends Table.Row>({
  identifierValue,
  options,
  columns,
  loadingBudget,
  onGridReady,
  onFirstDataRendered
}: BudgetTable.BudgetFooterGridProps<R>): JSX.Element => {
  const rowData = useMemo((): R | null => {
    let fieldsLoading: string[] = [];
    if (loadingBudget === true) {
      const calculatedCols: Table.Column<R>[] = filter(columns, (col: Table.Column<R>) => col.isCalculated === true);
      fieldsLoading = map(calculatedCols, (col: Table.Column<R>) => col.field) as string[];
    }
    const baseColumns = filter(columns, (c: Table.Column<R>) => includes(["index", "expand"], c.field));
    if (columns.length > baseColumns.length) {
      return reduce(
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
          id: hashString("budgetfooter"),
          [columns[baseColumns.length].field]: identifierValue,
          meta: {
            isGroupFooter: false,
            isTableFooter: false,
            isBudgetFooter: true,
            selected: false,
            children: [],
            errors: [],
            fieldsLoading
          }
        }
      ) as R;
    }
    return null;
  }, [useDeepEqualMemo(columns), identifierValue, loadingBudget]);

  const BudgetFooterGridColumn = useDynamicCallback<Table.Column<R>>((col: Table.Column<R>): Table.Column<R> => {
    return {
      ...col
    };
  });

  return (
    <div className={"budget-footer-grid"}>
      <Grid
        {...options}
        columns={map(columns, (col: Table.Column<R>) => BudgetFooterGridColumn(col))}
        rowData={!isNil(rowData) ? [rowData] : []}
        rowClass={"row--budget-footer"}
        onGridReady={onGridReady}
        onFirstDataRendered={onFirstDataRendered}
        headerHeight={0}
        rowHeight={28}
      />
    </div>
  );
};

export default BudgetFooterGrid;
