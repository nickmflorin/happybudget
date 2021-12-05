import { isNil, filter, map, includes, reduce } from "lodash";

import { ProcessCellForExportParams } from "@ag-grid-community/core";

import { hooks, tabling } from "lib";

export type UseClipboardReturnType<R extends Table.RowData> = [
  (params: ProcessCellForExportParams) => string,
  (fields?: (keyof R | string)[]) => CSVData
];

export type UseClipboardParams<R extends Table.RowData, M extends Model.RowHttpModel> = {
  readonly apis: Table.GridApis | null;
  readonly columns: Table.Column<R, M>[];
  readonly setCellCutChange?: (ch: Table.SoloCellChange<R> | null) => void;
};

const processCellValueForClipboard = <R extends Table.RowData, M extends Model.RowHttpModel>(
  column: Table.Column<R, M>,
  row: Table.BodyRow<R>,
  value: any
): string => {
  const processor = column.processCellForClipboard;
  if (!isNil(processor)) {
    return String(processor(row.data));
  } else {
    // The value should never be undefined at this point.
    if (value === undefined) {
      console.warn("Encountered undefined value when it was not expected!");
    }
    if (value === column.nullValue || value === undefined) {
      return "";
    } else if (typeof value === "string" || typeof value === "number") {
      return String(value);
    }
    return "";
  }
};

const useClipboard = <R extends Table.RowData, M extends Model.RowHttpModel>(
  params: UseClipboardParams<R, M>
): UseClipboardReturnType<R> => {
  const processCellForClipboard: (p: ProcessCellForExportParams) => string = hooks.useDynamicCallback(
    (p: ProcessCellForExportParams): string => {
      if (!isNil(p.node)) {
        const c: Table.Column<R, M> | null = tabling.columns.getColumn(params.columns, p.column.getColId());
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
    const gridApi = params.apis?.grid;
    if (!isNil(gridApi)) {
      const cs: Table.Column<R, M>[] = filter(
        params.columns,
        (column: Table.Column<R, M>) =>
          column.canBeExported !== false &&
          (isNil(fields) || includes(fields as string[], tabling.columns.normalizedField<R, M>(column)))
      );
      const csvData: CSVData = [map(cs, (col: Table.Column<R, M>) => col.headerName || "")];
      gridApi.forEachNode((node: Table.RowNode, index: number) => {
        const row: Table.BodyRow<R> = node.data;
        const rows = tabling.aggrid.getRows(gridApi);
        if (tabling.typeguards.isDataRow(row)) {
          csvData.push(
            reduce(
              cs,
              (current: CSVRow, column: Table.Column<R, M>) => {
                let value: any = null;
                if (!isNil(column.valueGetter)) {
                  value = column.valueGetter(
                    row,
                    filter(rows, (r: Table.Row<R>) => tabling.typeguards.isBodyRow(r)) as Table.BodyRow<R>[]
                  );
                } else if (!isNil(column.field)) {
                  value = row.data[column.field];
                }
                if (!isNil(column.processCellForCSV)) {
                  return [...current, column.processCellForCSV(row.data)];
                }
                return [...current, processCellValueForClipboard(column, row, value)];
              },
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
