import { useState } from "react";
import { isNil, reduce, filter, map } from "lodash";

import { ProcessCellForExportParams, ProcessDataFromClipboardParams } from "@ag-grid-community/core";

import { hooks, util, tabling } from "lib";

import useClipboard, { UseClipboardParams, UseClipboardReturnType } from "./useClipboard";
import useColumnHelpers from "./useColumnHelpers";

type UseAuthenticatedClipboardReturnType<R extends Table.RowData> = [
  ...UseClipboardReturnType<R>,
  (p: ProcessCellForExportParams) => string,
  (p: ProcessDataFromClipboardParams) => CSVData,
  (p: Table.SoloCellChange<R> | null) => void
];

type UseAuthenticatedClipboardParams<R extends Table.RowData, M extends Model.HttpModel> = Omit<
  UseClipboardParams<R, M>,
  "setCellCutChange"
> & {
  readonly apis: Table.GridApis | null;
  readonly onChangeEvent: (event: Table.ChangeEvent<R, M>) => void;
};

const useAuthenticatedClipboard = <R extends Table.RowData, M extends Model.HttpModel>(
  params: UseAuthenticatedClipboardParams<R, M>
): UseAuthenticatedClipboardReturnType<R> => {
  /* eslint-disable no-unused-vars */
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const [getColumn, callWithColumn] = useColumnHelpers(params.columns);
  const [cutCellChange, setCellCutChange] = useState<Table.SoloCellChange<R> | null>(null);
  const [processCellForClipboard, getCSVData] = useClipboard({ ...params, setCellCutChange });

  const processCellFromClipboard: (p: ProcessCellForExportParams) => string = hooks.useDynamicCallback(
    (p: ProcessCellForExportParams) => {
      if (!isNil(p.node)) {
        const node: Table.RowNode = p.node;
        const field = p.column.getColId();
        const c = getColumn(field);
        if (!isNil(c)) {
          if (!isNil(cutCellChange)) {
            p = { ...p, value: cutCellChange.oldValue };
            params.onChangeEvent({
              type: "dataChange",
              payload: tabling.events.cellChangeToRowChange(cutCellChange)
            });
            setCellCutChange(null);
          }
          const row: Table.BodyRow<R> = node.data;
          let value = p.value;
          // If the value is undefined, it is something wonky with AG Grid.  We should return
          // the current value as to not cause data loss.
          if (value === undefined) {
            if (!isNil(c.field)) {
              return util.getKeyValue<R, keyof R>(c.field as keyof R)(row.data);
            }
            return c.nullValue === undefined ? null : c.nullValue;
          } else {
            const processor = c.processCellFromClipboard;
            if (!isNil(processor)) {
              value = processor(value);
              // The value should never be undefined at this point.
              if (typeof value === "string" && String(value).trim() === "") {
                return c.nullValue === undefined ? null : c.nullValue;
              }
            }
            return value;
          }
        } else {
          /* eslint-disable no-console */
          console.error(`Could not find column for field ${field}!`);
          return "";
        }
      }
      return "";
    }
  );

  const processDataFromClipboard: (p: ProcessDataFromClipboardParams) => CSVData = hooks.useDynamicCallback(
    (p: ProcessDataFromClipboardParams) => {
      // TODO: We need to test this in the case that we are copy and pasting starting at the action
      // columns on the left and potentially the non editable columns on the right.
      const getWritableColumnsAfter = (local: Table.ColumnApi, col: Table.AgColumn): Table.Column<R, M>[] => {
        const cols: Table.Column<R, M>[] = [];
        let current: Table.AgColumn | null = col;
        while (!isNil(current)) {
          const c: Table.Column<R, M> | null = getColumn(col.getColId());
          if (!isNil(c) && c.isWrite !== false) {
            cols.push(c);
          }
          current = local.getDisplayedColAfter(current);
        }
        return cols;
      };

      const generateRowAddFromArray = (array: any[], cols: Table.Column<R, M>[]): Table.RowAdd<R> | null => {
        if (cols.length < array.length) {
          /* eslint-disable no-console */
          console.warn(
            `There are ${cols.length} writable displayed columns, but the data array
            has length ${array.length} - this most likely means there is an issue with the
            column configuration.`
          );
          return null;
        } else {
          return {
            id: tabling.rows.placeholderRowId(),
            data: reduce(
              cols,
              /* eslint-disable indent */
              (curr: Partial<R>, c: Table.Column<R, M>, index: number) =>
                !isNil(c.field)
                  ? {
                      ...curr,
                      [c.field]: { column: c, value: array[index] }
                    }
                  : curr,
              {}
            )
          };
        }
      };
      const columnApi = params.apis?.column;
      if (!isNil(columnApi)) {
        const lastIndex = params.apis?.grid.getDisplayedRowCount();
        const focusedCell = params.apis?.grid.getFocusedCell();
        if (!isNil(focusedCell) && !isNil(lastIndex)) {
          if (focusedCell.rowIndex + p.data.length - 1 > lastIndex) {
            const resultLastIndex = focusedCell.rowIndex + p.data.length;
            const addRowCount = resultLastIndex - lastIndex;

            let rowsToAdd = [];
            let addedRows = 0;
            let currIndex = p.data.length - 1;
            while (addedRows < addRowCount) {
              rowsToAdd.push(p.data.splice(currIndex, 1)[0]);
              addedRows++;
              currIndex--;
            }
            rowsToAdd = rowsToAdd.reverse();

            const cols = getWritableColumnsAfter(columnApi, focusedCell.column);
            params.onChangeEvent({
              type: "rowAdd",
              payload: filter(
                map(rowsToAdd, (row: any[]) => generateRowAddFromArray(row, cols)),
                (ra: Table.RowAdd<R> | null) => !isNil(ra)
              ) as Table.RowAdd<R>[]
            });
          }
        }
      }
      return p.data;
    }
  );

  return [processCellForClipboard, getCSVData, processCellFromClipboard, processDataFromClipboard, setCellCutChange];
};

export default useAuthenticatedClipboard;
