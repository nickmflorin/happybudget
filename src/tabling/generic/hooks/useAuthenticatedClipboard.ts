import { useState } from "react";
import { isNil, map, reduce, filter } from "lodash";

import { ProcessCellForExportParams, ProcessDataFromClipboardParams } from "@ag-grid-community/core";

import { hooks, util, tabling } from "lib";

import useClipboard, { UseClipboardParams, UseClipboardReturnType } from "./useClipboard";

type UseAuthenticatedClipboardReturnType<R extends Table.RowData> = [
  ...UseClipboardReturnType<R>,
  (p: ProcessCellForExportParams) => string,
  (p: ProcessDataFromClipboardParams) => CSVData,
  (p: Table.SoloCellChange<R> | null) => void
];

type UseAuthenticatedClipboardParams<R extends Table.RowData, M extends Model.RowHttpModel> = Omit<
  UseClipboardParams<R, M>,
  "setCellCutChange"
> & {
  readonly apis: Table.GridApis | null;
  readonly onChangeEvent: (event: Table.ChangeEvent<R, M>) => void;
};

const columnIsWritable = <R extends Table.RowData, M extends Model.RowHttpModel>(
  columns: Table.Column<R, M>[],
  col: Table.AgColumn
): [Table.Column<R, M>, true] | [null, false] | [Table.Column<R, M>, false] => {
  const field = col.getColId();
  if (!isNil(field)) {
    const c = tabling.columns.getColumn(columns, field);
    return !isNil(c) ? [c, c.isWrite !== false] : [c, false];
  }
  return [null, false];
};

const getWritableColumnsAfter = <R extends Table.RowData, M extends Model.RowHttpModel>(
  api: Table.ColumnApi,
  columns: Table.Column<R, M>[],
  col: Table.AgColumn
): Table.Column<R, M>[] => {
  const cols: Table.Column<R, M>[] = [];
  let current: Table.AgColumn | null = col;
  while (!isNil(current)) {
    const [c, writable] = columnIsWritable<R, M>(columns, current);
    if (writable) {
      /* If the column is writable, the first value of the array will be
         non-null so this type coercion is safe. */
      cols.push(c as Table.Column<R, M>);
    }
    current = api.getDisplayedColAfter(current);
  }
  return cols;
};

