import { orderBy } from "lodash";

import { logger } from "internal";

import * as model from "../../model";
import { removeObjAttributes } from "../../util";
import * as rows from "../rows";
import { CellValue } from "../types";

import * as typeguards from "./typeguards";
import * as types from "./types";

export const editColumnRowConfigIsApplicable = <
  R extends rows.RowOfType<Exclude<rows.BodyRowType, "placeholder">>,
>(
  c: types.EditColumnRowConfig<R>,
  row: rows.RowOfType<Exclude<rows.BodyRowType, "placeholder">>,
  behavior?: rows.EditRowActionBehavior,
): boolean => {
  let condition = c.typeguard(row);
  if (behavior !== undefined) {
    condition = condition && c.behavior === behavior;
  }
  if (c.conditional !== undefined) {
    condition = condition && c.conditional(row as R);
  }
  return condition;
};

export const getEditColumnRowConfig = <
  R extends rows.RowOfType<Exclude<rows.BodyRowType, "placeholder">>,
>(
  config: types.EditColumnRowConfig<R>[],
  row: R,
  behavior?: rows.EditRowActionBehavior,
): types.EditColumnRowConfig<R> | null => {
  const filtered = config.filter((c: types.EditColumnRowConfig<R>) =>
    editColumnRowConfigIsApplicable(c, row, behavior),
  );
  return filtered.length !== 0 ? filtered[0] : null;
};

export const normalizedField = <
  R extends rows.Row,
  M extends model.RowTypedApiModel,
  N extends types.ColumnFieldName<R>,
  T extends CellValue<R, N>,
>(
  col: types.RealColumn<R, M, N, T>,
): string =>
  typeguards.isBodyColumn(col) ? col.field : typeguards.isActionColumn(col) ? col.colId : col.field;

export type Case = "pdf" | "aggrid";

export const getColumnRowValue = <
  R extends rows.Row,
  M extends model.RowTypedApiModel,
  N extends types.ColumnFieldName<R>,
  T extends CellValue<R, N>,
>(
  col: types.DataColumn<R, M, N, T>,
  row: rows.RowSubType<R, rows.BodyRowType>,
  rws: rows.RowSubType<R, rows.BodyRowType>[],
  tableCase: Case = "aggrid",
): T => {
  const returnNullWithWarning = (fld: string) => {
    // The row managers should prevent this, but you never know.
    if (rows.isModelRow(row)) {
      logger.error(
        { row: JSON.stringify(row), field: fld, modelType: row.modelType, id: row.id },
        `Undefined value for row ${row.id} (type = ${row.rowType}, modelType = ${row.modelType}) ` +
          `encountered for field ${fld}! Returning ${String(col.nullValue)}.`,
      );
    } else {
      logger.error(
        { row: JSON.stringify(row), field: fld, id: row.id },
        `Undefined value for row ${row.id} (type = ${row.rowType}) ` +
          `encountered for field ${fld}! Returning ${String(col.nullValue)}.`,
      );
    }
    return col.nullValue;
  };

  const valueGetter = tableCase === "aggrid" ? col.valueGetter : col.pdfValueGetter;

  /* If the column does not define a valueGetter, we need to pull the row value from the underlying
     row data. */
  if (valueGetter === undefined) {
    if (rows.isMarkupRow(row)) {
      if (col.markupField !== undefined) {
        if (row.data[col.markupField] === undefined) {
          // The row managers should prevent this, but you never know.
          return returnNullWithWarning(col.markupField);
        }
        return row.data[col.markupField] as T;
      }
      /* In this case, the column is not applicable for a MarkupRow, so we just return the nullValue
         and do not issue a warning. */
      return col.nullValue;
    } else if (rows.isGroupRow(row)) {
      if (col.groupField !== undefined) {
        if (row.data[col.groupField] === undefined) {
          // The row managers should prevent this, but you never know.
          return returnNullWithWarning(col.groupField);
        }
        return row.data[col.groupField] as T;
      }
      /* In this case, the column is not applicable for a GroupRow, so we just return the nullValue
         and do not issue a warning. */
      return col.nullValue;
      // The field should always be applicable for the model row case.
    } else if (row.data[col.field] === undefined) {
      // The row managers should prevent this, but you never know.
      return returnNullWithWarning(col.field);
    }
    return row.data[col.field] as unknown as T;
  }
  return valueGetter(row, rws);
};

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const getColumn = <C extends types.Column<any, any, any, any>>(
  columns: C[],
  field: string,
  flt?: (c: C) => boolean,
): C | null => {
  const realColumnLookupFilter = (c: C) =>
    typeguards.isRealColumn(c) && normalizedField(c) === field;

  const fakeColumnLooupFilter = (c: C) => typeguards.isFakeColumn(c) && c.field === field;

  const baseFlt =
    flt === undefined
      ? (c: C) => realColumnLookupFilter(c) || fakeColumnLooupFilter(c)
      : (c: C) => (flt(c) && realColumnLookupFilter(c)) || fakeColumnLooupFilter(c);
  const foundColumn = columns.filter(baseFlt);
  if (foundColumn.length === 1) {
    return foundColumn[0];
  } else if (foundColumn.length === 0) {
    logger.error(`Could not find column for field ${field}!`);
    return null;
  }
  throw new Error(`Multiple columns returned for field ${field}!`);
};

