import React from "react";
import { find, isNil, reduce, filter, orderBy, map } from "lodash";

import * as Models from "./models";
import * as typeguards from "./typeguards";

export const editColumnRowConfigIsApplicable = <R extends Table.RowData, RW extends Table.NonPlaceholderBodyRow<R>>(
  c: Table.EditColumnRowConfig<R, RW>,
  row: Table.NonPlaceholderBodyRow<R>,
  behavior?: Table.EditRowActionBehavior
): boolean => {
  let condition = c.typeguard(row);
  if (!isNil(behavior)) {
    condition = condition && c.behavior === behavior;
  }
  if (!isNil(c.conditional)) {
    condition = condition && c.conditional(row as RW);
  }
  return condition;
};

export const getEditColumnRowConfig = <
  R extends Table.RowData,
  RW extends Table.NonPlaceholderBodyRow<R> = Table.NonPlaceholderBodyRow<R>
>(
  /* eslint-disable @typescript-eslint/no-explicit-any */
  config: Table.EditColumnRowConfig<R, any>[],
  row: RW,
  behavior?: Table.EditRowActionBehavior
): Table.EditColumnRowConfig<R, RW> | null => {
  const filtered = filter(config, (c: Table.EditColumnRowConfig<R, any>) =>
    editColumnRowConfigIsApplicable(c, row, behavior)
  );
  return filtered.length !== 0 ? filtered[0] : null;
};

export const normalizedField = <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
  col: Table.RealColumn<R, M>
): string => (typeguards.isBodyColumn(col) ? col.field : typeguards.isActionColumn(col) ? col.colId : col.field);

declare type Case = "pdf" | "aggrid";

export const getColumnRowValue = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  V extends Table.RawRowValue = Table.RawRowValue
>(
  col: Table.DataColumn<R, M, V>,
  row: Table.BodyRow<R>,
  rows: Table.BodyRow<R>[],
  tableCase: Case = "aggrid"
): V => {
  const returnNullWithWarning = (fld: string) => {
    // The row managers should prevent this, but you never know.
    if (typeguards.isModelRow(row)) {
      console.error(
        `Undefined value for row ${row.id} (type = ${row.rowType}, ` +
          `modelType = ${row.modelType}) encountered for field ${fld}! ` +
          `Returning ${col.nullValue}.`
      );
    } else {
      console.error(
        `Undefined value for row ${row.id} (type = ${row.rowType}) ` +
          `encountered for field ${fld}! Returning ${col.nullValue}.`
      );
    }
    return col.nullValue;
  };

  const valueGetter = tableCase === "aggrid" ? col.valueGetter : col.pdfValueGetter;

  /* If the column does not define a valueGetter, we need to pull the row value
     from the underlying row data. */
  if (isNil(valueGetter)) {
    if (typeguards.isMarkupRow(row)) {
      if (!isNil(col.markupField)) {
        if (row.data[col.markupField] === undefined) {
          // The row managers should prevent this, but you never know.
          return returnNullWithWarning(col.markupField);
        }
        return row.data[col.markupField] as unknown as V;
      } else {
        /* In this case, the column is not applicable for a MarkupRow, so we
           just return the nullValue and do not issue a warning. */
        return col.nullValue;
      }
    } else if (typeguards.isGroupRow(row)) {
      if (!isNil(col.groupField)) {
        if (row.data[col.groupField] === undefined) {
          // The row managers should prevent this, but you never know.
          return returnNullWithWarning(col.groupField);
        }
        return row.data[col.groupField] as unknown as V;
      } else {
        /* In this case, the column is not applicable for a GroupRow, so we
           just return the nullValue and do not issue a warning. */
        return col.nullValue;
      }
    } else {
      // The field should always be applicable for the model row case.
      if (row.data[col.field] === undefined) {
        // The row managers should prevent this, but you never know.
        return returnNullWithWarning(col.field);
      }
      return row.data[col.field] as unknown as V;
    }
  } else {
    return valueGetter(row, rows);
  }
};

