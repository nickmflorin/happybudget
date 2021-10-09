import { useState } from "react";
import { isNil, reduce } from "lodash";

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
      const columnIsWritable = (
        col: Table.AgColumn
      ): [Table.Column<R, M>, true] | [null, false] | [Table.Column<R, M>, false] => {
        const field = col.getColId();
        if (!isNil(field)) {
          const c = getColumn(field);
          return !isNil(c) ? [c, c.isWrite !== false] : [c, false];
        }
        return [null, false];
      };

      const getWritableColumnsAfter = (local: Table.ColumnApi, col: Table.AgColumn): Table.Column<R, M>[] => {
        const cols: Table.Column<R, M>[] = [];
        let current: Table.AgColumn | null = col;
        while (!isNil(current)) {
          const [c, writable] = columnIsWritable(current);
          if (writable) {
            // If the column is writable, the first value of the array will be non-null so this
            // type coercion is safe.
            cols.push(c as Table.Column<R, M>);
          }
          current = local.getDisplayedColAfter(current);
        }
        return cols;
      };

      if (!isNil(params.apis)) {
        const rows = tabling.aggrid.getRows(params.apis.grid);

        const lastIndex = params.apis.grid.getDisplayedRowCount();

        const focusedCell = params.apis.grid.getFocusedCell();
        if (!isNil(focusedCell) && tabling.typeguards.isEditableRow(rows[focusedCell.rowIndex])) {
          // If the first column from the focused cell is not writable, that means we are
          // trying to copy and paste with the focused cell being associated with a column
          // like the index column.
          const [c, writable] = columnIsWritable(focusedCell.column);
          if (writable === false) {
            return [];
          }

          let updateRowData: any[] = [];
          let newRowData: any[] = [];

          // First, we need to separate out the data that corresponds to rows that should
          // be added vs. rows that should be updated, and stagger the data corresponding to
          // rows being updated such the paste operation will skip Group Rows.
          for (let i = 0; i < p.data.length; i++) {
            const rowIndex = focusedCell.rowIndex + i;
            if (rowIndex > lastIndex) {
              newRowData = [...newRowData, p.data[i]];
            } else {
              const node = params.apis.grid.getDisplayedRowAtIndex(rowIndex);
              if (!isNil(node)) {
                const row: Table.Row<R> = node.data;
                // If the row corresponds to a Group Row, we want to paste the contents into the
                // cell below the Group Row.  To do this, we simply add an empty data set for the
                // Group Row data (since it will not trigger a change anyways) and also append the
                // data at the current iteration.
                if (tabling.typeguards.isGroupRow(row)) {
                  updateRowData = [...updateRowData, [""], p.data[i]];
                } else {
                  if (isNil(p.data[i])) {
                    /* eslint-disable no-console */
                    console.warn(`Suspicious Behavior: Did not expect to find undefined value in data at index ${i}!`);
                  } else {
                    updateRowData = [...updateRowData, p.data[i]];
                  }
                }
              } else {
                /* eslint-disable no-console */
                console.warn(`Suspicious Behavior: No node found at index ${i}!`);
              }
            }
          }
          // Next, we need to determine what the row data should be for the pasted data corresponding
          // to rows that should be added to the table - and then dispatch an event to add these
          // rows to the table with the data provided.
          const cols = getWritableColumnsAfter(params.apis.column, focusedCell.column);
          params.onChangeEvent({
            type: "rowAdd",
            payload: reduce(
              newRowData,
              (curr: Table.RowAdd<R>[], rowData: any[]) => {
                if (cols.length < rowData.length) {
                  /* eslint-disable no-console */
                  console.warn(
                    `There are ${cols.length} writable displayed columns, but the data array
                    has length ${rowData.length} - this most likely means there is an issue with the
                    column configuration.`
                  );
                  return curr;
                } else {
                  return [
                    ...curr,
                    {
                      id: tabling.rows.placeholderRowId(),
                      data: reduce(
                        cols,
                        /* eslint-disable indent */
                        (currD: Partial<R>, ci: Table.Column<R, M>, index: number): Partial<R> => {
                          if (!isNil(ci.parseIntoFields)) {
                            const parsed = ci.parseIntoFields(rowData[index]);
                            return {
                              ...currD,
                              ...reduce(
                                parsed,
                                (v: Partial<R>, parsedField: Table.ParsedColumnField<R>) => {
                                  return { ...v, [parsedField.field]: parsedField.value };
                                },
                                {} as Partial<R>
                              )
                            };
                          } else if (!isNil(ci.field)) {
                            // Note: We do not use the colId for creating the RowData object - the colId
                            // is used for cases where the Column is not associated with a field of the
                            // Row Data.
                            return { ...currD, [ci.field]: rowData[index] };
                          }
                          return currD;
                        },
                        {} as Partial<R>
                      )
                    }
                  ];
                }
              },
              []
            )
          });
          // All we need to do is return the data corresponding to updates to the existing rows
          // because the cell value change handlers will take care of the rest.
          return updateRowData;
        }
      }
      return [];
    }
  );

  return [processCellForClipboard, getCSVData, processCellFromClipboard, processDataFromClipboard, setCellCutChange];
};

export default useAuthenticatedClipboard;
