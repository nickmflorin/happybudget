import { isNil, reduce, uniq, map, filter, flatten } from "lodash";

import { util } from "lib";

export const cellChangeToRowChange = <
  R extends Table.RowData,
  RW extends Table.EditableRow<R> = Table.EditableRow<R>,
>(
  cellChange: Table.SoloCellChange<R, RW>,
): Table.RowChange<R, RW> => ({
  id: cellChange.id,
  data: {
    [cellChange.field]: {
      oldValue: cellChange.oldValue,
      newValue: cellChange.newValue,
    },
  } as Table.RowChangeData<R, RW>,
});

export const addCellChangeToRowChange = <
  R extends Table.RowData,
  RW extends Table.EditableRow<R> = Table.EditableRow<R>,
>(
  rowChange: Table.RowChange<R, RW>,
  cellChange: Table.SoloCellChange<R, RW>,
): Table.RowChange<R, RW> => {
  const fieldChange = util.getKeyValue<Table.RowChangeData<R, RW>, keyof RW["data"]>(
    cellChange.field,
  )(rowChange.data) as Omit<Table.SoloCellChange<R, RW>, "field" | "id"> | undefined;
  if (isNil(fieldChange)) {
    return {
      ...rowChange,
      data: {
        ...rowChange.data,
        [cellChange.field as string]: {
          oldValue: cellChange.oldValue,
          newValue: cellChange.newValue,
        },
      },
    };
  } else {
    /* If the Table.SoloCellChange field is already in the Table.RowChange data,
			 that means it was changed multiple times.  We want to maintain the
			 original `oldValue` but just alter the `newValue`. */
    return {
      ...rowChange,
      data: {
        ...rowChange.data,
        [cellChange.field as string]: { ...fieldChange, newValue: cellChange.newValue },
      },
    };
  }
};

const reduceChangesForRow = <
  R extends Table.RowData,
  RW extends Table.EditableRow<R> = Table.EditableRow<R>,
>(
  initial: Table.RowChange<R, RW>,
  ch: Table.RowChange<R, RW>,
): Table.RowChange<R, RW> => {
  if (initial.id !== ch.id) {
    throw new Error("Cannot reduce table changes for different rows.");
  }
  let rowChange = { ...initial };
  let key: keyof RW["data"];
  for (key in ch.data) {
    const cellChange: Table.CellChange<R[keyof R]> | undefined = util.getKeyValue<
      Table.RowChangeData<R, RW>,
      keyof RW["data"]
    >(key)(ch.data);
    if (!isNil(cellChange)) {
      rowChange = addCellChangeToRowChange(rowChange, {
        ...cellChange,
        field: key,
        id: rowChange.id,
      });
    }
  }
  return rowChange;
};

const flattenRowChanges = <
  R extends Table.RowData,
  RW extends Table.EditableRow<R> = Table.EditableRow<R>,
>(
  changes: Table.RowChange<R, RW>[],
): Table.RowChange<R, RW> | null => {
  if (changes.length !== 0) {
    const ids: RW["id"][] = uniq(map(changes, (ch: Table.RowChange<R, RW>) => ch.id));
    if (ids.length !== 1) {
      throw new Error("Can only flatten row changes that belong to the same row.");
    }
    return reduce(changes.slice(1), reduceChangesForRow, changes[0]);
  }
  return null;
};

const reduceChangesForCell = <
  R extends Table.RowData,
  RW extends Table.EditableRow<R> = Table.EditableRow<R>,
>(
  initial: Table.RowChange<R, RW>,
  ch: Table.SoloCellChange<R, RW>,
): Table.RowChange<R, RW> => {
  if (initial.id !== ch.id) {
    throw new Error("Cannot reduce table changes for different rows.");
  }
  return addCellChangeToRowChange(initial, ch);
};

const flattenCellChanges = <
  R extends Table.RowData,
  RW extends Table.EditableRow<R> = Table.EditableRow<R>,