export const getColumn = <CA extends Table.Column[]>(
  columns: CA,
  field: string,
  flt?: (c: CA[number]) => boolean
): CA[number] | null => {
  const realColumnLookupFilter = (c: CA[number]) =>
    typeguards.isRealColumn<Table.InferR<typeof c>, Table.InferM<typeof c>>(c) &&
    normalizedField<Table.InferR<typeof c>, Table.InferM<typeof c>>(c) === field;

  const fakeColumnLooupFilter = (c: CA[number]) =>
    typeguards.isFakeColumn<Table.InferR<typeof c>, Table.InferM<typeof c>>(c) && c.field === field;

  const baseFlt = isNil(flt)
    ? (c: typeof columns[number]) => realColumnLookupFilter(c) || fakeColumnLooupFilter(c)
    : (c: CA[number]) => (flt(c) && realColumnLookupFilter(c)) || fakeColumnLooupFilter(c);
  const foundColumn = find(columns, baseFlt);
  if (!isNil(foundColumn)) {
    return foundColumn;
  } else {
    console.error(`Could not find column for field ${field}!`);
    return null;
  }
};

export const getRealColumn = <CA extends Table.Column[]>(
  columns: CA,
  field: string
): Table.InferRealColumn<CA[number]> | null => {
  return getColumn(columns, field, (c: CA[number]) => typeguards.isRealColumn(c)) as Table.InferRealColumn<
    CA[number]
  > | null;
};

export const getBodyColumn = <CA extends Table.Column[]>(
  columns: CA,
  field: string
): Table.InferBodyColumn<CA[number]> | null => {
  return getColumn(columns, field, (c: CA[number]) => typeguards.isBodyColumn(c)) as Table.InferBodyColumn<
    CA[number]
  > | null;
};

export const getActionColumn = <CA extends Table.Column[]>(
  columns: CA,
  field: string
): Table.InferActionColumn<CA[number]> | null => {
  return getColumn(columns, field, (c: CA[number]) => typeguards.isActionColumn(c)) as Table.InferActionColumn<
    CA[number]
  > | null;
};

export const getCalculatedColumn = <CA extends Table.Column[]>(
  columns: CA,
  field: string
): Table.InferCalculatedColumn<CA[number]> | null => {
  return getColumn(columns, field, (c: CA[number]) => typeguards.isCalculatedColumn(c)) as Table.InferCalculatedColumn<
    CA[number]
  > | null;
};

export const filterActionColumns = <CA extends Table.Column[]>(
  columns: CA
): CA extends Table.Column<infer R, infer M>[] ? Table.ActionColumn<R, M>[] : never =>
  filter(columns, (col: typeof columns[number]) =>
    typeguards.isActionColumn<Table.InferR<typeof col>, Table.InferM<typeof col>>(col)
  ) as CA extends Table.Column<infer R, infer M>[] ? Table.ActionColumn<R, M>[] : never;

export const filterFakeColumns = <CA extends Table.Column[]>(
  columns: CA
): CA extends Table.Column<infer R, infer M, infer V>[] ? Table.FakeColumn<R, M, V>[] : never =>
  filter(columns, (col: typeof columns[number]) =>
    typeguards.isFakeColumn<Table.InferR<typeof col>, Table.InferM<typeof col>>(col)
  ) as CA extends Table.Column<infer R, infer M, infer V>[] ? Table.FakeColumn<R, M, V>[] : never;

export const filterCalculatedColumns = <CA extends Table.Column[]>(
  columns: CA
): CA extends Table.Column<infer R, infer M, infer V>[] ? Table.CalculatedColumn<R, M, V>[] : never =>
  filter(columns, (col: typeof columns[number]) =>
    typeguards.isCalculatedColumn<Table.InferR<typeof col>, Table.InferM<typeof col>>(col)
  ) as CA extends Table.Column<infer R, infer M, infer V>[] ? Table.CalculatedColumn<R, M, V>[] : never;

