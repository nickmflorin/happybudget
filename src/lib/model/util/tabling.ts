import { forEach, groupBy, isNil, reduce, find } from "lodash";
import { ColDef } from "@ag-grid-community/core";

import * as models from "lib/model";
import { tableChangeIsCellChange, tableChangeIsRowChange } from "../typeguards/tabling";

export const toAgGridColDef = <R extends Table.Row = Table.Row>(colDef: Table.Column<R>): ColDef => {
  const {
    nullValue,
    isCalculated,
    budgetTotal,
    tableTotal,
    processCellForClipboard,
    processCellFromClipboard,
    type,
    ...original
  } = colDef;

  // TODO: Make the ColDef's an actual Model and have this be a property.
  const colType = find(models.ColumnTypes, { id: colDef.type } as any);
  if (!isNil(colType)) {
    original.cellStyle = { textAlign: colType.align, ...original.cellStyle };
  }
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