export const getColumnOfType = <
  I extends types.ColumnTypeId,
  R extends rows.Row,
  M extends model.RowTypedApiModel,
  N extends types.ColumnFieldName<R>,
  T extends CellValue<R, N>,
  CA extends types.Columns<R, M, N, T>,
>(
  columns: CA,
  field: string,
  cType: I | I[],
): types.ColumnOfType<I, R, M, N, T> | null =>
  getColumn(columns, field, (c: types.Column<R, M, N, T>) =>
    Array.isArray(cType) ? cType.includes(c.cType as typeof cType[number]) : c.cType === cType,
  ) as types.ColumnOfType<I, R, M, N, T> | null;

export const getRealColumn = <
  R extends rows.Row,
  M extends model.RowTypedApiModel,
  N extends types.ColumnFieldName<R>,
  T extends CellValue<R, N>,
  CA extends types.Columns<R, M, N, T>,
>(
  columns: CA,
  field: string,
) =>
  getColumnOfType<"action" | "body" | "calculated", R, M, N, T, CA>(columns, field, [
    types.ColumnTypeIds.ACTION,
    types.ColumnTypeIds.BODY,
    types.ColumnTypeIds.CALCULATED,
  ]);

export const getBodyColumn = <
  R extends rows.Row,
  M extends model.RowTypedApiModel,
  N extends types.ColumnFieldName<R>,
  T extends CellValue<R, N>,
  CA extends types.Columns<R, M, N, T>,
>(
  columns: CA,
  field: string,
) => getColumnOfType<"body", R, M, N, T, CA>(columns, field, types.ColumnTypeIds.BODY);

export const getActionColumn = <
  R extends rows.Row,
  M extends model.RowTypedApiModel,
  N extends types.ColumnFieldName<R>,
  T extends CellValue<R, N>,
  CA extends types.Columns<R, M, N, T>,
>(
  columns: CA,
  field: string,
) => getColumnOfType<"action", R, M, N, T, CA>(columns, field, types.ColumnTypeIds.ACTION);

export const getCalculatedColumn = <
  R extends rows.Row,
  M extends model.RowTypedApiModel,
  N extends types.ColumnFieldName<R>,
  T extends CellValue<R, N>,
  CA extends types.Columns<R, M, N, T>,
>(
  columns: CA,
  field: string,
) => getColumnOfType<"calculated", R, M, N, T, CA>(columns, field, types.ColumnTypeIds.CALCULATED);

export const filterColumnsOfType = <
  I extends types.ColumnTypeId,
  R extends rows.Row,
  M extends model.RowTypedApiModel,
  N extends types.ColumnFieldName<R>,
  T extends CellValue<R, N>,
  CA extends types.Columns<R, M, N, T>,
>(
  columns: CA,
  cType: I | I[],
): types.ColumnOfType<I, R, M, N, T>[] =>
  ([...columns] as types.Column<R, M, N, T>[]).filter((col: types.Column<R, M, N, T>) =>
    Array.isArray(cType)
      ? cType.map((v: I) => typeguards.isColumnOfType<I, R, M, N, T>(col, v)).includes(true)
      : typeguards.isColumnOfType<I, R, M, N, T>(col, cType),
  ) as types.ColumnOfType<I, R, M, N, T>[];

