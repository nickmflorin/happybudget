import { useMemo } from "react";
import { map, isNil, filter, reduce } from "lodash";

import { GridReadyEvent, FirstDataRenderedEvent } from "@ag-grid-community/core";

import { useDynamicCallback, useDeepEqualMemo } from "lib/hooks";
import { hashString } from "lib/util";

import { BudgetFooterGridProps, CustomColDef } from "../model";
import Grid from "./Grid";

const BudgetFooterGrid = <R extends Table.Row<G>, G extends Model.Group = Model.Group>({
  identifierField,
  identifierValue,
  options,
  columns,
  colDefs,
  loadingBudget,
  sizeColumnsToFit,
  setColumnApi
}: BudgetFooterGridProps<R, G>): JSX.Element => {
  const rowData = useMemo((): R | null => {
    let fieldsLoading: string[] = [];
    if (loadingBudget === true) {
      const calculatedCols: CustomColDef<R, G>[] = filter(
        columns,
        (col: CustomColDef<R, G>) => col.isCalculated === true
      );
      fieldsLoading = map(calculatedCols, (col: CustomColDef<R, G>) => col.field) as string[];
    }
    // TODO: Loop over the colDef's after we attribute the Base Columns with isBase = true, so
    // we can weed those out here.
    return reduce(
      columns,
      (obj: { [key: string]: any }, col: CustomColDef<R, G>) => {
        if (!isNil(col.field)) {
          if (col.isCalculated === true) {
            if (!isNil(col.budgetTotal)) {
              obj[col.field] = col.budgetTotal;
            } else {
              obj[col.field] = null;
            }
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
          isPlaceholder: false,
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
        columnDefs={colDefs}
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
