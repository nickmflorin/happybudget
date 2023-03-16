import { useState } from "react";

import { isNil, map, reduce, filter } from "lodash";
import {
  ProcessCellForExportParams,
  ProcessDataFromClipboardParams,
} from "@ag-grid-community/core";

import { hooks, tabling } from "lib";

import useClipboard, { UseClipboardParams, UseClipboardReturnType } from "./useClipboard";

type UseAuthenticatedClipboardReturnType<R extends Table.RowData> = [
  ...UseClipboardReturnType,
  (p: ProcessCellForExportParams) => Table.RawRowValue,
  (p: ProcessDataFromClipboardParams) => string[][],
  (p: Table.SoloCellChange<R> | null) => void,
];

type UseAuthenticatedClipboardParams<R extends Table.RowData, M extends Model.RowHttpModel> = Omit<
  UseClipboardParams<R, M>,
  "setCellCutChange"
> & {
  readonly apis: Table.GridApis | null;
  readonly onEvent: (event: Table.Event<R, M>) => void;
};

const getWritableColumnsAfter = <R extends Table.RowData, M extends Model.RowHttpModel>(
  api: Table.ColumnApi,
  columns: Table.DataColumn<R, M>[],
  col: Table.AgColumn,
): Table.BodyColumn<R, M>[] => {
  const cols: Table.BodyColumn<R, M>[] = [];
  let current: Table.AgColumn | null = col;
  while (!isNil(current)) {
    const c = tabling.columns.getColumn(columns, current.getColId());
    if (!isNil(c) && tabling.columns.isBodyColumn<R, M>(c)) {
      cols.push(c);
    }
    current = api.getDisplayedColAfter(current);
  }
  return cols;
};

const processValueFromClipboard = <
  R extends Table.RowData,
  M extends Model.RowHttpModel,
  V extends Table.RawRowValue = Table.RawRowValue,
>(
  value: string,
  c: Table.BodyColumn<R, M, V>,
  row?: Table.BodyRow<R>, // Will not be defined when adding rows.
): V | undefined => {
  /* If the value is undefined, it is something wonky with AG Grid.  We should
		 return the current value as to not cause data loss. */
  if (value === undefined) {
    if (!isNil(row)) {
      if (tabling.rows.isMarkupRow(row)) {
        if (!isNil(c.markupField)) {
          const v = row.data[c.markupField];
          return v as unknown as V;
        }
        /* We return undefined to communicate to the calling logic that the
           column is not applicable for this row. */
        return undefined;
      } else if (tabling.rows.isGroupRow(row)) {
        /* We return undefined to communicate to the calling logic that the
           column is not applicable for this row. */
        return undefined;
      }
      return row.data[c.field] as V;
    }
    return c.nullValue;
  } else {
    const processor = c.processCellFromClipboard;
    if (!isNil(processor)) {
      const processedValue = processor(value);
      // The value should never be undefined at this point.
      if (typeof processedValue === "string" && String(processedValue).trim() === "") {
        return c.nullValue;
      }
      return processedValue;
    }
    return value as V;
  }
};

const processArrayFromClipboard = <
  R extends Table.RowData,
  M extends Model.RowHttpModel,
  V extends Table.RawRowValue = Table.RawRowValue,
>(
  api: Table.ColumnApi,
  cols: Table.DataColumn<R, M, V>[],
  col: Table.AgColumn,
  arr: string[],
  row?: Table.BodyRow<R>, // Will not be defined when adding rows.
): V[] | undefined => {
  const columns = getWritableColumnsAfter<R, M>(api, cols, col);
  if (columns.length < arr.length) {
    console.warn(
      `There are ${cols.length} writable displayed columns, but the data array
      has length ${arr.length} - this most likely means there is an issue with the
      column configuration.`,
    );
    /* Because, due to an error, we cannot determine what column each element of
       the array is associated with - we cannot process the clipboard values for
       each element of the array. */
    return undefined;
  }
  return reduce(
    arr,
    (curr: V[], value: string, index: number) => {
      const c = columns[index]; // Will be in the array because of the above check.
      const processed = processValueFromClipboard<R, M, V>(value, c, row);
      /* If the processed value is undefined, this means that the column is not
         applicable for that row, so we tell AGGrid that the pasted value should
         just be treated as an empty string. */
      if (processed === undefined) {
        return [...curr, "" as V];
      }
      return [...curr, processed];
    },
    [],
  );
};