export const filterActionColumns = <
  R extends rows.Row,
  M extends model.RowTypedApiModel,
  N extends types.ColumnFieldName<R>,
  T extends CellValue<R, N>,
  CA extends types.Columns<R, M, N, T>,
>(
  columns: CA,
) => filterColumnsOfType<"action", R, M, N, T, CA>(columns, "action");

export const filterFakeColumns = <
  R extends rows.Row,
  M extends model.RowTypedApiModel,
  N extends types.ColumnFieldName<R>,
  T extends CellValue<R, N>,
  CA extends types.Columns<R, M, N, T>,
>(
  columns: CA,
) => filterColumnsOfType<"fake", R, M, N, T, CA>(columns, "fake");

export const filterCalculatedColumns = <
  R extends rows.Row,
  M extends model.RowTypedApiModel,
  N extends types.ColumnFieldName<R>,
  T extends CellValue<R, N>,
  CA extends types.Columns<R, M, N, T>,
>(
  columns: CA,
) => filterColumnsOfType<"calculated", R, M, N, T, CA>(columns, "calculated");

export const filterDataColumns = <
  R extends rows.Row,
  M extends model.RowTypedApiModel,
  N extends types.ColumnFieldName<R>,
  T extends CellValue<R, N>,
  CA extends types.Columns<R, M, N, T>,
>(
  columns: CA,
) => filterColumnsOfType<"body" | "calculated", R, M, N, T, CA>(columns, ["body", "calculated"]);

export const filterBodyColumns = <
  R extends rows.Row,
  M extends model.RowTypedApiModel,
  N extends types.ColumnFieldName<R>,
  T extends CellValue<R, N>,
  CA extends types.Columns<R, M, N, T>,
>(
  columns: CA,
) => filterColumnsOfType<"body", R, M, N, T, CA>(columns, "body");

export const filterRealColumns = <
  R extends rows.Row,
  M extends model.RowTypedApiModel,
  N extends types.ColumnFieldName<R>,
  T extends CellValue<R, N>,
  CA extends types.Columns<R, M, N, T>,
>(
  columns: CA,
) =>
  filterColumnsOfType<"body" | "calculated" | "action", R, M, N, T, CA>(columns, [
    "body",
    "calculated",
    "action",
  ]);

export const filterModelColumns = <
  R extends rows.Row,
  M extends model.RowTypedApiModel,
  N extends types.ColumnFieldName<R>,
  T extends CellValue<R, N>,
  CA extends types.Columns<R, M, N, T>,
>(
  columns: CA,
) =>
  filterColumnsOfType<"body" | "calculated" | "fake", R, M, N, T, CA>(columns, [
    "body",
    "calculated",
    "fake",
  ]);

export const isEditable = <
  R extends rows.Row,
  M extends model.RowTypedApiModel,
  N extends types.ColumnFieldName<R>,
  T extends CellValue<R, N>,
  C extends types.BodyColumn<R, M, N, T> = types.BodyColumn<R, M, N, T>,
>(
  column: C,
  row: rows.RowSubType<R, rows.BodyRowType>,
): boolean => {
  if (column.editable === undefined) {
    return false;
  } else if (typeof column.editable === "boolean") {
    return column.editable;
  }
  return column.editable({ row });
};

export const parseBaseColumn = <
  R extends rows.Row,
  M extends model.RowTypedApiModel,
  N extends types.ColumnFieldName<R>,
  T extends CellValue<R, N>,
  C extends types.Column<R, M, N, T> = types.Column<R, M, N, T>,
