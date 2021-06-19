import { useMemo } from "react";
import { isNil, reduce, filter, includes, findIndex, map } from "lodash";

import { GridReadyEvent, FirstDataRenderedEvent, ColSpanParams } from "@ag-grid-community/core";

import { useDynamicCallback, useDeepEqualMemo } from "lib/hooks";
import { hashString } from "lib/util";

import Grid from "./Grid";

const TableFooterGrid = <R extends Table.Row>({
  identifierField,
  identifierValue,
  options,
  columns,
  sizeColumnsToFit,
  setColumnApi
}: BudgetTable.TableFooterGridProps<R>): JSX.Element => {
  const rowData = useMemo((): R | null => {
    // TODO: Loop over the colDef's after we attribute the Base Columns with isBase = true, so
    // we can weed those out here.
    return reduce(
      filter(columns, (col: Table.Column<R>) => col.field !== identifierField),
      (obj: { [key: string]: any }, col: Table.Column<R>) => {
        if (!isNil(col.field)) {
          if (!isNil(col.tableTotal)) {
            obj[col.field] = col.tableTotal;
          } else {
            obj[col.field] = null;
          }
        }
        return obj;
      },
      {
        id: hashString("tablefooter"),
        [identifierField]: identifierValue,
        meta: {
          isGroupFooter: false,
          isTableFooter: true,
          isBudgetFooter: false,
          selected: false,
          children: [],
          errors: []
        }
      }
    ) as R;
  }, [useDeepEqualMemo(columns), identifierValue, identifierField]);

  const TableFooterGridColumn = useDynamicCallback<Table.Column<R>>(
    (col: Table.Column<R>): Table.Column<R> => {
      return {
        ...col,
        colSpan: (params: ColSpanParams) => {
          const field = params.column.getColId();
          if (isNil(field) || includes(["index", "expand"], field)) {
            return 1;
          }
          let startingIndex = 0;
          if (field !== identifierField) {
            startingIndex = findIndex(columns, { field } as any);
            if (startingIndex === -1) {
              /* eslint-disable no-console */
              console.error(`Suspicious behavior:  Could not find column for field ${field}.`);
              return 1;
            }
          }
          // Columns to the right of the identifier column (including the identifier
          // column).
          const identifierToRightColumns = filter(
            columns,
            (c: Table.Column<R>) => !includes(["index", "expand"], c.field)
          );
          const rightIndex = findIndex(identifierToRightColumns, (c: Table.Column<R>) => !isNil(c.tableTotal));
          if (rightIndex !== -1) {
            return rightIndex - startingIndex;
          }
          return columns.length - startingIndex;
        }
      };
    }
  );

  const onFirstDataRendered = useDynamicCallback((event: FirstDataRenderedEvent): void => {
    if (sizeColumnsToFit === true) {
      event.api.sizeColumnsToFit();
    }
  });

  const onGridReady = useDynamicCallback((event: GridReadyEvent): void => {
    setColumnApi(event.columnApi);
  });

  return (
    <div className={"table-footer-grid"}>
      <Grid<R>
        {...options}
        columns={map(columns, (col: Table.Column<R>) => TableFooterGridColumn(col))}
        rowData={[rowData]}
        rowHeight={38}
        rowClass={"row--table-footer"}
        suppressRowClickSelection={true}
        onGridReady={onGridReady}
        onFirstDataRendered={onFirstDataRendered}
        headerHeight={0}
      />
    </div>
  );
};

export default TableFooterGrid;
