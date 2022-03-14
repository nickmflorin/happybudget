import { isNil, filter, map, includes, reduce } from "lodash";

import { ProcessCellForExportParams } from "@ag-grid-community/core";

import { hooks, tabling, notifications } from "lib";

export type UseClipboardReturnType = [(params: ProcessCellForExportParams) => string, (fields?: string[]) => CSVData];

export type UseClipboardParams<R extends Table.RowData, M extends Model.RowHttpModel> = {
  readonly apis: Table.GridApis | null;
  readonly columns: Table.Column<R, M>[];
  readonly setCellCutChange?: (ch: Table.SoloCellChange<R> | null) => void;
};

const processCellValueForClipboard = <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
  column: Table.DataColumn<R, M>,
  row: Table.BodyRow<R>,
  value: Table.RawRowValue
): string => {
  const processor = column.processCellForClipboard;
  if (!isNil(processor) && tabling.rows.isModelRow(row)) {
    return String(processor(row.data));
  } else {
    // The value should never be undefined at this point.
    if (value === undefined) {
      console.warn(
        `Encountered undefined value for field ${column.field} when it was not expected, row=${notifications.objToJson(
          row
        )}.`
      );
      return "";
    } else if (tabling.columns.isBodyColumn(column) && column.nullValue === value) {
      return "";
    } else {
      return String(value);
    }
  }
};

const useClipboard = <R extends Table.RowData, M extends Model.RowHttpModel>(
  params: UseClipboardParams<R, M>
): UseClipboardReturnType => {
  const processCellForClipboard: (p: ProcessCellForExportParams) => string = hooks.useDynamicCallback(
    (p: ProcessCellForExportParams): string => {
      if (!isNil(p.node)) {
        const c: Table.RealColumn<R, M> | null = tabling.columns.getRealColumn(params.columns, p.column.getColId());
        if (!isNil(c) && tabling.columns.isDataColumn(c)) {
          params.setCellCutChange?.(null);
          const row: Table.BodyRow<R> = p.node.data;
          return processCellValueForClipboard<R, M>(c, row, p.value);
        }
      }
      return "";
    }
  );

  const getCSVData = hooks.useDynamicCallback((fields?: string[]) => {
    const gridApi = params.apis?.grid;
    if (!isNil(gridApi)) {
      const cs: Table.DataColumn<R, M>[] = filter(
        params.columns,
        (column: Table.Column<R, M>) =>
          tabling.columns.isDataColumn(column) &&
          !isNil(column.field) &&
          column.canBeExported !== false &&
          (isNil(fields) || includes(fields, column.field))
      ) as Table.DataColumn<R, M>[];
      const csvData: CSVData = [map(cs, (col: Table.DataColumn<R, M>) => col.headerName || "")];
      gridApi.forEachNode((node: Table.RowNode) => {
        const row: Table.BodyRow<R> = node.data;
        const rows = tabling.aggrid.getRows(gridApi);
        if (tabling.rows.isDataRow(row)) {
          csvData.push(
            reduce(
              cs,
              (current: CSVRow, column: Table.DataColumn<R, M>) => {
                if (!isNil(column.processCellForCSV)) {
                  return [...current, column.processCellForCSV(row.data)];
                }
                let processedValue: Table.RawRowValue = null;
                if (!isNil(column.valueGetter)) {
                  processedValue = column.valueGetter(
                    row,
                    filter(rows, (r: Table.Row<R>) => tabling.rows.isBodyRow(r)) as Table.BodyRow<R>[]
                  );
                } else if (!isNil(column.field)) {
                  processedValue = row.data[column.field];
                }
                return [...current, processCellValueForClipboard<R, M>(column, row, processedValue)];
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
