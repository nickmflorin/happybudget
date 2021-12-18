import React from "react";
import { find, isNil, reduce, filter, orderBy, map } from "lodash";

import * as Models from "./models";

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

export const normalizedField = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  C extends Table.Column<R, M> = Table.Column<R, M>
>(
  col: C
): string | undefined => (col.field !== undefined ? (col.field as string) : col.colId);

export const getColumn = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  C extends Table.Column<R, M> = Table.Column<R, M>
>(
  columns: C[],
  field: string
): C | null => {
  const foundColumn = find(columns, (c: C) => normalizedField<R, M, C>(c) === field);
  if (!isNil(foundColumn)) {
    return foundColumn;
  } else {
    console.error(`Could not find column for field ${field}!`);
    return null;
  }
};

export const callWithColumn = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  C extends Table.Column<R, M> = Table.Column<R, M>
>(
  columns: C[],
  field: string,
  callback: (col: C) => void
) => {
  const foundColumn = getColumn<R, M, C>(columns, field);
  return !isNil(foundColumn) ? callback(foundColumn) : null;
};

export const isEditable = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  C extends Table.Column<R, M> = Table.Column<R, M>
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

type ColumnTypeVariantOptions = {
  header?: boolean;
  pdf?: boolean;
};

export const normalizePdfColumnWidths = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  C extends Table.Column<R, M> = Table.Column<R, M>
>(
  cs: C[],
  flt?: (c: C) => boolean
) => {
  let columns = [...cs];

  const baseFilter = (c: C) => {
    if (isNil(flt)) {
      return c.tableColumnType !== "fake" && c.includeInPdf !== false;
    }
    return c.tableColumnType !== "fake" && c.includeInPdf !== false && flt(c);
  };

  // Determine the total width of all the columns that have a specified width.
  const totalSpecifiedWidth = reduce(
    columns,
    (prev: number, c: C) => {
      if (baseFilter(c) && c.pdfWidth !== undefined) {
        return prev + c.pdfWidth;
      }
      return prev;
    },
    0.0
  );

  /* Determine if there is a column that should flex grow to fill remaining space
     in the case that the total width of the visible columns is less than 1.0. */
  const flexColumns = filter(columns, (c: C) => baseFilter(c) && !isNil(c.pdfFlexGrow));
  if (flexColumns.length !== 0 && totalSpecifiedWidth < 1.0) {
    const flexColumn = flexColumns[0];
    const normalizedFlexField = normalizedField<R, M, C>(flexColumn);

    /* If there are multiple columns with 'pdfFlexGrow' specified, we cannot apply
       the flex to all of the columns because we would have to split the leftover
			 space up between the columns with 'pdfFlexGrow' which can get
			 hairy/complicated - and is not needed at this point. */
    if (flexColumns.length !== 1) {
      const flexColumnFields: (string | undefined)[] = map(flexColumns, (c: C) => normalizedField<R, M, C>(c));
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
      (c: C) => baseFilter(c) && isNil(c.pdfWidth) && normalizedFlexField !== normalizedField<R, M, C>(c)
    );
    if (columnsWithoutSpecifiedWidth.length !== 0) {
      const missingWidthFields: (string | undefined)[] = map(columnsWithoutSpecifiedWidth, (c: C) =>
        normalizedField<R, M, C>(c)
      );
      console.warn(
        `Cannot apply 'pdfFlexGrow' to column ${normalizedFlexField} because
        columns ${missingWidthFields.join(", ")} do not specify a 'pdfWidth'.`
      );
    } else {
      /* Return the columns as they were but only changing the width of the column
         with 'pdfFlexGrow' applied to take up the remaining space in the
				 table. */
      return map(columns, (c: C) => {
        if (normalizedField<R, M, C>(c) === normalizedFlexField) {
          return { ...c, pdfWidth: 1.0 - totalSpecifiedWidth };
        }
        return c;
      });
    }
  }

  /* Determine what the default width should be for columns that do not specify it
     based on the leftover width available after the columns that specify a width
     are inserted. */
  let defaultWidth = 0;
  if (totalSpecifiedWidth < 1.0) {
    defaultWidth = (1.0 - totalSpecifiedWidth) / filter(columns, (c: C) => baseFilter(c) && isNil(c.pdfWidth)).length;
  }
  // Calculate total width of all the columns.
  const totalWidth = reduce(
    columns,
    (prev: number, c: C) => (baseFilter(c) ? prev + (c.pdfWidth || defaultWidth) : prev),
    0.0
  );
  if (totalWidth !== 0.0) {
    /* Normalize the width of each column such that the sum of all column widths
       is 1.0 */
    columns = map(columns, (c: C) => ({
      ...c,
      pdfWidth: baseFilter(c) ? (c.pdfWidth || defaultWidth) / totalWidth : c.pdfWidth
    }));
  }
  return columns;
};