export const filterDataColumns = <CA extends Table.Column[]>(
  columns: CA
): CA extends Table.Column<infer R, infer M, infer V>[] ? Table.DataColumn<R, M, V>[] : never =>
  filter(columns, (col: typeof columns[number]) =>
    typeguards.isDataColumn<Table.InferR<typeof col>, Table.InferM<typeof col>>(col)
  ) as CA extends Table.Column<infer R, infer M, infer V>[] ? Table.DataColumn<R, M, V>[] : never;

export const filterBodyColumns = <CA extends Table.Column[]>(
  columns: CA
): CA extends Table.Column<infer R, infer M, infer V>[] ? Table.BodyColumn<R, M, V>[] : never =>
  filter(columns, (col: typeof columns[number]) =>
    typeguards.isBodyColumn<Table.InferR<typeof col>, Table.InferM<typeof col>>(col)
  ) as CA extends Table.Column<infer R, infer M, infer V>[] ? Table.BodyColumn<R, M, V>[] : never;

export const filterRealColumns = <CA extends Table.Column[]>(
  columns: CA
): CA extends Table.Column<infer R, infer M, infer V>[] ? Table.RealColumn<R, M, V>[] : never =>
  filter(columns, (col: typeof columns[number]) =>
    typeguards.isRealColumn<Table.InferR<typeof col>, Table.InferM<typeof col>>(col)
  ) as CA extends Table.Column<infer R, infer M, infer V>[] ? Table.RealColumn<R, M, V>[] : never;

export const filterModelColumns = <CA extends Table.Column[]>(
  columns: CA
): CA extends Table.Column<infer R, infer M, infer V>[] ? Table.ModelColumn<R, M, V>[] : never =>
  filter(columns, (col: typeof columns[number]) =>
    typeguards.isModelColumn<Table.InferR<typeof col>, Table.InferM<typeof col>>(col)
  ) as CA extends Table.Column<infer R, infer M, infer V>[] ? Table.ModelColumn<R, M, V>[] : never;

export const isEditable = <
  R extends Table.RowData,
  M extends Model.RowHttpModel,
  C extends Table.BodyColumn<R, M> = Table.BodyColumn<R, M>
>(
  column: C,
  row: Table.BodyRow<R>
): boolean => {
  if (isNil(column.editable)) {
    return false;
  } else if (typeof column.editable === "boolean") {
    return column.editable;
  }
  return column.editable({ row });
};

export const parseBaseColumn = <R extends Table.RowData, M extends Model.RowHttpModel, C extends Table.Column<R, M>>(
  column: C
): Table.BaseColumn => {
  if (typeguards.isFakeColumn<R, M>(column)) {
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    const { cType, getRowValue, nullValue, isApplicableForModel, isApplicableForRowType, ...agColumn } = column;
    return agColumn;
  } else if (typeguards.isActionColumn<R, M>(column)) {
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    const { cType, footer, ...agColumn } = column;
    return agColumn;
  } else if (typeguards.isCalculatedColumn<R, M>(column)) {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const {
      markupField,
      groupField,
      footer,
      page,
      requiresAuthentication,
      index,
      canBeExported,
      canBeHidden,
      isRead,
      dataType,
      nullValue,
      cType,
      defaultHidden,
      includeInPdf,
      pdfWidth,
      pdfHeaderName,
      pdfFooter,
      pdfFooterValueGetter,
      pdfHeaderCellProps,
      pdfCellProps,
      pdfFlexGrow,
      isApplicableForModel,
      isApplicableForRowType,
      pdfValueGetter,
      pdfChildFooter,
      pdfCellRenderer,
      pdfFormatter,
      onCellDoubleClicked,
      processCellForClipboard,
      processCellForCSV,
      getHttpValue,
      getRowValue,
      ...agColumn
    } = column;
    /* eslint-enable @typescript-eslint/no-unused-vars */
    return agColumn;
  } else if (typeguards.isBodyColumn<R, M>(column)) {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const {
      markupField,
      groupField,
      footer,
      page,
      selectable,
      requiresAuthentication,
      index,
      canBeExported,
      canBeHidden,
      dataType,
      isRead,
      cType,
      nullValue,
      parsedFields,
      isApplicableForModel,
      isApplicableForRowType,
      smartInference,
      defaultHidden,
      includeInPdf,
      pdfWidth,
      pdfHeaderName,
      pdfFooter,
      pdfFooterValueGetter,
      pdfHeaderCellProps,
      pdfCellProps,
      pdfFlexGrow,
      pdfValueGetter,
      pdfChildFooter,
      pdfCellRenderer,
      pdfFormatter,
      onDataChange,
      parseIntoFields,
      refreshColumns,
      onCellDoubleClicked,
      processCellForClipboard,
      processCellForCSV,
      processCellFromClipboard,
      getHttpValue,
      getRowValue,
      ...agColumn
    } = column;
    /* eslint-enable @typescript-eslint/no-unused-vars */
    return agColumn;
  }
  return column as Table.BaseColumn;
};

