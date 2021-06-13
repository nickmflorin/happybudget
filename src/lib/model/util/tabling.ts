import React from "react";
import { forEach, groupBy, isNil, reduce, find } from "lodash";
import { ColDef } from "@ag-grid-community/core";

import * as models from "lib/model";
import { contrastedForegroundColor } from "lib/util/colors";
import { tableChangeIsCellChange, tableChangeIsRowChange } from "../typeguards/tabling";

export const getGroupColorDefinition = (group: Model.Group): Table.RowColorDefinition => {
  if (!isNil(group) && !isNil(group.color)) {
    let backgroundColor = group.color;
    if (!isNil(backgroundColor)) {
      if (!backgroundColor.startsWith("#")) {
        backgroundColor = `#${group.color}`;
      }
      return {
        backgroundColor,
        color: contrastedForegroundColor(backgroundColor)
      };
    }
  }
  return {};
};

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
    const ct: Table.ColumnType | undefined = find(models.ColumnTypes, { id: type } as any);
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

export const toAgGridColDef = <R extends Table.Row = Table.Row>(colDef: Table.Column<R>): ColDef => {
  const {
    nullValue,
    isCalculated,
    processCellForClipboard,
    processCellFromClipboard,
    type,
    budget,
    footer,
    ...original
  } = colDef;
  original.cellStyle = { ...getColumnTypeCSSStyle(colDef.type), ...original.cellStyle };
  return original;
};

export const cellChangeToRowChange = <R extends Table.Row>(
  cellChange: Table.CellChange<R, any>
): Table.RowChange<R> => {
  let rowChange: Table.RowChange<R> = {
    id: cellChange.id,
    data: {}
  };
  let rowChangeData: Table.RowChangeData<R> = {};
  rowChangeData = {
    ...rowChangeData,
    [cellChange.field]: { oldValue: cellChange.oldValue, newValue: cellChange.newValue }
  };
  rowChange = {
    ...rowChange,
    data: rowChangeData
  };
  return rowChange;
};

export const addCellChangeToRowChange = <R extends Table.Row = Table.Row>(
  rowChange: Table.RowChange<R>,
  cellChange: Table.CellChange<R>
): Table.RowChange<R> => {
  let newRowChange = { ...rowChange };
  if (isNil(newRowChange.data[cellChange.field])) {
    newRowChange = {
      ...newRowChange,
      data: {
        ...newRowChange.data,
        [cellChange.field]: { oldValue: cellChange.oldValue, newValue: cellChange.newValue }
      }
    };
  } else {
    // If the Table.CellChange field is already in the Table.RowChange data, that means
    // it was changed multiple times.  We want to maintain the original `oldValue` but just
    // alter the `newValue`.
    newRowChange = {
      ...newRowChange,
      data: {
        ...newRowChange.data,
        [cellChange.field]: { ...newRowChange.data[cellChange.field], newValue: cellChange.newValue }
      }
    };
  }
  return newRowChange;
};

export const reduceChangesForRow = <R extends Table.Row = Table.Row>(
  initial: Table.RowChange<R> | Table.CellChange<R>,
  change: Table.RowChange<R> | Table.CellChange<R>
): Table.RowChange<R> => {
  if (initial.id !== change.id) {
    throw new Error("Cannot reduce table changes for different rows.");
  }
  const initialRowChange: Table.RowChange<R> = tableChangeIsRowChange(initial)
    ? initial
    : cellChangeToRowChange(initial);
  if (tableChangeIsCellChange(change)) {
    return addCellChangeToRowChange(initialRowChange, change);
  } else {
    let rowChange = { ...initialRowChange };
    forEach(change.data, (cellChange: Table.CellChange<R>, field: keyof R) => {
      rowChange = addCellChangeToRowChange(rowChange, cellChange);
    });
    return rowChange;
  }
};

export const consolidateTableChange = <R extends Table.Row = Table.Row>(
  change: Table.Change<R>
): Table.ConsolidatedChange<R> => {
  if (Array.isArray(change)) {
    const grouped = groupBy(change, "id") as {
      [key: number]: (Table.RowChange<R> | Table.CellChange<R, R[keyof R]>)[];
    };
    const merged: Table.RowChange<R>[] = Object.keys(grouped).map((id: string) => {
      const initial: Table.RowChange<R> = { id: parseInt(id), data: {} };
      return reduce(grouped[parseInt(id)], reduceChangesForRow, initial);
    });
    return merged;
  } else if (tableChangeIsCellChange(change)) {
    return [cellChangeToRowChange(change)];
  } else {
    return [change];
  }
};