export const getColumnTypeCSSStyle = (
  type: Table.ColumnTypeId | Table.ColumnType,
  options: ColumnTypeVariantOptions = { header: false, pdf: false }
): React.CSSProperties => {
  let colType: Table.ColumnType;
  if (typeof type === "string") {
    const ct: Table.ColumnType | undefined = find(Models.ColumnTypes, { id: type });
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

type ColumnUpdate<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  C extends Table.Column<R, M> = Table.Column<R, M>
> = Partial<C> | ((p: C) => Partial<C>);

export const normalizeColumns = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  C extends Table.Column<R, M> = Table.Column<R, M>
>(
  columns: C[],
  updates?: {
    [key: string]: ColumnUpdate<R, M, C>;
  }
): C[] => {
  const normalizeUpdate = (d: ColumnUpdate<R, M, C>, c: C): Partial<C> => (typeof d === "function" ? d(c) : d);

  const getUpdateForColumn = (c: C): ColumnUpdate<R, M, C> => {
    if (!isNil(updates)) {
      const id = normalizedField<R, M, C>(c);
      const data: ColumnUpdate<R, M, C> = updates[id as string] || {};
      /* Data pertaining to a specific column ID should be given precedence to
         data defined more generally for the TableColumnType. */
      return { ...normalizeUpdate(updates[c.tableColumnType], c), ...normalizeUpdate(data, c) };
    }
    return {};
  };

  return reduce(
    columns,
    (evaluated: C[], c: C): C[] => {
      if (!isNil(updates)) {
        const data = getUpdateForColumn(c);
        if (typeof data === "function") {
          return [...evaluated, { ...c, ...data(c) }];
        }
        return [...evaluated, { ...c, ...data }];
      }
      return evaluated;
    },
    []
  );
};

export const orderColumns = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  C extends Table.Column<R, M> = Table.Column<R, M>
>(
  columns: C[]
): C[] => {
  const actionColumns = filter(columns, (col: C) => col.tableColumnType === "action");
  const calculatedColumns = filter(columns, (col: C) => col.tableColumnType === "calculated");
  const bodyColumns = filter(columns, (col: C) => col.tableColumnType === "body");
  /* It doesn't matter where the fake columns go in the ordering because they
		 are not displayed - all we care about is that they are present. */
  const fakeColumns = filter(columns, (col: C) => col.tableColumnType === "fake");

  const actionColumnsWithIndex = filter(actionColumns, (col: C) => !isNil(col.index));
  const actionColumnsWithoutIndex = filter(actionColumns, (col: C) => isNil(col.index));

  const calculatedColumnsWithIndex = filter(calculatedColumns, (col: C) => !isNil(col.index));
  const calculatedColumnsWithoutIndex = filter(calculatedColumns, (col: C) => isNil(col.index));

  const bodyColumnsWithIndex = filter(bodyColumns, (col: C) => !isNil(col.index));
  const bodyColumnsWithoutIndex = filter(bodyColumns, (col: C) => isNil(col.index));

  return [
    ...fakeColumns,
    ...orderBy(actionColumnsWithIndex, ["index"], ["asc"]),
    ...actionColumnsWithoutIndex,
    ...orderBy(bodyColumnsWithIndex, ["index"], ["asc"]),
    ...bodyColumnsWithoutIndex,
    ...orderBy(calculatedColumnsWithIndex, ["index"], ["asc"]),
    ...calculatedColumnsWithoutIndex
  ];
};
