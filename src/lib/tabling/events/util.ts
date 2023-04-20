import { uniq } from "lodash";

import * as columns from "../columns";
import * as rows from "../rows";

import * as types from "./types";

export const cellChangeToRowChange = <R extends rows.Row, K extends columns.ColumnFieldName<R>>(
  soloCellChange: types.SoloCellChange<R, K>,
): types.RowChange<R> => {
  const rowChangeData: types.RowChangeData<R> = {} as types.RowChangeData<R>;
  rowChangeData[soloCellChange.field] = {
    oldValue: soloCellChange.oldValue,
    newValue: soloCellChange.newValue,
  };
  return {
    id: soloCellChange.id,
    data: rowChangeData,
  };
};

export const addCellChangeToRowChange = <R extends rows.Row>(
  rowChange: types.RowChange<R>,
  cellChange: types.SoloCellChange<R>,
): types.RowChange<R> => {
  const delta: types.CellChange<R> | undefined = rowChange.data[cellChange.field];
  if (delta === undefined) {
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
  }
  /* At this point, the field already has a registered change in the data - so it is being changed
     multiple times.  This means that we need to reconcile the start and end values between the
     two sequential changes. */
  return {
    ...rowChange,
    data: {
      ...rowChange.data,
      [cellChange.field]: { oldValue: delta.oldValue, newValue: cellChange.newValue },
    },
  };
};

const reduceChangesForRow = <R extends rows.Row>(
  initial: types.RowChange<R>,
  ch: types.RowChange<R>,
): types.RowChange<R> => {
  if (initial.id !== ch.id) {
    throw new Error("Cannot reduce table changes for different rows.");
  }
  let rowChange = { ...initial };

  let key: columns.ColumnFieldName<R>;
  for (key in ch.data) {
    const cellChange = ch.data[key];
    if (cellChange !== undefined) {
      rowChange = addCellChangeToRowChange<R>(rowChange, {
        ...cellChange,
        field: key,
        id: rowChange.id,
      } as types.SoloCellChange<R>);
    }
  }
  return rowChange;
};

const flattenRowChanges = <R extends rows.Row>(
  changes: types.RowChange<R>[],
): types.RowChange<R> | null => {
  if (changes.length !== 0) {
    const ids = uniq(changes.map((ch: types.RowChange<R>) => ch.id));
    if (ids.length !== 1) {
      throw new Error("Can only flatten row changes that belong to the same row.");
    }
    return changes.slice(1).reduce(reduceChangesForRow, changes[0]);
  }
  return null;
};

const reduceChangesForCell = <R extends rows.Row>(
  initial: types.RowChange<R>,
  ch: types.SoloCellChange<R>,
): types.RowChange<R> => {
  if (initial.id !== ch.id) {
    throw new Error("Cannot reduce table changes for different rows.");
  }
  return addCellChangeToRowChange(initial, ch);
};

const flattenCellChanges = <R extends rows.Row>(
  changes: types.SoloCellChange<R>[],
): types.RowChange<R> | null => {
  if (changes.length !== 0) {
    const ids = uniq(changes.map((ch: types.SoloCellChange<R>) => ch.id));
    if (ids.length !== 1) {
      throw new Error("Can only flatten cell changes that belong to the same row.");
    }
    return changes.reduce(reduceChangesForCell, { id: ids[0], data: {} });
  }
  return null;
};

export const consolidateCellChanges = <R extends rows.Row>(
  changes: types.SoloCellChange<R>[] | types.SoloCellChange<R>,
): types.RowChange<R>[] => {
  const cellChanges: types.SoloCellChange<R>[] = Array.isArray(changes) ? changes : [changes];
  /* Note: It is difficult to use a groupBy operation here because the operation will convert
     integer IDs to string IDs so they can index the output object. */
  const ids: R["id"][] = uniq(cellChanges.map((ch: types.SoloCellChange<R>) => ch.id));
  return ids.reduce((prev: types.RowChange<R>[], id: R["id"]): types.RowChange<R>[] => {
    const changesForRow = cellChanges.filter((ch: types.SoloCellChange<R>) => ch.id === id);
    const flattened: types.RowChange<R> | null = flattenCellChanges(changesForRow);
    if (flattened !== null) {
      return [...prev, flattened];
    }
    return prev;
  }, []);
};

export const consolidateRowChanges = <R extends rows.Row>(
  changes: types.RowChange<R>[] | types.RowChange<R>,
): types.RowChange<R>[] => {
  const rowChanges: types.RowChange<R>[] = Array.isArray(changes) ? changes : [changes];
  /* Note: It is difficult to use a groupBy operation here because the operation will convert
     integer IDs to string IDs so they can index the output object. */
  const ids: R["id"][] = uniq(rowChanges.map((ch: types.RowChange<R>) => ch.id));
  return ids.reduce((prev: types.RowChange<R>[], id: R["id"]) => {
    const changesForRow = rowChanges.filter((ch: types.RowChange<R>) => ch.id === id);
    const flattened: types.RowChange<R> | null = flattenRowChanges(changesForRow);
    if (flattened !== null) {
      return [...prev, flattened];
    }
    return prev;
  }, []);
};

export const consolidateRowAddEvents = <R extends rows.Row>(
  events: types.ChangeEvent<"rowAddData", R>[],
): types.ChangeEvent<"rowAddData", R> => ({
  type: "rowAddData",
  payload: events.reduce(
    (
      prev: types.RowAddDataPayload<R>,
      e: types.ChangeEvent<"rowAddData", R>,
    ): types.RowAddDataPayload<R> => ({
      data: [
        ...(Array.isArray(prev.data) ? prev.data : [prev.data]),
        ...(Array.isArray(e.payload.data) ? e.payload.data : [e.payload.data]),
      ],
      placeholderIds: [
        ...(Array.isArray(prev.placeholderIds) ? prev.placeholderIds : [prev.placeholderIds]),
        ...(Array.isArray(e.payload.placeholderIds)
          ? e.payload.placeholderIds
          : [e.payload.placeholderIds]),
      ],
    }),
    { data: [], placeholderIds: [] },
  ),
});

export const consolidateDataChangeEvents = <R extends rows.Row>(
  events: types.ChangeEvent<"dataChange", R>[],
): types.ChangeEvent<"dataChange", R> => {
  const rowChanges: types.RowChange<R>[] = events.reduce(
    (prev: types.RowChange<R>[], e: types.ChangeEvent<"dataChange", R>): types.RowChange<R>[] => [
      ...prev,
      ...(Array.isArray(e.payload) ? e.payload : [e.payload]),
    ],
    [],
  );
  return { type: "dataChange", payload: consolidateRowChanges(rowChanges) };
};