const processValueFromClipboard = <R extends Table.RowData, M extends Model.RowHttpModel>(
  value: string,
  c: Table.Column<R, M>,
  row?: Table.BodyRow<R> // Will not be defined when adding rows.
) => {
  /* If the value is undefined, it is something wonky with AG Grid.  We should
		 return the current value as to not cause data loss. */
  if (value === undefined) {
    if (!isNil(c.field) && !isNil(row)) {
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
};

const processArrayFromClipboard = <R extends Table.RowData, M extends Model.RowHttpModel>(
  api: Table.ColumnApi,
  cols: Table.Column<R, M>[],
  col: Table.AgColumn,
  arr: string[],
  row?: Table.BodyRow<R> // Will not be defined when adding rows.
): R[keyof R][] | undefined => {
  const columns = getWritableColumnsAfter(api, cols, col);
  if (columns.length < arr.length) {
    console.warn(
      `There are ${cols.length} writable displayed columns, but the data array
      has length ${arr.length} - this most likely means there is an issue with the
      column configuration.`
    );
    /* Because, due to an error, we cannot determine what column each element of
       the array is associated with - we cannot process the clipboard values for
       each element of the array. */
    return undefined;
  }
  return reduce(
    arr,
    (curr: R[keyof R][], value: string, index: number) => {
      const c = columns[index]; // Will be in the array because of the above check.
      return [...curr, processValueFromClipboard(value, c, row)];
    },
    []
  );
};

const useAuthenticatedClipboard = <R extends Table.RowData, M extends Model.RowHttpModel>(
  params: UseAuthenticatedClipboardParams<R, M>
): UseAuthenticatedClipboardReturnType<R> => {
  const [cutCellChange, setCellCutChange] = useState<Table.SoloCellChange<R> | null>(null);
  const [processCellForClipboard, getCSVData] = useClipboard({ ...params, setCellCutChange });

  const processCellFromClipboard: (p: ProcessCellForExportParams) => string = hooks.useDynamicCallback(
    (p: ProcessCellForExportParams) => {
      if (!isNil(p.node)) {
        const node: Table.RowNode = p.node;
        const field = p.column.getColId();
        const c = tabling.columns.getColumn(params.columns, field);
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
          return processValueFromClipboard(p.value, c, row);
        } else {
          console.error(`Could not find column for field ${field}!`);
          return "";
        }
      }
      return "";
    }
  );

  const processDataFromClipboard: (p: ProcessDataFromClipboardParams) => CSVData = hooks.useDynamicCallback(
    (p: ProcessDataFromClipboardParams) => {
      const apis: Table.GridApis | null = params.apis;
      if (!isNil(apis)) {
        const rows = tabling.aggrid.getRows(apis.grid);
        const lastIndex =
          apis.grid.getDisplayedRowCount() -
          filter(rows, (r: Table.BodyRow<R>) => tabling.typeguards.isMarkupRow(r)).length;
        const focusedCell = apis.grid.getFocusedCell();

        /* We enforce that bulk paste operations cannot happen inside of the
           MarkupRow(s) at the bottom of the table. */
        if (!isNil(focusedCell) && tabling.typeguards.isModelRow(rows[focusedCell.rowIndex])) {
          /* If the first column from the focused cell is not writable, that
             means we are trying to copy and paste with the focused cell being
             associated with a column like the index column. */
          // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
          const [c, writable] = columnIsWritable(params.columns, focusedCell.column);
          if (writable === false) {
            return [];
          }

          let newRowData: any[] = [];

          /* First, we need to separate out the data that corresponds to rows
						 that should be added vs. rows that should be updated, and stagger
						 the data corresponding to rows being updated such the paste
						 operation will skip Group Rows. */
          const updateRowData: any[] = reduce(
            p.data,
            (curr: (R[keyof R] | string)[][], arr: string[], i: number) => {
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
                  if (tabling.typeguards.isGroupRow(row)) {
                    return [...curr, [""], arr];
                  } else if (tabling.typeguards.isModelRow(row)) {
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
            []
          );
          /* Since we return the data to update existing rows at the end of this
						 function, not the data to create new rows, the values to update the
						 rows will automatically go through AG Grid's valueSetters and
						 clipboard processing callbacks.  However, since we are concerned
						 with data for new rows here, we have to manually apply some of
             that logic. */
          newRowData = reduce(
            newRowData,
            (curr: R[keyof R][][], rowData: string[], i: number) => {
              const processed = processArrayFromClipboard(apis.column, params.columns, focusedCell.column, rowData);
              if (isNil(processed)) {
                return curr;
              }
              return [...curr, processed];
            },
            []
          );

          /* Next, we need to determine what the row data should be for the
						 pasted data corresponding to rows that should be added to the
						 table - and then dispatch an event to add these rows to the table
						 with the data provided. */
          const cols = getWritableColumnsAfter(apis.column, params.columns, focusedCell.column);
          const payload = reduce(
            newRowData,
            (curr: Partial<R>[], rowData: R[keyof R][], i: number) => {
              /* TODO: Allow the default new row data to be defined and included
								 in the new row data here - similiarly to how it is defined for
								 the reducers. */
              return [
                ...curr,
                reduce(
                  cols,
                  /* eslint-disable indent */
                  (currD: Partial<R>, ci: Table.Column<R, M>, index: number): Partial<R> => {
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
                          (v: Partial<R>, parsedField: Table.ParsedColumnField<R>) => {
                            if (parsedField.value === "") {
                              return {
                                ...v,
                                [parsedField.field]: ci.nullValue === undefined ? null : ci.nullValue
                              };
                            }
                            return { ...v, [parsedField.field]: parsedField.value };
                          },
                          {} as Partial<R>
                        )
                      };
                    } else if (!isNil(ci.field)) {
                      /* Note: We do not use the colId for creating the RowData
											   object - the colId is used for cases where the Column
												 is not associated with a field of the Row Data. */
                      if (rowData[index] === ("" as unknown as R[keyof R])) {
                        return {
                          ...currD,
                          [ci.field]: ci.nullValue === undefined ? null : ci.nullValue
                        };
                      }
                      return { ...currD, [ci.field]: rowData[index] };
                    }
                    return currD;
                  },
                  {} as Partial<R>
                )
              ];
            },
            []
          );
          if (payload.length !== 0) {
            params.onChangeEvent({
              type: "rowAdd",
              payload,
              placeholderIds: map(payload, (py: Partial<R>) => tabling.managers.placeholderRowId())
            });
          }
          /* All we need to do is return the data corresponding to updates to
						 the existing rows because the cell value change handlers will take
						 care of the rest. */
          return updateRowData;
        }
      }
      return [];
    }
  );

  return [processCellForClipboard, getCSVData, processCellFromClipboard, processDataFromClipboard, setCellCutChange];
};

export default useAuthenticatedClipboard;