const useAuthenticatedClipboard = <R extends Table.RowData, M extends Model.RowHttpModel>(
  params: UseAuthenticatedClipboardParams<R, M>,
): UseAuthenticatedClipboardReturnType<R> => {
  const [cutCellChange, setCellCutChange] = useState<Table.SoloCellChange<R> | null>(null);
  const [processCellForClipboard, getCSVData] = useClipboard({ ...params, setCellCutChange });

  const processCellFromClipboard: (p: ProcessCellForExportParams) => Table.RawRowValue =
    hooks.useDynamicCallback((p: ProcessCellForExportParams) => {
      if (!isNil(p.node)) {
        const node: Table.RowNode = p.node;
        const field = p.column.getColId();
        const c = tabling.columns.getColumn(params.columns, field);
        if (!isNil(c) && tabling.columns.isBodyColumn(c)) {
          if (!isNil(cutCellChange)) {
            p = { ...p, value: cutCellChange.oldValue };
            params.onEvent({
              type: "dataChange",
              payload: tabling.events.cellChangeToRowChange(cutCellChange),
            });
            setCellCutChange(null);
          }
          const row: Table.BodyRow<R> = node.data;
          /* The proccessed clipboard value will be undefined in the case that the column is not
             applicable for that row. */
          const processed: Table.InferV<typeof c> | undefined = processValueFromClipboard<R, M>(
            p.value,
            c,
            row,
          );
          return processed === undefined ? "" : processed;
        }
      }
      return "";
    });

  const processDataFromClipboard: (p: ProcessDataFromClipboardParams) => string[][] =
    hooks.useDynamicCallback((p: ProcessDataFromClipboardParams) => {
      const apis: Table.GridApis | null = params.apis;
      if (!isNil(apis)) {
        const rows = tabling.aggrid.getRows(apis.grid);
        const lastIndex =
          apis.grid.getDisplayedRowCount() -
          filter(rows, (r: Table.BodyRow<R>) => tabling.rows.isMarkupRow(r)).length;
        const focusedCell = apis.grid.getFocusedCell();

        /* We enforce that bulk paste operations cannot happen inside of the
           MarkupRow(s) at the bottom of the table. */
        if (!isNil(focusedCell) && tabling.rows.isModelRow(rows[focusedCell.rowIndex])) {
          /* If the first column from the focused cell is not writable, that
             means we are trying to copy and paste with the focused cell being
             associated with a column like the index column. */
          const c = tabling.columns.getColumn(params.columns, focusedCell.column.getColId());
          if (isNil(c) || !tabling.columns.isBodyColumn<R, M>(c)) {
            return [];
          }

          let newRowData: string[][] = [];

          /* First, we need to separate out the data that corresponds to rows
						 that should be added vs. rows that should be updated, and stagger
						 the data corresponding to rows being updated such the paste
						 operation will skip Group Rows. */
          const updateRowData: string[][] = reduce(
            p.data,
            (curr: string[][], arr: string[], i: number) => {
              const rowIndex = focusedCell.rowIndex + i;
              if (rowIndex >= lastIndex) {
                newRowData = [...newRowData, arr];
                return curr;
              } else {
                const node = apis.grid.getDisplayedRowAtIndex(rowIndex);
                if (!isNil(node)) {
                  const row: Table.BodyRow<R> = node.data;
                  /* If the row corresponds to a Group Row, we want to paste the
										 contents into the cell below the Group Row.  To do this, we
										 simply add an empty data set for the Group Row data (since
										 it will not trigger a change anyways) and also append the
                     data at the current iteration. */
                  if (tabling.rows.isGroupRow(row)) {
                    return [...curr, [""], arr];
                  } else if (tabling.rows.isModelRow(row)) {
                    return [...curr, arr];
                  } else {
                    /* If we are trying to paste into a placeholder row, we need
											 to disallow it because we cannot update the row until we
											 get an ID from the original API response to create that
											 row.  If we are trying to paste into a MarkupRow,
                       we do not allow it - because they are at the bottom of
											 the table and new rows occur before the MarkupRow(s). */
                    return curr;
                  }
                } else {
                  console.warn(`Suspicious Behavior: No node found at index ${i}!`);
                  return curr;
                }
              }
            },
            [],
          );
          /* Since we return the data to update existing rows at the end of this
						 function, not the data to create new rows, the values to update the
						 rows will automatically go through AG Grid's valueSetters and
						 clipboard processing callbacks.  However, since we are concerned
						 with data for new rows here, we have to manually apply some of
             that logic. */
          const processedNewRowData = reduce(
            newRowData,
            (curr: Table.RawRowValue[][], rowData: string[]) => {
              const processed = processArrayFromClipboard<R, M>(
                apis.column,
                tabling.columns.filterDataColumns(params.columns),
                focusedCell.column,
                rowData,
              );
              if (isNil(processed)) {
                return curr;
              }
              return [...curr, processed];
            },
            [],
          );

          /* Next, we need to determine what the row data should be for the
						 pasted data corresponding to rows that should be added to the
						 table - and then dispatch an event to add these rows to the table
						 with the data provided. */
          const cols = getWritableColumnsAfter<R, M>(
            apis.column,
            tabling.columns.filterDataColumns(params.columns),
            focusedCell.column,
          );
          const payload = reduce(
            processedNewRowData,
            (curr: Partial<R>[], rowData: Table.RawRowValue[]) =>
              /* TODO: Allow the default new row data to be defined and included
								 in the new row data here - similiarly to how it is defined for
								 the reducers. */
              [
                ...curr,
                reduce(
                  cols,
                  (currD: Partial<R>, ci: Table.BodyColumn<R, M>, index: number): Partial<R> => {
                    if (!isNil(ci.parseIntoFields)) {
                      /* Note: We must apply the logic to nullify certain values
												 because the values here do not pass through the
												 valueGetter in authenticateDataGrid
                         (which would otherwise nullify things like ""). */
                      const parsed = ci.parseIntoFields(rowData[index]);
                      return {
                        ...currD,
                        ...reduce(
                          parsed,
                          (v: Partial<R>, parsedField: Table.ParsedColumnField) => {
                            if (parsedField.value === "") {
                              return {
                                ...v,
                                [parsedField.field]: ci.nullValue,
                              };
                            }
                            return { ...v, [parsedField.field]: parsedField.value };
                          },
                          {} as Partial<R>,
                        ),
                      };
                    } else if (rowData[index] === "") {
                      return {
                        ...currD,
                        /* Note: We do not use the colId for BodyColumns(s), only
												 the `field`, since the `field` is used to populate the
												 rows from the models. */
                        [ci.field]: ci.nullValue,
                      };
                    }
                    return { ...currD, [ci.field]: rowData[index] };
                  },
                  {} as Partial<R>,
                ),
              ],
            [],
          );
          if (payload.length !== 0) {
            params.onEvent({
              type: "rowAdd",
              payload,
              placeholderIds: map(payload, () => tabling.rows.placeholderRowId()),
            });
          }
          /* All we need to do is return the data corresponding to updates to
						 the existing rows because the cell value change handlers will take
						 care of the rest. */
          return updateRowData;
        }
      }
      return [];
    });

  return [
    processCellForClipboard,
    getCSVData,
    processCellFromClipboard,
    processDataFromClipboard,
    setCellCutChange,
  ];
};

export default useAuthenticatedClipboard;
