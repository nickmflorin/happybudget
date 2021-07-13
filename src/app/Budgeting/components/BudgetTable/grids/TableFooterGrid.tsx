import { useEffect, useState } from "react";
import { isNil, reduce, map, includes } from "lodash";

import { ColSpanParams } from "@ag-grid-community/core";

import * as models from "lib/model";
import { useDeepEqualMemo } from "lib/hooks";
import Grid from "./Grid";

const TableFooterGrid = <R extends Table.Row, M extends Model.Model>({
  onGridReady,
  onFirstDataRendered,
  loadingParent,
  options,
  columns
}: BudgetTable.TableFooterGridProps<R, M>): JSX.Element => {
  const [data, setData] = useState<R[]>([]);

  const transformColumn = (column: Table.Column<R, M>): Table.Column<R, M> => {
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
    setData([
      reduce(
        columns,
        (obj: { [key: string]: any }, col: Table.Column<R, M>) => {
          const fieldBehavior: Table.FieldBehavior[] = col.fieldBehavior || ["read", "write"];
          if (includes(fieldBehavior, "read")) {
            if (!isNil(col.footer) && !isNil(col.footer.value)) {
              obj[col.field as string] = col.footer.value;
            } else {
              obj[col.field as string] = null;
            }
          }
          return obj;
        },
        {
          id: "table_footer_row",
          meta: {
            ...models.DefaultRowMeta,
            isTableFooter: true
          }
        }
      ) as R
    ]);
  }, [useDeepEqualMemo(columns), loadingParent]);

  return (
    <div className={"table-footer-grid"}>
      <Grid<R, M>
        {...options}
        columns={map(columns, (col: Table.Column<R, M>) => transformColumn(col))}
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
