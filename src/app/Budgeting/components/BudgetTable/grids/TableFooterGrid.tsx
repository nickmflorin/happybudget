import { useMemo } from "react";
import { isNil, reduce, filter, map, findIndex, includes } from "lodash";

import { ColSpanParams } from "@ag-grid-community/core";

import { useDynamicCallback, useDeepEqualMemo } from "lib/hooks";
import { hashString } from "lib/util";

import Grid from "./Grid";

const TableFooterGrid = <R extends Table.Row>({
  onGridReady,
  onFirstDataRendered,
  identifierValue,
  options,
  columns
}: BudgetTable.TableFooterGridProps<R>): JSX.Element => {
  const rowData = useMemo((): R | null => {
    const baseColumns = filter(columns, (c: Table.Column<R>) => includes(["index", "expand"], c.field));
    if (columns.length > baseColumns.length) {
      return reduce(
        [...columns.slice(0, baseColumns.length), ...columns.slice(baseColumns.length + 1)],
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
          [columns[baseColumns.length].field]: identifierValue,
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
    }
    return null;
  }, [useDeepEqualMemo(columns), identifierValue]);

  const TableFooterGridColumn = useDynamicCallback<Table.Column<R>>((col: Table.Column<R>): Table.Column<R> => {
    return {
      ...col,
      colSpan: (params: ColSpanParams) => {
        const field = params.column.getColId();
        if (isNil(field) || includes(["index", "expand"], field)) {
          return !isNil(col.colSpan) ? col.colSpan(params) : 1;
        }

        let startingIndex = 0;
        const baseColumns = filter(columns, (c: Table.Column<R>) => includes(["index", "expand"], c.field));
        if (columns.length > baseColumns.length) {
          const identifierCol = columns[baseColumns.length];
          if (field !== identifierCol.field) {
            startingIndex = findIndex(columns, { field } as any);
            if (startingIndex === -1) {
              /* eslint-disable no-console */
              console.error(`Suspicious behavior:  Could not find column for field ${field}.`);
              return 1;
            }
          } else {
            return 1;
          }
        } else {
          return 1;
        }
        // Columns to the right of the index and expand columns.
        const rightIndex = findIndex(columns.slice(baseColumns.length), (c: Table.Column<R>) => !isNil(c.tableTotal));
        if (rightIndex !== -1) {
          return rightIndex - startingIndex;
        }
        return columns.length - startingIndex;
      }
    };
  });

  return (
    <div className={"table-footer-grid"}>
      <Grid<R>
        {...options}
        columns={map(columns, (col: Table.Column<R>) => TableFooterGridColumn(col))}
        rowData={!isNil(rowData) ? [rowData] : []}
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
