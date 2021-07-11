import { useEffect, useState } from "react";
import { isNil, reduce, filter, map, includes } from "lodash";

import { ColSpanParams } from "@ag-grid-community/core";

import { useDeepEqualMemo } from "lib/hooks";
import Grid from "./Grid";

const TableFooterGrid = <R extends Table.Row>({
  onGridReady,
  onFirstDataRendered,
  loadingParent,
  options,
  columns
}: BudgetTable.TableFooterGridProps<R>): JSX.Element => {
  const [data, setData] = useState<R[]>([]);

  const transformColumn = (column: Table.Column<R>): Table.Column<R> => {
    return {
      ...column,
      colSpan: (params: ColSpanParams) => {
        if (!isNil(column.footer) && !isNil(column.footer.colSpan)) {
          return column.footer.colSpan(params);
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
            if (!isNil(col.footer) && !isNil(col.footer.value)) {
              obj[col.field] = col.footer.value;
            } else {
              obj[col.field] = null;
            }
            return obj;
          },
          {
            id: "table_footer_row",
            meta: {
              isGroupFooter: false,
              isTableFooter: true,
              isBudgetFooter: false,
              selected: false,
              children: []
            }
          }
        ) as R
      ]);
    }
  }, [useDeepEqualMemo(columns), loadingParent]);

  return (
    <div className={"table-footer-grid"}>
      <Grid<R>
        {...options}
        columns={map(columns, (col: Table.Column<R>) => transformColumn(col))}
        rowData={data}
        rowHeight={38}
        rowClass={"row--table-footer"}
        suppressRowClickSelection={true}
        immutableData={true}
        getRowNodeId={(r: any) => r.id}
        onGridReady={onGridReady}
        onFirstDataRendered={onFirstDataRendered}
        headerHeight={0}
      />
    </div>
  );
};

export default TableFooterGrid;
