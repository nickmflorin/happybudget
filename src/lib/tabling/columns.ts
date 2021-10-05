import React from "react";
import { find, isNil, reduce, filter, orderBy } from "lodash";

import { ColumnTypes } from "./models";

export const normalizedField = <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>(
  col: Table.AnyColumn<R, M>
): keyof R | string | undefined => (col.field !== undefined ? col.field : col.colId);

type ColumnTypeVariantOptions = {
  header?: boolean;
  pdf?: boolean;
};

export const getColumnTypeCSSStyle = (
  type: Table.ColumnTypeId | Table.ColumnType,
  options: ColumnTypeVariantOptions = { header: false, pdf: false }
): React.CSSProperties => {
  let colType: Table.ColumnType;
  if (typeof type === "string") {
    const ct: Table.ColumnType | undefined = find(ColumnTypes, { id: type } as any);
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

/* eslint-disable no-unused-vars */
/* eslint-disable indent */
type ColumnUpdates<
  C extends Table.AnyColumn<R, M>,
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel
> = {
  [key in keyof R | string]: Partial<C> | ((c: C) => Partial<C>);
};

export const mergeColumns = <
  C extends Table.AnyColumn<R, M>,
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel
>(
  columns: C[],
  updates: Partial<ColumnUpdates<C, R, M>>
): C[] => {
  let key: keyof R | string;
  let merged: C[] = [...columns];
  for (key in updates) {
    const fieldUpdates: Partial<C> | ((c: C) => Partial<C>) | undefined = updates[key];
    if (!isNil(fieldUpdates)) {
      merged = updateColumnsOfField<C, R, M>(merged, key, fieldUpdates);
    }
  }
  return merged;
};

export const updateColumnsOfTableType = <
  C extends Table.AnyColumn<R, M>,
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel
>(
  columns: C[],
  type: Table.TableColumnTypeId,
  update: Partial<C> | ((c: C) => Partial<C>)
): C[] => {
  return reduce(
    columns,
    (curr: C[], col: C) => {
      if (col.tableColumnType === type) {
        return [...curr, { ...col, ...(typeof update === "function" ? update(col) : update) }];
      }
      return [...curr, col];
    },
    []
  );
};

export const updateColumnsOfField = <
  C extends Table.AnyColumn<R, M>,
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel
>(
  columns: C[],
  field: keyof R | string,
  update: Partial<C> | ((c: C) => Partial<C>)
): C[] => {
  return reduce(
    columns,
    (curr: C[], col: C) => {
      if (col.field === field || col.colId === field) {
        return [...curr, { ...col, ...(typeof update === "function" ? update(col) : update) }];
      }
      return [...curr, col];
    },
    []
  );
};

export const orderColumns = <
  C extends Table.AnyColumn<R, M>,
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel
>(
  columns: C[]
): C[] => {
  const actionColumns = filter(columns, (col: C) => col.tableColumnType === "action");
  const calculatedColumns = filter(columns, (col: C) => col.tableColumnType === "calculated");
  const bodyColumns = filter(columns, (col: C) => col.tableColumnType === "body");
  // It doesn't matter where the fake columns go in the ordering because they are not
  // displayed - all we care about is that they are present.
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
