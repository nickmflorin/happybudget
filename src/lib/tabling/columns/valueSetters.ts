import { ValueSetterParams } from "ag-grid-community";
import { z } from "zod";

import * as localization from "application/config/localization";
import { logger } from "internal";

import * as formatters from "../../util/formatters";
import * as rows from "../rows";
import { CellValue } from "../types";

import * as types from "./types";

const _valueSetter =
  <
    R extends rows.Row<D>,
    D extends rows.RowData = rows.RowData,
    N extends types.ColumnFieldName<R> = types.ColumnFieldName<R>,
    T extends CellValue<R, N> = CellValue<R, N>,
  >(
    field: N,
    valueSetterId: string,
    formatter: (r: rows.ModelRow<D>) => boolean,
  ) =>
  (params: ValueSetterParams<R>): boolean => {
    const row = params.data;
    if (rows.isModelRow(row)) {
      if (params.newValue === undefined) {
        /* The fields of the row data should never be associated with undefined values, but just in
           case AG Grid is doing something funky - we log it. */
        logger.warn(
          { row: row.id, field, rowType: row.rowType },
          `The value setter '${valueSetterId}' detected an undefined value associated with ` +
            `field '${field}' row with ID '${row.id}' and type '${row.rowType}'.  Setting the ` +
            "row value to null.",
        );
        row.data[field] = null as T;
        return true;
      } else if (params.newValue === null) {
        row.data[field] = null as T;
        return true;
      }
      return formatter(row);
    }
    logger.error(
      { row: row.id, field, rowType: row.rowType },
      `The value setter '${valueSetterId}' detected a row that is not a model row, but rather has ` +
        `type '${row.rowType}'.  The value setter for field '${field}' will not be used.`,
    );
    return false;
  };

export const numericValueSetter =
  <
    R extends rows.Row<D>,
    D extends rows.RowData = rows.RowData,
    N extends types.ColumnFieldName<R> = types.ColumnFieldName<R>,
  >(
    field: N,
  ) =>
  (params: ValueSetterParams<R>): boolean =>
    _valueSetter<R, D, N>(field, "numeric", (row: rows.ModelRow<D>) => {
      const result = formatters.FlexibleNumericSchema.safeParse(params.newValue);
      if (result.success) {
        row.data[field] = result as CellValue<R, N>;
        return true;
      }
      return false;
    })(params);

export const percentageToDecimalValueSetter =
  <
    R extends rows.Row<D>,
    D extends rows.RowData = rows.RowData,
    N extends types.ColumnFieldName<R> = types.ColumnFieldName<R>,
  >(
    field: N,
  ) =>
  (params: ValueSetterParams<R>): boolean =>
    _valueSetter<R, D, N>(field, "percentage-to-decimal", (row: rows.ModelRow<D>) => {
      const result = formatters.PercentToDecimalSchema.safeParse(params.newValue);
      if (result.success) {
        row.data[field] = result.data as CellValue<R, N>;
        return true;
      }
      return false;
    })(params);

export const dateValueSetter =
  <
    R extends rows.Row<D>,
    D extends rows.RowData = rows.RowData,
    N extends types.ColumnFieldName<R> = types.ColumnFieldName<R>,
  >(
    field: N,
  ) =>
  (params: ValueSetterParams<R>): boolean =>
    _valueSetter<R, D, N>(field, "date", (row: rows.ModelRow<D>) => {
      const parsed = formatters.dateFormatter(localization.DateLocalizationCodes.API)({
        value: params.newValue,
        logError: false,
        strict: false,
      });
      if (parsed !== null) {
        row.data[field] = parsed as CellValue<R, N>;
        return true;
      }
      /* If the value cannot be properly converted to a date, do not set the value as null - that
         will clear the current value in the cell.  Simply return false to indicate that the value
         should not be updated. */
      return false;
    })(params);

export const dateTimeValueSetter =
  <
    R extends rows.Row<D>,
    D extends rows.RowData = rows.RowData,
    N extends types.ColumnFieldName<R> = types.ColumnFieldName<R>,
  >(
    field: N,
  ) =>
  (params: ValueSetterParams<R>): boolean =>
    _valueSetter<R, D, N>(field, "datetime", (row: rows.ModelRow<D>) => {
      const parsed = formatters.dateTimeFormatter(localization.DateTimeLocalizationCodes.API)({
        value: params.newValue,
        logError: false,
        strict: false,
      });
      if (parsed !== null) {
        row.data[field] = parsed as CellValue<R, N>;
        return true;
      }
      /* If the value cannot be properly converted to a date, do not set the value as null - that
         will clear the current value in the cell.  Simply return false to indicate that the value
         should not be updated. */
      return false;
    })(params);

export const emailValueSetter =
  <
    R extends rows.Row<D>,
    D extends rows.RowData = rows.RowData,
    N extends types.ColumnFieldName<R> = types.ColumnFieldName<R>,
  >(
    field: N,
  ) =>
  (params: ValueSetterParams<R>): boolean =>
    _valueSetter<R, D, N>(field, "email", (row: rows.ModelRow<D>) => {
      const parsed = z.string().email().safeParse(params.newValue);
      if (parsed.success) {
        row.data[field] = parsed as CellValue<R, N>;
        return true;
      }
      return false;
    })(params);