>(
  column: C,
): types.BaseAgColumn<R> => {
  if (typeguards.isFakeColumn<R, M, N, T>(column)) {
    return removeObjAttributes<C>(column, [
      "cType",
      "getRowValue",
      "nullValue",
      "isApplicableForModel",
      "isApplicableForRowType",
    ]) as types.BaseAgColumn<R>;
  } else if (typeguards.isActionColumn<R, M, N, T>(column)) {
    return removeObjAttributes<C>(column, ["cType", "footer"]) as types.BaseAgColumn<R>;
  } else if (typeguards.isCalculatedColumn<R, M, N, T>(column)) {
    return removeObjAttributes<C>(column, [
      "markupField",
      "groupField",
      "footer",
      "page",
      "requiresAuthentication",
      "index",
      "canBeExported",
      "canBeHidden",
      "isRead",
      "dataType",
      "nullValue",
      "cType",
      "defaultHidden",
      "includeInPdf",
      "pdfWidth",
      "pdfHeaderName",
      "pdfFooter",
      "pdfFooterValueGetter",
      "pdfHeaderCellProps",
      "pdfCellProps",
      "pdfFlexGrow",
      "isApplicableForModel",
      "isApplicableForRowType",
      "pdfValueGetter",
      "pdfChildFooter",
      "pdfCellRenderer",
      "pdfFormatter",
      "onCellDoubleClicked",
      "processCellForClipboard",
      "processCellForCSV",
      "getHttpValue",
      "getRowValue",
    ]) as types.BaseAgColumn<R>;
  } else if (typeguards.isBodyColumn<R, M, N, T>(column)) {
    return removeObjAttributes<C>(column, [
      "markupField",
      "groupField",
      "footer",
      "page",
      "selectable",
      "requiresAuthentication",
      "index",
      "canBeExported",
      "canBeHidden",
      "dataType",
      "isRead",
      "cType",
      "nullValue",
      "parsedFields",
      "isApplicableForModel",
      "isApplicableForRowType",
      "smartInference",
      "defaultHidden",
      "includeInPdf",
      "pdfWidth",
      "pdfHeaderName",
      "pdfFooter",
      "pdfFooterValueGetter",
      "pdfHeaderCellProps",
      "pdfCellProps",
      "pdfFlexGrow",
      "pdfValueGetter",
      "pdfChildFooter",
      "pdfCellRenderer",
      "pdfFormatter",
      "onDataChange",
      "parseIntoFields",
      "refreshColumns",
      "onCellDoubleClicked",
      "processCellForClipboard",
      "processCellForCSV",
      "processCellFromClipboard",
      "getHttpValue",
      "getRowValue",
    ]) as types.BaseAgColumn<R>;
  }
  return column as types.BaseAgColumn<R>;
};

export const normalizePdfColumnWidths = <
  R extends rows.Row,
  M extends model.RowTypedApiModel,
  N extends types.ColumnFieldName<R>,
  T extends CellValue<R, N>,
  CA extends types.Columns<R, M, N, T>,
