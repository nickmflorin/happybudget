import { useMemo } from "react";
import { isNil, filter, map, includes, reduce } from "lodash";

import { ProcessCellForExportParams } from "@ag-grid-community/core";

import { hooks, tabling } from "lib";

import useColumnHelpers from "./useColumnHelpers";

export type UseClipboardReturnType<R extends Table.RowData> = [
  (params: ProcessCellForExportParams) => string,
  (fields?: (keyof R | string)[]) => CSVData
];

export type UseClipboardParams<R extends Table.RowData, M extends Model.HttpModel> = {
  readonly apis: Table.GridApis | null;
  readonly columns: Table.Column<R, M>[];
  readonly setCellCutChange?: (ch: Table.SoloCellChange<R> | null) => void;
};

const useClipboard = <R extends Table.RowData, M extends Model.HttpModel>(
  params: UseClipboardParams<R, M>
): UseClipboardReturnType<R> => {
  /* eslint-disable no-unused-vars */
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const [getColumn, callWithColumn] = useColumnHelpers(params.columns);

  const processCellValueForClipboard = useMemo(
    () =>
      (column: Table.Column<R, M>, row: Table.BodyRow<R>, value: any): string => {
        const processor = column.processCellForClipboard;
        if (!isNil(processor)) {
          return String(processor(row.data));
        } else {
          // The value should never be undefined at this point.
          if (value === undefined) {
            /* eslint-disable no-console */
            console.warn("Encountered undefined value when it was not expected!");
          }
          if (value === column.nullValue || value === undefined) {
            return "";
          } else if (typeof value === "string" || typeof value === "number") {
            return String(value);
          }
          return "";
        }
      },
    []
  );

  const processCellForClipboard: (p: ProcessCellForExportParams) => string = hooks.useDynamicCallback(
    (p: ProcessCellForExportParams): string => {
      if (!isNil(p.node)) {
        const c: Table.Column<R, M> | null = getColumn(p.column.getColId());
        if (!isNil(c)) {
          params.setCellCutChange?.(null);
          const row: Table.BodyRow<R> = p.node.data;
          return processCellValueForClipboard(c, row, p.value);
        }
      }
      return "";
    }
  );

  const getCSVData = hooks.useDynamicCallback((fields?: (keyof R)[]) => {
    if (!isNil(params.apis)) {
      const cs: Table.Column<R, M>[] = filter(
        params.columns,
        (column: Table.Column<R, M>) =>
          column.canBeExported !== false && (isNil(fields) || includes(fields, tabling.columns.normalizedField(column)))
      );
      const csvData: CSVData = [map(cs, (col: Table.Column<R, M>) => col.headerName || "")];
      params.apis.grid.forEachNode((node: Table.RowNode, index: number) => {
        const row: Table.BodyRow<R> = node.data;
        if (tabling.typeguards.isDataRow(row)) {
          csvData.push(
            reduce(
              cs,
              (current: CSVRow, column: Table.Column<R, M>) => [
                ...current,
                !isNil(column.field) ? processCellValueForClipboard(column, row, row.data[column.field]) : ""
              ],
              []
            )
          );
        }
      });
      return csvData;
    }
    return [];
  });

  return [processCellForClipboard, getCSVData];
};

export default useClipboard;
