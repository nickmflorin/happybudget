import React from "react";
import { find, isNil, reduce, filter, orderBy, map } from "lodash";

import * as Models from "./models";
import * as typeguards from "./typeguards";

export const getEditColumnRowConfig = <
  R extends Table.RowData,
  RW extends Table.NonPlaceholderBodyRow<R> = Table.NonPlaceholderBodyRow<R>
>(
  config: Table.EditColumnRowConfig<R, RW>[],
  row: RW,
  behavior?: Table.EditRowActionBehavior
): Table.EditColumnRowConfig<R, RW> | null => {
  const filt = !isNil(behavior)
    ? (c: Table.EditColumnRowConfig<R, RW>) => c.conditional(row) && c.behavior === behavior
    : (c: Table.EditColumnRowConfig<R, RW>) => c.conditional(row);
  const filtered = filter(config, filt);
  return filtered.length !== 0 ? filtered[0] : null;
};

export const normalizedField = <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
  col: Table.RealColumn<R, M>
): string => (typeguards.isBodyColumn(col) ? col.field : typeguards.isActionColumn(col) ? col.colId : col.field);

export const getColumn = <CA extends Table.Column[]>(
  columns: CA,
  field: string,
  flt?: (c: CA[number]) => boolean
): CA[number] | null => {
  const baseFlt = isNil(flt)
    ? (c: typeof columns[number]) =>
        typeguards.isRealColumn<Table.InferR<typeof c>, Table.InferM<typeof c>>(c) &&
        normalizedField<Table.InferR<typeof c>, Table.InferM<typeof c>>(c) === field
    : (c: CA[number]) =>
        flt(c) &&
        typeguards.isRealColumn<Table.InferR<typeof c>, Table.InferM<typeof c>>(c) &&
        normalizedField<Table.InferR<typeof c>, Table.InferM<typeof c>>(c) === field;
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
): Table.RealColumn<Table.InferR<typeof columns[number]>, Table.InferM<typeof columns[number]>> | null => {
  return getColumn(columns, field, (c: CA[number]) =>
    typeguards.isRealColumn<Table.InferR<typeof c>, Table.InferM<typeof c>>(c)
  ) as Table.RealColumn<Table.InferR<typeof columns[number]>, Table.InferM<typeof columns[number]>>;
};

export const getBodyColumn = <CA extends Table.Column[]>(
  columns: CA,
  field: string
): Table.BodyColumn<Table.InferR<typeof columns[number]>, Table.InferM<typeof columns[number]>> | null => {
  return getColumn(columns, field, (c: CA[number]) =>
    typeguards.isBodyColumn<Table.InferR<typeof c>, Table.InferM<typeof c>>(c)
  ) as Table.BodyColumn<Table.InferR<typeof columns[number]>, Table.InferM<typeof columns[number]>>;
};

export const getActionColumn = <CA extends Table.Column[]>(
  columns: CA,
  field: string
): Table.ActionColumn<Table.InferR<typeof columns[number]>, Table.InferM<typeof columns[number]>> | null => {
  return getColumn(columns, field, (c: CA[number]) =>
    typeguards.isActionColumn<Table.InferR<typeof c>, Table.InferM<typeof c>>(c)
  ) as Table.ActionColumn<Table.InferR<typeof columns[number]>, Table.InferM<typeof columns[number]>>;
};

export const getCalculatedColumn = <CA extends Table.Column[]>(
  columns: CA,
  field: string
): Table.CalculatedColumn<Table.InferR<typeof columns[number]>, Table.InferM<typeof columns[number]>> | null => {
  return getColumn(columns, field, (c: CA[number]) =>
    typeguards.isCalculatedColumn<Table.InferR<typeof c>, Table.InferM<typeof c>>(c)
  ) as Table.CalculatedColumn<Table.InferR<typeof columns[number]>, Table.InferM<typeof columns[number]>>;
};

export const filterActionColumns = <CA extends Table.Column[]>(
  columns: CA
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
): CA extends Table.Column<infer R, infer M>[] ? Table.ActionColumn<R, M>[] : never =>
  filter(columns, (col: typeof columns[number]) =>
    typeguards.isActionColumn<Table.InferR<typeof col>, Table.InferM<typeof col>>(col)
  ) as CA extends Table.Column<infer R, infer M>[] ? Table.ActionColumn<R, M>[] : never;

export const filterFakeColumns = <CA extends Table.Column[]>(
  columns: CA
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
): CA extends Table.Column<any, infer M, infer V>[] ? Table.FakeColumn<M, V>[] : never =>
  filter(
    columns,
    (col: typeof columns[number]) => typeguards.isFakeColumn<Table.InferR<typeof col>, Table.InferM<typeof col>>(col)
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  ) as CA extends Table.Column<any, infer M, infer V>[] ? Table.FakeColumn<M, V>[] : never;

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
    const { cType, getRowValue, nullValue, isApplicable, ...agColumn } = column;
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
      defaultNewRowValue,
      defaultHidden,
      includeInPdf,
      pdfWidth,
      pdfHeaderName,
      pdfFooter,
      pdfFooterValueGetter,
      pdfCellContentsVisible,
      pdfHeaderCellProps,
      pdfCellProps,
      pdfFlexGrow,
      isApplicable,
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
      isApplicable,
      smartInference,
      defaultNewRowValue,
      defaultHidden,
      includeInPdf,
      pdfWidth,
      pdfHeaderName,
      pdfFooter,
      pdfFooterValueGetter,
      pdfCellContentsVisible,
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

type ColumnTypeUpdates<R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel> = {
  readonly body?: ColumnUpdate<Table.BodyColumn<R, M>>;
  readonly action?: ColumnUpdate<Table.ActionColumn<R, M>>;
  readonly calculated?: ColumnUpdate<Table.CalculatedColumn<R, M>>;
};

export const normalizeColumns = <CA extends Table.Column[]>(
  columns: CA,
  updates: Partial<{
    [key: string]: ColumnUpdate<Table.BodyColumn>;
  }> = {},
  typeUpdates: ColumnTypeUpdates<Table.InferR<CA[number]>, Table.InferM<CA[number]>> = {}
): CA => {
  const normalizeUpdate = <CT extends Table.RealColumn<Table.InferR<CA[number]>, Table.InferM<CA[number]>>>(
    d: ColumnUpdate<CT> | undefined,
    c: CT
  ): Partial<CT> | undefined => (typeof d === "function" ? d(c) : d);

  const getUpdateForColumn = <CT extends Table.RealColumn<Table.InferR<CA[number]>, Table.InferM<CA[number]>>>(
    c: CT
  ): Partial<CT> | undefined => {
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

  let evaluated: Table.Column<Table.InferR<CA[number]>, Table.InferM<CA[number]>>[] = [];

  for (let i = 0; i < columns.length; i++) {
    const c = columns[i];
    if (typeguards.isRealColumn<Table.InferR<typeof c>, Table.InferM<typeof c>>(c)) {
      const data = getUpdateForColumn(c) as Partial<typeof c>;
      evaluated = [...evaluated, { ...c, ...data } as typeof c];
    } else {
      evaluated = [...evaluated, c];
    }
  }

  return evaluated as CA;
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