export const normalizePdfColumnWidths = <CA extends Table.Column[]>(
  cs: CA,
  flt?: CA extends Table.Column<infer R, infer M, infer V>[] ? (c: Table.DataColumn<R, M, V>) => boolean : never
): CA extends Table.Column<infer R, infer M, infer V>[] ? Table.BodyColumn<R, M, V>[] : never => {
  let columns = [...cs];

  const baseFilter = (c: Table.DataColumn) =>
    !isNil(flt) ? c.includeInPdf !== false && flt(c) : c.includeInPdf !== false;

  // Determine the total width of all the columns that have a specified width.
  const totalSpecifiedWidth = reduce(
    columns,
    (prev: number, c: CA[number]) => {
      if (
        typeguards.isDataColumn<Table.InferR<typeof c>, Table.InferM<typeof c>>(c) &&
        baseFilter(c) &&
        c.pdfWidth !== undefined
      ) {
        return prev + c.pdfWidth;
      }
      return prev;
    },
    0.0
  );

  /* Determine if there is a column that should flex grow to fill remaining space
     in the case that the total width of the visible columns is less than 1.0. */
  const flexColumns = filter(
    columns,
    (c: CA[number]) =>
      typeguards.isDataColumn<Table.InferR<typeof c>, Table.InferM<typeof c>>(c) &&
      baseFilter(c) &&
      !isNil(c.pdfFlexGrow)
  ) as Table.DataColumn<Table.InferR<CA[number]>, Table.InferM<CA[number]>>[];
  if (flexColumns.length !== 0 && totalSpecifiedWidth < 1.0) {
    const flexColumn = flexColumns[0];

    /* If there are multiple columns with 'pdfFlexGrow' specified, we cannot apply
       the flex to all of the columns because we would have to split the leftover
			 space up between the columns with 'pdfFlexGrow' which can get
			 hairy/complicated - and is not needed at this point. */
    if (flexColumns.length !== 1) {
      const flexColumnFields: (string | undefined)[] = map(
        flexColumns,
        (c: Table.DataColumn<Table.InferR<CA[number]>, Table.InferM<CA[number]>>) => c.field
      );
      console.warn(
        `Found multiple columns, ${flexColumnFields.join(", ")}, with 'pdfFlexGrow' specified.
        Since only one column can flex grow in the PDF, only the column ${flexColumnFields[0]}
        will have 'pdfFlexGrow' applied.`
      );
    }
    /* If the remaining non-flex columns do not specify a width, then we cannot
       apply 'pdfFlexGrow' to the remaining column because we do not know how
       much space should be available. */
    const columnsWithoutSpecifiedWidth = filter(
      columns,
      (c: CA[number]) =>
        typeguards.isDataColumn<Table.InferR<CA[number]>, Table.InferM<CA[number]>>(c) &&
        baseFilter(c) &&
        isNil(c.pdfWidth) &&
        flexColumn.field !== c.field
    ) as Table.DataColumn<Table.InferR<CA[number]>, Table.InferM<CA[number]>>[];
    if (columnsWithoutSpecifiedWidth.length !== 0) {
      const missingWidthFields: (string | undefined)[] = map(
        columnsWithoutSpecifiedWidth,
        (c: Table.DataColumn<Table.InferR<CA[number]>, Table.InferM<CA[number]>>) => c.field
      );
      console.warn(
        `Cannot apply 'pdfFlexGrow' to column ${flexColumn.field} because
        columns ${missingWidthFields.join(", ")} do not specify a 'pdfWidth'.`
      );
    } else {
      /* Return the columns as they were but only changing the width of the column
         with 'pdfFlexGrow' applied to take up the remaining space in the
				 table. */
      return map(columns, (c: CA[number]) => {
        if (
          typeguards.isDataColumn<Table.InferR<typeof c>, Table.InferM<typeof c>>(c) &&
          c.field === flexColumn.field
        ) {
          return { ...c, pdfWidth: 1.0 - totalSpecifiedWidth };
        }
        return c;
      }) as CA extends Table.Column<infer R, infer M, infer V>[] ? Table.BodyColumn<R, M, V>[] : never;
    }
  }

  /* Determine what the default width should be for columns that do not specify it
     based on the leftover width available after the columns that specify a width
     are inserted. */
  let defaultWidth = 0;
  if (totalSpecifiedWidth < 1.0) {
    defaultWidth =
      (1.0 - totalSpecifiedWidth) /
      filter(
        columns,
        (c: CA[number]) =>
          typeguards.isDataColumn<Table.InferR<typeof c>, Table.InferM<typeof c>>(c) &&
          baseFilter(c) &&
          isNil(c.pdfWidth)
      ).length;
  }
  // Calculate total width of all the columns.
  const totalWidth = reduce(
    columns,
    (prev: number, c: CA[number]) =>
      typeguards.isDataColumn<Table.InferR<typeof c>, Table.InferM<typeof c>>(c) && baseFilter(c)
        ? prev + (c.pdfWidth || defaultWidth)
        : prev,
    0.0
  );
  if (totalWidth !== 0.0) {
    /* Normalize the width of each column such that the sum of all column widths
       is 1.0 */
    columns = map(columns, (c: CA[number]) =>
      typeguards.isDataColumn<Table.InferR<typeof c>, Table.InferM<typeof c>>(c)
        ? {
            ...c,
            pdfWidth: baseFilter(c) ? (c.pdfWidth || defaultWidth) / totalWidth : c.pdfWidth
          }
        : c
    );
  }
  return columns as CA extends Table.Column<infer R, infer M, infer V>[] ? Table.BodyColumn<R, M, V>[] : never;
};

