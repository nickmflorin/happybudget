import React from "react";
import { find, isNil, reduce, filter, orderBy, map } from "lodash";
import { SuppressKeyboardEventParams } from "@ag-grid-community/core";

import { util } from "lib";

import * as aggrid from "./aggrid";
import * as formatters from "./formatters";
import * as Models from "./models";

/* eslint-disable indent */
export const normalizedField = <
  R extends Table.RowData = any,
  M extends Model.HttpModel = any,
  V = any,
  PDFM extends Model.HttpModel = any,
  P extends { readonly field?: keyof R; readonly colId?: string } = Table.Column<R, M, V, PDFM>
>(
  col: P
): string | undefined => (col.field !== undefined ? (col.field as string) : col.colId);

type ColumnTypeVariantOptions = {
  header?: boolean;
  pdf?: boolean;
};

export const normalizePdfColumnWidths = <
  R extends Table.RowData = any,
  M extends Model.HttpModel = any,
  V = any,
  PDFM extends Model.HttpModel = any
>(
  cs: Table.Column<R, M, V, PDFM>[],
  flt?: (c: Table.Column<R, M, V, PDFM>) => boolean
) => {
  let columns = [...cs];
  // Determine the total width of all the columns that have a specified width.
  const totalSpecifiedWidth = reduce(
    columns,
    (prev: number, column: Table.Column<R, M, V, PDFM>) =>
      column.tableColumnType !== "fake" ? prev + (column.pdfWidth || 0.0) : prev,
    0.0
  );
  // Determine what the default width should be for columns that do not specify it.
  let defaultWidth = 0;
  if (totalSpecifiedWidth < 1.0) {
    defaultWidth =
      (1.0 - totalSpecifiedWidth) /
      filter(columns, (c: Table.Column<R, M, V, PDFM>) => c.tableColumnType !== "fake" && !isNil(c.pdfWidth)).length;
  }
  // Calculate Total Column Width Before Filtering Out Unused Columns
  const totalWidth = reduce(
    columns,
    (prev: number, column: Table.Column<R, M, V, PDFM>) =>
      column.tableColumnType !== "fake" ? prev + (column.pdfWidth || defaultWidth) : prev,
    0.0
  );
  if (totalWidth !== 0.0) {
    // Normalize Column Widths Before Filtering Out Unused Columns
    columns = map(columns, (c: Table.Column<R, M, V, PDFM>) => ({
      ...c,
      width: c.tableColumnType !== "fake" ? (c.pdfWidth || defaultWidth) / totalWidth : 0.0
    }));
    // Filter Out Unused Columns
    columns = isNil(flt) ? columns : filter(columns, flt);
    // Calculate Total Column Width After Filtering Out Unused Columns
    const totalWidthWithFilter = reduce(
      columns,
      (prev: number, c: Table.Column<R, M, V, PDFM>) =>
        c.tableColumnType !== "fake" ? prev + (c.pdfWidth || defaultWidth) : 0.0,
      0.0
    );
    if (totalWidthWithFilter !== 0.0) {
      // Normalize Column Widths After Filtering Out Unused Columns
      columns = map(columns, (c: Table.Column<R, M, V, PDFM>) => ({
        ...c,
        width: c.tableColumnType !== "fake" ? (c.pdfWidth || defaultWidth) / totalWidthWithFilter : 0.0
      }));
    }
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

type ColumnUpdate<
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  PDFM extends Model.HttpModel = any
> = Partial<Table.Column<R, M>> | ((p: Table.Column<R, M, any, PDFM>) => Partial<Table.Column<R, M>>);

export const normalizeColumns = <
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  PDFM extends Model.HttpModel = any
>(
  // TODO: Assuming any here for D can cause bugs - where the update might have fields in it that
  // are not allowed.  We should come up with a cleaner solution.
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
      const id = normalizedField(c);
      const data: ColumnUpdate<R, M, PDFM> = updates[id as string] || {};
      // Data pertaining to a specific column ID should be given precedence to
      // data defined more generally for the TableColumnType.
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
  M extends Model.HttpModel = Model.HttpModel,
  PDFM extends Model.HttpModel = any
>(
  columns: Table.Column<R, M, any, PDFM>[]
): Table.Column<R, M, any, PDFM>[] => {
  const actionColumns = filter(columns, (col: Table.Column<R, M, any, PDFM>) => col.tableColumnType === "action");
  const calculatedColumns = filter(
    columns,
    (col: Table.Column<R, M, any, PDFM>) => col.tableColumnType === "calculated"
  );
  const bodyColumns = filter(columns, (col: Table.Column<R, M, any, PDFM>) => col.tableColumnType === "body");
  // It doesn't matter where the fake columns go in the ordering because they are not
  // displayed - all we care about is that they are present.
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

/* eslint-disable indent */
export const ActionColumn = <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>(
  col: Partial<Table.Column<R, M, any>>
): Table.Column<R, M, any> => ({
  ...col,
  selectable: false,
  tableColumnType: "action",
  isRead: false,
  isWrite: false,
  headerName: "",
  editable: false,
  suppressSizeToFit: true,
  resizable: false,
  cellClass: aggrid.mergeClassNamesFn("cell--action", col.cellClass),
  canBeHidden: false,
  canBeExported: false
});

export const FakeColumn = <
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  PDFM extends Model.HttpModel = any
>(
  col: Partial<Table.Column<R, M, any, PDFM>>
): Table.Column<R, M, any, PDFM> => ({
  ...col,
  canBeHidden: false,
  tableColumnType: "fake"
});

export const CalculatedColumn = <
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  PDFM extends Model.HttpModel = any
>(
  col: Partial<Table.Column<R, M, number, PDFM>>,
  width?: number
): Table.Column<R, M, number, PDFM> => {
  return {
    ...col,
    cellStyle: { textAlign: "right", ...col?.cellStyle },
    cellRenderer: "CalculatedCell",
    tableColumnType: "calculated",
    columnType: "sum",
    isRead: true,
    isWrite: false,
    suppressSizeToFit: true,
    width: !isNil(width) ? width : 100,
    // maxWidth: !isNil(width) ? width : 100,
    cellClass: aggrid.mergeClassNamesFn("cell--calculated", col?.cellClass),
    valueFormatter: formatters.currencyValueFormatter,
    cellRendererParams: {
      ...col?.cellRendererParams,
      renderRedIfNegative: true
    }
  };
};

export const AttachmentsColumn = <
  R extends Tables.ActualRowData | Tables.SubAccountRowData,
  M extends Model.HttpModel = Model.HttpModel
>(
  col: Partial<Table.Column<R, M, Model.SimpleAttachment[]>>,
  width?: number
): Table.Column<R, M, Model.SimpleAttachment[]> => {
  return {
    ...col,
    headerName: "Attachments",
    editable: true,
    requiresAuthentication: true,
    cellRenderer: { data: "AttachmentsCell" },
    cellEditor: "NullCellEditor",
    tableColumnType: "body",
    columnType: "file",
    isRead: true,
    isWrite: true,
    nullValue: [],
    width: !isNil(width) ? width : 140,
    getHttpValue: (value: Model.SimpleAttachment[]) => map(value, (m: Model.SimpleAttachment) => m.id)
  };
};

export const BodyColumn = <
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  V = any,
  PDFM extends Model.HttpModel = any
>(
  col?: Partial<Table.Column<R, M, V, PDFM>>
): Table.Column<R, M, V, PDFM> => {
  return {
    ...col,
    tableColumnType: "body"
  };
};

export const ExpandColumn = <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>(
  col: Partial<Table.Column<R, M, any>>,
  width?: number
): Table.Column<R, M, any> =>
  ActionColumn({
    /* eslint-disable indent */
    cellRenderer: { data: "ExpandCell" },
    ...col,
    width: !isNil(width) ? width : 30,
    maxWidth: !isNil(width) ? width : 30,
    field: "expand" as keyof R & string
  });

export const IndexColumn = <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>(
  col: Partial<Table.Column<R, M>>,
  hasExpandColumn: boolean,
  width?: number
): Table.Column<R, M> =>
  ActionColumn({
    /* eslint-disable indent */
    cellRenderer: "EmptyCell",
    ...col,
    field: "index" as keyof R,
    width: !isNil(width) ? width : hasExpandColumn === false ? 40 : 25,
    maxWidth: !isNil(width) ? width : hasExpandColumn === false ? 40 : 25
  }) as Table.Column<R, M>;

// Abstract - not meant to be used by individual columns.  It just enforces that
// the clipboard processing props are provided.
export const SelectColumn = <
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  V = any,
  PDFM extends Model.HttpModel = any
>(
  col: Partial<Table.Column<R, M, V, PDFM>>
): Table.Column<R, M, V, PDFM> => {
  return BodyColumn<R, M, V, PDFM>({
    columnType: "singleSelect",
    suppressSizeToFit: true,
    ...col,
    cellEditorPopup: true,
    cellEditorPopupPosition: "below",
    cellClass: aggrid.mergeClassNamesFn("cell--renders-html", col?.cellClass),
    // Required to allow the dropdown to be selectable on Enter key.
    suppressKeyboardEvent: !isNil(col?.suppressKeyboardEvent)
      ? col?.suppressKeyboardEvent
      : (params: SuppressKeyboardEventParams) => {
          if ((params.event.code === "Enter" || params.event.code === "Tab") && params.editing) {
            return true;
          }
          return false;
        }
  });
};

export const TagSelectColumn = <
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  PDFM extends Model.HttpModel = any
>(
  col: Partial<Table.Column<R, M, Model.Tag, PDFM>>
): Table.Column<R, M, Model.Tag, PDFM> => {
  return SelectColumn({
    processCellForClipboard: (row: R) => {
      const field = col?.field || (col?.colId as keyof R);
      if (!isNil(field)) {
        const m: Model.Tag | undefined = util.getKeyValue<R, keyof R>(field)(row) as any;
        return m?.title || "";
      }
      return "";
    },
    getHttpValue: (value: Model.Tag | null): ID | null => (!isNil(value) ? value.id : null),
    ...col
  });
};
export const ChoiceSelectColumn = <
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  C extends Model.Choice<any, any> = Model.Choice<any, any>,
  PDFM extends Model.HttpModel = any
>(
  col: Partial<Table.Column<R, M, C, PDFM>>
): Table.Column<R, M, C, PDFM> => {
  return SelectColumn<R, M, C, PDFM>({
    getHttpValue: (value: C | null): ID | null => (!isNil(value) ? value.id : null),
    processCellForClipboard: (row: R) => {
      const field = col.field || (col.colId as keyof R);
      if (!isNil(field)) {
        const m: C | undefined = util.getKeyValue<R, keyof R>(field)(row) as any;
        return m?.name || "";
      }
      return "";
    },
    ...col
  });
};
