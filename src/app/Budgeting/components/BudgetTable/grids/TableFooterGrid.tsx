import { useEffect, useState, useRef } from "react";
import { isNil, reduce, filter, map, includes, forEach, find } from "lodash";

import { ColSpanParams, Column } from "@ag-grid-community/core";

import { useDeepEqualMemo } from "lib/hooks";
import Grid from "./Grid";

const TableFooterGrid = <R extends Table.Row>({
  apis,
  onGridReady,
  onFirstDataRendered,
  loadingParent,
  options,
  columns
}: BudgetTable.TableFooterGridProps<R>): JSX.Element => {
  const dataWasRendered = useRef(false);
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
      const calculatedColumns = filter(columns, (col: Table.Column<R>) => col.isCalculated === true);
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
              children: [],
              errors: [],
              fieldsLoading:
                dataWasRendered.current === true && loadingParent === true
                  ? map(calculatedColumns, (col: Table.Column<R>) => col.field)
                  : []
            }
          }
        ) as R
      ]);
      dataWasRendered.current = true;
    }
  }, [useDeepEqualMemo(columns), loadingParent]);

  useEffect(() => {
    if (!isNil(apis) && data.length !== 0) {
      const node = apis.grid.getRowNode("table_footer_row");
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
                fieldsLoading: loadingParent === true ? map(calculatedColumns, (col: Column) => col.getColId()) : []
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
