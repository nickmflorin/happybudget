import React from "react";
import { find, isNil, reduce, filter, orderBy, map } from "lodash";

import * as Models from "./models";

/* eslint-disable indent */
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

export const getColumn = <R extends Table.RowData, M extends Model.RowHttpModel>(
  columns: Table.Column<R, M>[],
  field: keyof R | string
): Table.Column<R, M> | null => {
  const foundColumn = find(columns, (c: Table.Column<R, M>) => normalizedField<R, M>(c) === field);
  if (!isNil(foundColumn)) {
    return foundColumn;
  } else {
    console.error(`Could not find column for field ${field}!`);
    return null;
  }
};

export const callWithColumn = <R extends Table.RowData, M extends Model.RowHttpModel, RT = any>(
  columns: Table.Column<R, M>[],
  field: keyof R | string,
  callback: (col: Table.Column<R, M>) => RT | null
) => {
  const foundColumn = getColumn(columns, field);
  return !isNil(foundColumn) ? callback(foundColumn) : null;
};

/* eslint-disable indent */
export const isEditable = <
  R extends Table.RowData,
  M extends Model.RowHttpModel,
  V = any,
  PDFM extends Model.RowHttpModel = any
>(
  column: Table.Column<R, M, V, PDFM>,
  row: Table.BodyRow<R>
): boolean => {
  if (isNil(column.editable)) {
    return false;
  } else if (typeof column.editable === "boolean") {
    return column.editable;
  }
  return column.editable({ column, row });
};

export const normalizedField = <
  R extends Table.RowData,
  M extends Model.RowHttpModel,
  V = any,
  PDFM extends Model.RowHttpModel = any,
  P extends { readonly field?: keyof R; readonly colId?: string } = Table.Column<R, M, V, PDFM>
>(
  col: P
): string | undefined => (col.field !== undefined ? (col.field as string) : col.colId);

type ColumnTypeVariantOptions = {
  header?: boolean;
  pdf?: boolean;
};

export const normalizePdfColumnWidths = <
  R extends Table.RowData,
  M extends Model.RowHttpModel,
  V,
  PDFM extends Model.RowHttpModel
>(
  cs: Table.Column<R, M, V, PDFM>[],
  flt?: (c: Table.Column<R, M, V, PDFM>) => boolean
) => {
  type C = Table.Column<R, M, V, PDFM>;

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
    const normalizedFlexField = normalizedField<R, M, V, PDFM>(flexColumn);

    /* If there are multiple columns with 'pdfFlexGrow' specified, we cannot apply
       the flex to all of the columns because we would have to split the leftover
			 space up between the columns with 'pdfFlexGrow' which can get
			 hairy/complicated - and is not needed at this point. */
    if (flexColumns.length !== 1) {
      const flexColumnFields: (string | undefined)[] = map(flexColumns, (c: C) => normalizedField<R, M, V, PDFM>(c));
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
      (c: C) => baseFilter(c) && isNil(c.pdfWidth) && normalizedFlexField !== normalizedField<R, M, V, PDFM>(c)
    );
    if (columnsWithoutSpecifiedWidth.length !== 0) {
      const missingWidthFields: (string | undefined)[] = map(columnsWithoutSpecifiedWidth, (c: C) =>
        normalizedField<R, M, V, PDFM>(c)
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
        if (normalizedField<R, M, V, PDFM>(c) === normalizedFlexField) {
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
    const ct: Table.ColumnType | undefined = find(Models.ColumnTypes, { id: type } as any);
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

type ColumnUpdate<R extends Table.RowData, M extends Model.RowHttpModel, PDFM extends Model.RowHttpModel = any> =
  | Partial<Table.Column<R, M>>
  | ((p: Table.Column<R, M, any, PDFM>) => Partial<Table.Column<R, M>>);

export const normalizeColumns = <
  R extends Table.RowData,
  M extends Model.RowHttpModel,
  PDFM extends Model.RowHttpModel = any
>(
  /* TODO: Assuming any here for D can cause bugs - where the update might have
		 fields in it that are not allowed.  We should come up with a cleaner
		 solution. */
  columns: Table.Column<R, M, any, PDFM>[],
  updates?: {
    [key: string]: ColumnUpdate<R, M, PDFM>;
  }
): Table.Column<R, M, any, PDFM>[] => {
  const normalizeUpdate = (
    d: ColumnUpdate<R, M, PDFM>,
    c: Table.Column<R, M, any, PDFM>
  ): Partial<Table.Column<R, M, any, PDFM>> => (typeof d === "function" ? d(c) : d);

  const getUpdateForColumn = (c: Table.Column<R, M, any, PDFM>): ColumnUpdate<R, M, PDFM> => {
    if (!isNil(updates)) {
      const id = normalizedField<R, M>(c);
      const data: ColumnUpdate<R, M, PDFM> = updates[id as string] || {};
      /* Data pertaining to a specific column ID should be given precedence to
         data defined more generally for the TableColumnType. */
      return { ...normalizeUpdate(updates[c.tableColumnType], c), ...normalizeUpdate(data, c) };
    }
    return {};
  };

  return reduce(
    columns,
    (evaluated: Table.Column<R, M, any, PDFM>[], c: Table.Column<R, M, any, PDFM>): Table.Column<R, M, any, PDFM>[] => {
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
  M extends Model.RowHttpModel,
  PDFM extends Model.RowHttpModel = any
>(
  columns: Table.Column<R, M, any, PDFM>[]
): Table.Column<R, M, any, PDFM>[] => {
  const actionColumns = filter(columns, (col: Table.Column<R, M, any, PDFM>) => col.tableColumnType === "action");
  const calculatedColumns = filter(
    columns,
    (col: Table.Column<R, M, any, PDFM>) => col.tableColumnType === "calculated"
  );
  const bodyColumns = filter(columns, (col: Table.Column<R, M, any, PDFM>) => col.tableColumnType === "body");
  /* It doesn't matter where the fake columns go in the ordering because they
		 are not displayed - all we care about is that they are present. */
  const fakeColumns = filter(columns, (col: Table.Column<R, M, any, PDFM>) => col.tableColumnType === "fake");

  const actionColumnsWithIndex = filter(actionColumns, (col: Table.Column<R, M, any, PDFM>) => !isNil(col.index));
  const actionColumnsWithoutIndex = filter(actionColumns, (col: Table.Column<R, M, any, PDFM>) => isNil(col.index));

  const calculatedColumnsWithIndex = filter(
    calculatedColumns,
    (col: Table.Column<R, M, any, PDFM>) => !isNil(col.index)
  );
  const calculatedColumnsWithoutIndex = filter(calculatedColumns, (col: Table.Column<R, M, any, PDFM>) =>
    isNil(col.index)
  );

  const bodyColumnsWithIndex = filter(bodyColumns, (col: Table.Column<R, M, any, PDFM>) => !isNil(col.index));
  const bodyColumnsWithoutIndex = filter(bodyColumns, (col: Table.Column<R, M, any, PDFM>) => isNil(col.index));

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