type ColumnTypeVariantOptions = {
  header?: boolean;
  pdf?: boolean;
};

export const getColumnTypeCSSStyle = (
  type: Table.ColumnDataTypeId | Table.ColumnDataType,
  options: ColumnTypeVariantOptions = { header: false, pdf: false }
): React.CSSProperties => {
  let colType: Table.ColumnDataType;
  if (typeof type === "string") {
    const ct: Table.ColumnDataType | undefined = find(Models.ColumnTypes, { id: type });
    if (isNil(ct)) {
      return {};
    }
    colType = ct;
  } else {
    colType = type;
  }
  let style = colType.style || {};
  if (options.header === true && !isNil(colType.headerOverrides)) {
    style = { ...style, ...(colType.headerOverrides.style || {}) };
  }
  if (options.pdf === true && !isNil(colType.pdfOverrides)) {
    style = { ...style, ...(colType.pdfOverrides.style || {}) };
  }
  return style;
};

type ColumnUpdate<C extends Table.RealColumn> = Partial<C> | ((p: C) => Partial<C>);

type ColumnTypeUpdates<CA extends Table.Column[]> = {
  readonly body?: ColumnUpdate<Table.InferBodyColumn<CA[number]>>;
  readonly action?: ColumnUpdate<Table.InferActionColumn<CA[number]>>;
  readonly calculated?: ColumnUpdate<Table.InferCalculatedColumn<CA[number]>>;
};

