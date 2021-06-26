import { useMemo } from "react";
import { map, isNil, filter, reduce } from "lodash";

import { GridReadyEvent, FirstDataRenderedEvent } from "@ag-grid-community/core";

import { useDynamicCallback, useDeepEqualMemo } from "lib/hooks";
import { hashString } from "lib/util";

import Grid from "./Grid";

const BudgetFooterGrid = <R extends Table.Row>({
  identifierField,
  identifierValue,
  options,
  columns,
  loadingBudget,
  sizeColumnsToFit,
  setColumnApi
}: BudgetTable.BudgetFooterGridProps<R>): JSX.Element => {
  const rowData = useMemo((): R | null => {
    let fieldsLoading: string[] = [];
    if (loadingBudget === true) {
      const calculatedCols: Table.Column<R>[] = filter(columns, (col: Table.Column<R>) => col.isCalculated === true);
      fieldsLoading = map(calculatedCols, (col: Table.Column<R>) => col.field) as string[];
    }
    // TODO: Loop over the colDef's after we attribute the Base Columns with isBase = true, so
    // we can weed those out here.
    return reduce(
      filter(columns, (col: Table.Column<R>) => col.field !== identifierField),
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
        [identifierField]: identifierValue,
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
  }, [useDeepEqualMemo(columns), identifierField, identifierValue, loadingBudget]);

  const BudgetFooterGridColumn = useDynamicCallback<Table.Column<R>>((col: Table.Column<R>): Table.Column<R> => {
    return {
      ...col
    };
  });

  const onFirstDataRendered = useDynamicCallback((event: FirstDataRenderedEvent): void => {
    if (sizeColumnsToFit === true) {
      event.api.sizeColumnsToFit();
    }
  });

  const onGridReady = useDynamicCallback((event: GridReadyEvent): void => {
    setColumnApi(event.columnApi);
  });

  return (
    <div className={"budget-footer-grid"}>
      <Grid
        {...options}
        columns={map(columns, (col: Table.Column<R>) => BudgetFooterGridColumn(col))}
        rowData={[rowData]}
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
