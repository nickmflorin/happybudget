import { useEffect, useState, useRef } from "react";
import { isNil, reduce, filter, map, findIndex, includes, forEach, find } from "lodash";

import { ColSpanParams, Column } from "@ag-grid-community/core";

import { useDeepEqualMemo } from "lib/hooks";
import Grid from "./Grid";

const TableFooterGrid = <R extends Table.Row>({
  apis,
  onGridReady,
  onFirstDataRendered,
  loadingParent,
  identifierValue,
  options,
  columns
}: BudgetTable.TableFooterGridProps<R>): JSX.Element => {
  const columnsWereRendered = useRef(false);
  const dataWasRendered = useRef(false);
  const [cols, setCols] = useState<Table.Column<R>[]>([]);
  const [data, setData] = useState<R[]>([]);

  useEffect(() => {
    if (columnsWereRendered.current === false) {
      const baseColumns = filter(columns, (c: Table.Column<R>) => includes(["index", "expand"], c.field));
      if (columns.length > baseColumns.length) {
        const TableFooterGridColumn = (col: Table.Column<R>): Table.Column<R> => {
          return {
            ...col,
            cellRendererParams: {
              ...col.cellRendererParams
            },
            colSpan: (params: ColSpanParams) => {
              const field = params.column.getColId();
              if (isNil(field) || includes(["index", "expand"], field)) {
                return !isNil(col.colSpan) ? col.colSpan(params) : 1;
              }

              let startingIndex = 0;
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
              const rightIndex = findIndex(
                columns.slice(baseColumns.length),
                (c: Table.Column<R>) => !isNil(c.tableTotal)
              );
              if (rightIndex !== -1) {
                return rightIndex - startingIndex;
              }
              return columns.length - startingIndex;
            }
          };
        };
        setCols(map(columns, (col: Table.Column<R>) => TableFooterGridColumn(col)));
        columnsWereRendered.current = true;
      }
    }
  }, [useDeepEqualMemo(columns)]);

  useEffect(() => {
    const baseColumns = filter(columns, (c: Table.Column<R>) => includes(["index", "expand"], c.field));
    if (columns.length > baseColumns.length) {
      const calculatedColumns = filter(columns, (col: Table.Column<R>) => col.isCalculated === true);
      setData([
        reduce(
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
            id: "table_footer_row",
            [columns[baseColumns.length].field]: identifierValue,
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
  }, [useDeepEqualMemo(columns), loadingParent, identifierValue]);

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
        columns={cols}
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
