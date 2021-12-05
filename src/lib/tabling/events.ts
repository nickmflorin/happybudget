import { isNil, reduce, uniq, map, filter, flatten } from "lodash";

import * as util from "../util";

/* eslint-disable indent */
export const cellChangeToRowChange = <R extends Table.RowData, I extends Table.EditableRowId = Table.EditableRowId>(
  cellChange: Table.SoloCellChange<R, I>
): Table.RowChange<R, I> => ({
  id: cellChange.id,
  data: {
    [cellChange.field]: {
      oldValue: cellChange.oldValue,
      newValue: cellChange.newValue
    }
  } as Table.RowChangeData<R>
});

export const addCellChangeToRowChange = <R extends Table.RowData, I extends Table.EditableRowId = Table.EditableRowId>(
  rowChange: Table.RowChange<R, I>,
  cellChange: Table.SoloCellChange<R, I>
): Table.RowChange<R, I> => {
  const fieldChange = util.getKeyValue<Table.RowChangeData<R>, keyof R>(cellChange.field)(rowChange.data) as
    | Omit<Table.SoloCellChange<R, I>, "field" | "id">
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

const reduceChangesForRow = <R extends Table.RowData, I extends Table.EditableRowId = Table.EditableRowId>(
  initial: Table.RowChange<R, I>,
  ch: Table.RowChange<R, I>
): Table.RowChange<R, I> => {
  if (initial.id !== ch.id) {
    throw new Error("Cannot reduce table changes for different rows.");
  }
  let rowChange = { ...initial };
  let key: keyof R;
  for (key in ch.data) {
    const cellChange: Table.CellChange<R> | undefined = util.getKeyValue<Table.RowChangeData<R>, keyof R>(key)(ch.data);
    if (!isNil(cellChange)) {
      rowChange = addCellChangeToRowChange(rowChange, {
        ...cellChange,
        field: key,
        id: rowChange.id
      });
    }
  }
  return rowChange;
};

const flattenRowChanges = <R extends Table.RowData, I extends Table.EditableRowId = Table.EditableRowId>(
  changes: Table.RowChange<R, I>[]
): Table.RowChange<R, I> | null => {
  if (changes.length !== 0) {
    const ids: I[] = uniq(map(changes, (ch: Table.RowChange<R, I>) => ch.id));
    if (ids.length !== 1) {
      throw new Error("Can only flatten row changes that belong to the same row.");
    }
    return reduce(changes.slice(1), reduceChangesForRow, changes[0]);
  }
  return null;
};

const reduceChangesForCell = <R extends Table.RowData, I extends Table.EditableRowId = Table.EditableRowId>(
  initial: Table.RowChange<R, I>,
  ch: Table.SoloCellChange<R, I>
): Table.RowChange<R, I> => {
  if (initial.id !== ch.id) {
    throw new Error("Cannot reduce table changes for different rows.");
  }
  return addCellChangeToRowChange(initial, ch);
};

const flattenCellChanges = <R extends Table.RowData, I extends Table.EditableRowId = Table.EditableRowId>(
  changes: Table.SoloCellChange<R, I>[]
): Table.RowChange<R, I> | null => {
  if (changes.length !== 0) {
    const ids: I[] = uniq(map(changes, (ch: Table.SoloCellChange<R, I>) => ch.id));
    if (ids.length !== 1) {
      throw new Error("Can only flatten cell changes that belong to the same row.");
    }
    return reduce(changes, reduceChangesForCell, { id: ids[0], data: {} });
  }
  return null;
};

export const consolidateCellChanges = <R extends Table.RowData, I extends Table.EditableRowId = Table.EditableRowId>(
  changes: Table.SoloCellChange<R, I>[] | Table.SoloCellChange<R, I>
): Table.RowChange<R, I>[] => {
  const cellChanges: Table.SoloCellChange<R, I>[] = Array.isArray(changes) ? changes : [changes];
  // Note: It is difficult to use a groupBy operation here because the operation
  // will convert integer IDs to string IDs so they can index the output object.
  const ids: Table.EditableRowId[] = uniq(map(cellChanges, (ch: Table.SoloCellChange<R, I>) => ch.id));
  return reduce(
    ids,
    (curr: Table.RowChange<R, I>[], id: Table.EditableRowId) => {
      const changesForRow = filter(cellChanges, (ch: Table.SoloCellChange<R, I>) => ch.id === id);
      const flattened: Table.RowChange<R, I> | null = flattenCellChanges(changesForRow);
      if (!isNil(flattened)) {
        return [...curr, flattened];
      }
      return curr;
    },
    []
  );
};

export const consolidateRowChanges = <R extends Table.RowData, I extends Table.EditableRowId = Table.EditableRowId>(
  changes: Table.RowChange<R, I>[] | Table.RowChange<R, I>
): Table.ConsolidatedChange<R, I> => {
  const rowChanges: Table.RowChange<R, I>[] = Array.isArray(changes) ? changes : [changes];
  // Note: It is difficult to use a groupBy operation here because the operation
  // will convert integer IDs to string IDs so they can index the output object.
  const ids: Table.EditableRowId[] = uniq(map(rowChanges, (ch: Table.RowChange<R, I>) => ch.id));
  return reduce(
    ids,
    (curr: Table.RowChange<R, I>[], id: Table.EditableRowId) => {
      const changesForRow = filter(rowChanges, (ch: Table.RowChange<R, I>) => ch.id === id);
      const flattened: Table.RowChange<R, I> | null = flattenRowChanges(changesForRow);
      if (!isNil(flattened)) {
        return [...curr, flattened];
      }
      return curr;
    },
    []
  );
};

export const consolidateRowAddEvents = <R extends Table.RowData>(
  events: Table.RowAddDataEvent<R>[]
): Table.RowAddDataEvent<R> => {
  return {
    type: "rowAdd",
    placeholderIds: flatten(map(events, (e: Table.RowAddDataEvent<R>) => e.placeholderIds)),
    payload: reduce(events, (curr: Partial<R>[], e: Table.RowAddDataEvent<R>) => [...curr, ...e.payload], [])
  };
};

export const consolidateDataChangeEvents = <
  R extends Table.RowData,
  I extends Table.EditableRowId = Table.EditableRowId
>(
  events: Table.DataChangeEvent<R, I>[]
): Table.DataChangeEvent<R, I> => {
  const rowChanges: Table.RowChange<R, I>[] = reduce(
    events,
    (curr: Table.RowChange<R, I>[], e: Table.DataChangeEvent<R, I>) => [
      ...curr,
      ...(Array.isArray(e.payload) ? e.payload : [e.payload])
    ],
    []
  );
  return { type: "dataChange", payload: consolidateRowChanges(rowChanges) };
};

export const mergeChangesWithRow = <R extends Table.RowData>(
  id: Table.RowId,
  row: Table.EditableRow<R>,
  changes: Table.DataChangePayload<R>
): Table.EditableRow<R> => {
  const consolidated: Table.ConsolidatedChange<R> = consolidateRowChanges<R>(changes);
  return {
    ...row,
    data: reduce(
      consolidated,
      (curr: R, change: Table.RowChange<R>) => {
        if (change.id !== id) {
          console.error("Cannot apply table changes from one row to another row!");
          return curr;
        } else {
          let field: keyof R;
          for (field in change.data) {
            const cellChange = util.getKeyValue<Table.RowChangeData<R>, keyof R>(field)(
              change.data
            ) as Table.CellChange<R>;
            curr = { ...curr, [field as string]: cellChange.newValue };
          }
          return curr;
        }
      },
      { ...row.data }
    )
  };
};
