import { groupBy, isNil, reduce } from "lodash";

import * as util from "../util";

/* eslint-disable indent */
export const cellChangeToRowChange = <
  R extends Table.RowData,
  M extends Model.HttpModel,
  RW extends Table.EditableRow<R, M> = Table.EditableRow<R, M>
>(
  cellChange: Table.SoloCellChange<R, M, RW>
): Table.RowChange<R, M, RW> => {
  let rowChange: Table.RowChange<R, M, RW> = {
    id: cellChange.id,
    data: {},
    row: cellChange.row
  };
  let rowChangeData: Table.RowChangeData<R> = {};
  rowChangeData = {
    ...rowChangeData,
    [cellChange.field as string]: {
      oldValue: cellChange.oldValue,
      newValue: cellChange.newValue
    }
  };
  rowChange = {
    ...rowChange,
    data: rowChangeData
  };
  return rowChange;
};

export const addCellChangeToRowChange = <
  R extends Table.RowData,
  M extends Model.HttpModel,
  RW extends Table.EditableRow<R, M> = Table.EditableRow<R, M>
>(
  rowChange: Table.RowChange<R, M, RW>,
  cellChange: Table.SoloCellChange<R, M, RW>
): Table.RowChange<R, M, RW> => {
  const fieldChange = util.getKeyValue<Table.RowChangeData<R>, keyof R>(cellChange.field)(rowChange.data) as
    | Omit<Table.SoloCellChange<R, M, RW>, "field" | "id">
    | undefined;
  if (isNil(fieldChange)) {
    return {
      ...rowChange,
      data: {
        ...rowChange.data,
        [cellChange.field as string]: {
          oldValue: cellChange.oldValue,
          newValue: cellChange.newValue
        }
      }
    };
  } else {
    // If the Table.SoloCellChange field is already in the Table.RowChange data, that means
    // it was changed multiple times.  We want to maintain the original `oldValue` but just
    // alter the `newValue`.
    return {
      ...rowChange,
      data: {
        ...rowChange.data,
        [cellChange.field as string]: { ...fieldChange, newValue: cellChange.newValue }
      }
    };
  }
};

export const cellChangesToRowChanges = <
  R extends Table.RowData,
  M extends Model.HttpModel,
  RW extends Table.EditableRow<R, M> = Table.EditableRow<R, M>
>(
  cellChanges: Table.SoloCellChange<R, M, RW>[]
): Table.RowChange<R, M, RW>[] => {
  /* eslint-disable no-unused-vars */
  const grouped: { [key in Table.EditableRowId]: Table.SoloCellChange<R, M, RW>[] } = groupBy(
    cellChanges,
    (ch: Table.SoloCellChange<R, M, RW>) => ch.id
  );
  return reduce(
    grouped,
    (
      curr: Table.RowChange<R, M, RW>[],
      group: Table.SoloCellChange<R, M, RW>[],
      id: string | number
    ): Table.RowChange<R, M, RW>[] => {
      if (group.length !== 0) {
        return [
          ...curr,
          reduce(
            group,
            (cr: Table.RowChange<R, M, RW>, ch: Table.SoloCellChange<R, M, RW>) => {
              // return addCellChangeToRowChange(cr, ch);
              return cr;
            },
            // Note: Since the changes are grouped by Row ID, the row will be
            // close to the same for each <SoloCellChange> in the group.  All
            // of the properties that we care about will be the same, but the
            // data might differ... we should improve this API.
            { id: id as Table.EditableRowId, data: {}, row: group[0].row }
          )
        ];
      }
      return curr;
    },
    []
  );
};

export const consolidateTableChange = <
  R extends Table.RowData,
  M extends Model.HttpModel,
  RW extends Table.EditableRow<R, M> = Table.EditableRow<R, M>
>(
  change: Table.DataChangePayload<R, M, RW>
): Table.ConsolidatedChange<R, M, RW> => {
  const reduceChangesForRow = (
    initial: Table.RowChange<R, M, RW>,
    ch: Table.RowChange<R, M, RW>
  ): Table.RowChange<R, M, RW> => {
    if (initial.id !== ch.id) {
      throw new Error("Cannot reduce table changes for different rows.");
    }
    let rowChange = { ...initial };
    let key: keyof R;
    for (key in ch.data) {
      const cellChange: Table.CellChange<R> | undefined = util.getKeyValue<Table.RowChangeData<R>, keyof R>(key)(
        ch.data
      );
      if (!isNil(cellChange)) {
        rowChange = addCellChangeToRowChange(rowChange, {
          ...cellChange,
          field: key,
          id: rowChange.id,
          row: initial.row
        });
      }
    }
    return rowChange;
  };
  if (Array.isArray(change)) {
    const grouped = groupBy(change, "id") as {
      [key in Table.EditableRowId]: Table.RowChange<R, M, RW>[];
    };
    let id: Table.EditableRowId;
    const merged: Table.RowChange<R, M, RW>[] = [];
    for (id in grouped) {
      if (grouped[id].length !== 0) {
        merged.push(
          reduce(grouped[id], reduceChangesForRow, {
            id: id,
            data: {},
            // Note: Since the changes are grouped by Row ID, the row will be
            // close to the same for each <SoloCellChange> in the group.  All
            // of the properties that we care about will be the same, but the
            // data might differ... we should improve this API.
            row: grouped[id][0].row
          })
        );
      }
    }
    return merged;
  } else {
    return [change];
  }
};

/* eslint-disable indent */
export const rowAddToRowData = <R extends Table.RowData>(add: Table.RowAdd<R>): R =>
  reduce(
    add.data,
    (curr: R, cellAdd: Table.CellAdd<R> | undefined, field: string) => {
      return !isNil(cellAdd) ? { ...curr, [field as keyof R]: cellAdd.value } : curr;
    },
    {} as R
  );