>(
  columns: CA,
  flt?: (c: types.DataColumn<R, M, N, T>) => boolean,
): types.BodyColumn<R, M, N, T>[] => {
  const baseFilter = (c: types.DataColumn<R, M, N, T>) =>
    flt !== undefined ? c.includeInPdf !== false && flt(c) : c.includeInPdf !== false;

  // Determine the total width of all the columns that have a specified width.
  const totalSpecifiedWidth = ([...columns] as types.Column<R, M, N, T>[]).reduce(
    (prev: number, c: types.Column<R, M, N, T>) => {
      if (typeguards.isDataColumn<R, M, N, T>(c) && baseFilter(c) && c.pdfWidth !== undefined) {
        return prev + c.pdfWidth;
      }
      return prev;
    },
    0.0,
  );

  /* Determine if there is a column that should flex grow to fill remaining space in the case that
     the total width of the visible columns is less than 1.0. */
  const flexColumns = ([...columns] as types.Column<R, M, N, T>[]).filter(
    (c: types.Column<R, M, N, T>) =>
      typeguards.isDataColumn<R, M, N, T>(c) && baseFilter(c) && c.pdfFlexGrow !== undefined,
  ) as types.DataColumn<R, M, N, T>[];
  if (flexColumns.length !== 0 && totalSpecifiedWidth < 1.0) {
    const flexColumn = flexColumns[0];

    /* If there are multiple columns with 'pdfFlexGrow' specified, we cannot apply the flex to all
       of the columns because we would have to split the leftover space up between the columns with
       'pdfFlexGrow' which can get hairy/complicated - and is not needed at this point. */
    if (flexColumns.length !== 1) {
      const flexColumnFields: (string | undefined)[] = flexColumns.map(
        (c: types.DataColumn<R, M, N, T>) => c.field,
      );
      logger.warn(
        { fields: JSON.stringify(flexColumnFields) },
        `Found multiple columns, ${flexColumnFields.join(", ")}, with 'pdfFlexGrow' specified.
        Since only one column can flex grow in the PDF, only the column ${flexColumnFields[0] || ""}
        will have 'pdfFlexGrow' applied.`,
      );
    }
    /* If the remaining non-flex columns do not specify a width, then we cannot apply 'pdfFlexGrow'
       to the remaining column because we do not know how much space should be available. */
    const columnsWithoutSpecifiedWidth = ([...columns] as types.Column<R, M, N, T>[]).filter(
      (c: types.Column<R, M, N, T>) =>
        typeguards.isDataColumn<R, M, N, T>(c) &&
        baseFilter(c) &&
        c.pdfWidth === undefined &&
        flexColumn.field !== c.field,
    ) as types.DataColumn<R, M, N, T>[];
    if (columnsWithoutSpecifiedWidth.length !== 0) {
      const missingWidthFields: (string | undefined)[] = columnsWithoutSpecifiedWidth.map(
        (c: types.DataColumn<R, M, N, T>) => c.field,
      );
      logger.warn(
        { field: flexColumn.field },
        `Cannot apply 'pdfFlexGrow' to column ${flexColumn.field} because
        columns ${missingWidthFields.join(", ")} do not specify a 'pdfWidth'.`,
      );
    } else {
      /* Return the columns as they were but only changing the width of the column with
         'pdfFlexGrow' applied to take up the remaining space in the table. */
      return ([...columns] as types.Column<R, M, N, T>[]).map((c: types.Column<R, M, N, T>) => {
        if (typeguards.isDataColumn<R, M, N, T>(c) && c.field === flexColumn.field) {
          return { ...c, pdfWidth: 1.0 - totalSpecifiedWidth };
        }
        return c;
      }) as types.BodyColumn<R, M, N, T>[];
    }
  }

  /* Determine what the default width should be for columns that do not specify it based on the
     leftover width available after the columns that specify a width are inserted. */
  let defaultWidth = 0;
  if (totalSpecifiedWidth < 1.0) {
    defaultWidth =
      (1.0 - totalSpecifiedWidth) /
      ([...columns] as types.Column<R, M, N, T>[]).filter(
        (c: types.Column<R, M, N, T>) =>
          typeguards.isDataColumn<R, M, N, T>(c) && baseFilter(c) && c.pdfWidth === undefined,
      ).length;
  }
  // Calculate total width of all the columns.
  const totalWidth = ([...columns] as types.Column<R, M, N, T>[]).reduce(
    (prev: number, c: types.Column<R, M, N, T>) =>
      typeguards.isDataColumn<R, M, N, T>(c) && baseFilter(c)
        ? prev + (c.pdfWidth || defaultWidth)
        : prev,
    0.0,
  );
  if (totalWidth !== 0.0) {
    // Normalize the width of each column such that the sum of all column widths is 1.0.
    return ([...columns] as types.Column<R, M, N, T>[]).map((c: types.Column<R, M, N, T>) =>
      typeguards.isDataColumn<R, M, N, T>(c)
        ? {
            ...c,
            pdfWidth: baseFilter(c) ? (c.pdfWidth || defaultWidth) / totalWidth : c.pdfWidth,
          }
        : c,
    ) as types.BodyColumn<R, M, N, T>[];
  }
  return [...columns] as types.BodyColumn<R, M, N, T>[];
};

/* type ColumnTypeVariantOptions = {
     header?: boolean;
     pdf?: boolean;
   }; */

/* export const getColumnTypeCSSStyle = (
     type: types.ColumnDataTypeId | types.ColumnDataType,
     options: ColumnTypeVariantOptions = { header: false, pdf: false },
   ): React.CSSProperties => {
     let colType: types.ColumnDataType;
     if (typeof type === "string") {
       const ct: types.ColumnDataType | undefined = find(ColumnTypes, { id: type });
       if (ct === undefined) {
         return {};
       }
       colType = ct;
     } else {
       colType = type;
     }
     let style = colType.style || {};
     if (options.header === true && colType.headerOverrides !== undefined) {
       style = { ...style, ...(colType.headerOverrides.style || {}) };
     }
     if (options.pdf === true && colType.pdfOverrides !== undefined) {
       style = { ...style, ...(colType.pdfOverrides.style || {}) };
     }
     return style;
   }; */