>(
  changes: Table.SoloCellChange<R, RW>[],
): Table.RowChange<R, RW> | null => {
  if (changes.length !== 0) {
    const ids: RW["id"][] = uniq(map(changes, (ch: Table.SoloCellChange<R, RW>) => ch.id));
    if (ids.length !== 1) {
      throw new Error("Can only flatten cell changes that belong to the same row.");
    }
    return reduce(changes, reduceChangesForCell, { id: ids[0], data: {} });
  }
  return null;
};

export const consolidateCellChanges = <
  R extends Table.RowData,
  RW extends Table.EditableRow<R> = Table.EditableRow<R>,
>(
  changes: Table.SoloCellChange<R, RW>[] | Table.SoloCellChange<R, RW>,
): Table.RowChange<R, RW>[] => {
  const cellChanges: Table.SoloCellChange<R, RW>[] = Array.isArray(changes) ? changes : [changes];
  /* Note: It is difficult to use a groupBy operation here because the operation
     will convert integer IDs to string IDs so they can index the output
		 object. */
  const ids: Table.EditableRowId[] = uniq(
    map(cellChanges, (ch: Table.SoloCellChange<R, RW>) => ch.id),
  );
  return reduce(
    ids,
    (curr: Table.RowChange<R, RW>[], id: Table.EditableRowId) => {
      const changesForRow = filter(cellChanges, (ch: Table.SoloCellChange<R, RW>) => ch.id === id);
      const flattened: Table.RowChange<R, RW> | null = flattenCellChanges(changesForRow);
      if (!isNil(flattened)) {
        return [...curr, flattened];
      }
      return curr;
    },
    [],
  );
};

export const consolidateRowChanges = <
  R extends Table.RowData,
  RW extends Table.EditableRow<R> = Table.EditableRow<R>,
>(
  changes: Table.RowChange<R, RW>[] | Table.RowChange<R, RW>,
): Table.ConsolidatedChange<R, RW> => {
  const rowChanges: Table.RowChange<R, RW>[] = Array.isArray(changes) ? changes : [changes];
  /* Note: It is difficult to use a groupBy operation here because the operation
     will convert integer IDs to string IDs so they can index the output
		 object. */
  const ids: RW["id"][] = uniq(map(rowChanges, (ch: Table.RowChange<R, RW>) => ch.id));
  return reduce(
    ids,
    (curr: Table.RowChange<R, RW>[], id: RW["id"]) => {
      const changesForRow = filter(rowChanges, (ch: Table.RowChange<R, RW>) => ch.id === id);
      const flattened: Table.RowChange<R, RW> | null = flattenRowChanges(changesForRow);
      if (!isNil(flattened)) {
        return [...curr, flattened];
      }
      return curr;
    },
    [],
  );
};

export const consolidateRowAddEvents = <R extends Table.RowData>(
  events: Table.RowAddDataEvent<R>[],
): Table.RowAddDataEvent<R> => ({
  type: "rowAdd",
  placeholderIds: flatten(map(events, (e: Table.RowAddDataEvent<R>) => e.placeholderIds)),
  payload: reduce(
    events,
    (curr: Partial<R>[], e: Table.RowAddDataEvent<R>) => [...curr, ...e.payload],
    [],
  ),
});

export const consolidateDataChangeEvents = <
  R extends Table.RowData,
  RW extends Table.EditableRow<R> = Table.EditableRow<R>,
>(
  events: Table.DataChangeEvent<R, RW>[],
): Table.DataChangeEvent<R, RW> => {
  const rowChanges: Table.RowChange<R, RW>[] = reduce(
    events,
    (curr: Table.RowChange<R, RW>[], e: Table.DataChangeEvent<R, RW>): Table.RowChange<R, RW>[] => [
      ...curr,
      ...(Array.isArray(e.payload) ? e.payload : [e.payload]),
    ],
    [],
  );
  return { type: "dataChange", payload: consolidateRowChanges(rowChanges) };
};