export const normalizeColumns = <CA extends Table.Column[]>(
  columns: CA,
  updates: Partial<{
    [key: string]: ColumnUpdate<Table.InferBodyColumn<CA[number]>>;
  }> = {},
  typeUpdates: ColumnTypeUpdates<CA> = {}
): CA => {
  const normalizeUpdate = <CT extends Table.InferRealColumn<CA[number]>>(
    d: ColumnUpdate<CT> | undefined,
    c: CT
  ): Partial<CT> | undefined => (typeof d === "function" ? d(c) : d);

  const getUpdateForColumn = <CT extends Table.InferRealColumn<CA[number]>>(c: CT): Partial<CT> | undefined => {
    if (!isNil(updates)) {
      const cTypeUpdate = typeUpdates[c.cType];
      if (cTypeUpdate !== undefined) {
        return normalizeUpdate<CT>(cTypeUpdate as ColumnUpdate<CT>, c);
      } else {
        const id = normalizedField<Table.InferR<CA[number]>, Table.InferM<CA[number]>>(c);
        return normalizeUpdate<CT>(updates[id] as ColumnUpdate<CT>, c);
      }
    }
    return {};
  };

  let evaluated: CA = [] as unknown as CA;

  for (let i = 0; i < columns.length; i++) {
    const c = columns[i];
    if (typeguards.isRealColumn(c)) {
      const data = getUpdateForColumn(c as Table.InferRealColumn<CA[number]>) as Partial<typeof c>;
      evaluated = [...evaluated, { ...c, ...data }] as CA;
    } else {
      evaluated = [...evaluated, c] as CA;
    }
  }

  return evaluated;
};

export const orderColumns = <CA extends Table.Column[]>(columns: CA): CA => {
  const actionColumns = filterActionColumns(columns);
  const calculatedColumns = filterCalculatedColumns(columns);
  const bodyColumns = filterBodyColumns(columns);

  /* It doesn't matter where the fake columns go in the ordering because they
		 are not displayed - all we care about is that they are present. */
  const fakeColumns = filterFakeColumns(columns);

  const actionColumnsWithIndex = filter(
    actionColumns,
    (c: Table.ActionColumn<Table.InferR<CA[number]>, Table.InferM<CA[number]>>) => !isNil(c.index)
  );
  const actionColumnsWithoutIndex = filter(
    actionColumns,
    (c: Table.ActionColumn<Table.InferR<CA[number]>, Table.InferM<CA[number]>>) => isNil(c.index)
  );

  const calculatedColumnsWithIndex = filter(
    calculatedColumns,
    (c: Table.CalculatedColumn<Table.InferR<CA[number]>, Table.InferM<CA[number]>>) => !isNil(c.index)
  );

  const calculatedColumnsWithoutIndex = filter(
    calculatedColumns,
    (c: Table.CalculatedColumn<Table.InferR<CA[number]>, Table.InferM<CA[number]>>) => isNil(c.index)
  );

  const bodyColumnsWithIndex = filter(
    bodyColumns,
    (c: Table.BodyColumn<Table.InferR<CA[number]>, Table.InferM<CA[number]>>) => !isNil(c.index)
  );
  const bodyColumnsWithoutIndex = filter(
    bodyColumns,
    (c: Table.BodyColumn<Table.InferR<CA[number]>, Table.InferM<CA[number]>>) => isNil(c.index)
  );

  return [
    ...fakeColumns,
    ...orderBy(actionColumnsWithIndex, ["index"], ["asc"]),
    ...actionColumnsWithoutIndex,
    ...orderBy(bodyColumnsWithIndex, ["index"], ["asc"]),
    ...bodyColumnsWithoutIndex,
    ...orderBy(calculatedColumnsWithIndex, ["index"], ["asc"]),
    ...calculatedColumnsWithoutIndex
  ] as CA;
};