type ColumnUpdate<
  C extends types.RealColumn<R, M, N, T>,
  R extends rows.Row,
  M extends model.RowTypedApiModel,
  N extends types.ColumnFieldName<R>,
  T extends CellValue<R, N>,
> = Partial<C> | ((p: C) => Partial<C>);

type ColumnTypeUpdates<
  R extends rows.Row,
  M extends model.RowTypedApiModel,
  N extends types.ColumnFieldName<R>,
  T extends CellValue<R, N>,
> = {
  readonly body?: ColumnUpdate<types.BodyColumn<R, M, N, T>, R, M, N, T>;
  readonly action?: ColumnUpdate<types.ActionColumn<R, M, N, T>, R, M, N, T>;
  readonly calculated?: ColumnUpdate<types.CalculatedColumn<R, M, N, T>, R, M, N, T>;
};

export const normalizeColumns = <
  R extends rows.Row,
  M extends model.RowTypedApiModel,
  N extends types.ColumnFieldName<R>,
  T extends CellValue<R, N>,
  CA extends types.Columns<R, M, N, T>,
>(
  columns: CA,
  updates: Partial<{
    [key: string]: ColumnUpdate<types.BodyColumn<R, M, N, T>, R, M, N, T>;
  }> = {},
  typeUpdates: ColumnTypeUpdates<R, M, N, T> = {},
): CA => {
  const normalizeUpdate = <C extends types.RealColumn<R, M, N, T>>(
    d: ColumnUpdate<C, R, M, N, T> | undefined,
    c: C,
  ): Partial<C> | undefined => (typeof d === "function" ? d(c) : d);

  const getUpdateForColumn = <C extends types.RealColumn<R, M, N, T>>(
    c: C,
  ): Partial<C> | undefined => {
    if (updates !== undefined) {
      const cTypeUpdate = typeUpdates[c.cType];
      if (cTypeUpdate !== undefined) {
        return normalizeUpdate<C>(cTypeUpdate as ColumnUpdate<C, R, M, N, T>, c);
      } else {
        const id = normalizedField<R, M, N, T>(c);
        return normalizeUpdate<C>(updates[id] as ColumnUpdate<C, R, M, N, T>, c);
      }
    }
    return {};
  };

  const updateColumn = <C extends types.Column<R, M, N, T>>(c: C): C => {
    if (typeguards.isRealColumn<R, M, N, T>(c)) {
      return { ...c, ...getUpdateForColumn(c) } as C;
    }
    return c;
  };

  return [
    ...([...columns] as types.Column<R, M, N, T>[]).map((c: types.Column<R, M, N, T>) =>
      updateColumn(c),
    ),
  ] as CA;
};

export const orderColumns = <
  R extends rows.Row,
  M extends model.RowTypedApiModel,
  N extends types.ColumnFieldName<R>,
  T extends CellValue<R, N>,
  CA extends types.Columns<R, M, N, T>,
>(
  columns: CA,
): CA => {
  const actionColumns = filterActionColumns<R, M, N, T, CA>(columns);
  const calculatedColumns = filterCalculatedColumns<R, M, N, T, CA>(columns);
  const bodyColumns = filterBodyColumns<R, M, N, T, CA>(columns);

  return [
    /* It doesn't matter where the fake columns go in the ordering because they are not displayed -
       all we care about is that they are present. */
    ...filterFakeColumns<R, M, N, T, CA>(columns),
    ...orderBy(
      actionColumns.filter((c: types.ActionColumn<R, M, N, T>) => c.index !== undefined),
      ["index"],
      ["asc"],
    ),
    ...actionColumns.filter((c: types.ActionColumn<R, M, N, T>) => c.index === undefined),
    ...orderBy(
      bodyColumns.filter((c: types.BodyColumn<R, M, N, T>) => c.index !== undefined),
      ["index"],
      ["asc"],
    ),
    ...bodyColumns.filter((c: types.BodyColumn<R, M, N, T>) => c.index === undefined),
    ...orderBy(
      calculatedColumns.filter((c: types.CalculatedColumn<R, M, N, T>) => c.index !== undefined),
      ["index"],
      ["asc"],
    ),
    ...calculatedColumns.filter((c: types.CalculatedColumn<R, M, N, T>) => c.index === undefined),
  ] as CA;
};
