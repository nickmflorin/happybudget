import { groupBy, isNil, reduce } from "lodash";

import * as util from "../util";

export const collapseSoloCellChange = <R extends Table.RowData>(
  cellChange: Table.SoloCellChange<R>
): Table.CellChange<R> => {
  return {
    oldValue: cellChange.oldValue,
    newValue: cellChange.newValue
  };
};

export const cellChangeToRowChange = <R extends Table.RowData, M extends Model.Model = Model.Model>(
  cellChange: Table.SoloCellChange<R>
): Table.RowChange<R, M> => {
  let rowChange: Table.RowChange<R, M> = {
    id: cellChange.id,
    data: {}
  };
  let rowChangeData: Table.RowChangeData<R, M> = {};
  rowChangeData = {
    ...rowChangeData,
    [cellChange.field as string]: collapseSoloCellChange(cellChange)
  };
  rowChange = {
    ...rowChange,
    data: rowChangeData
  };
  return rowChange;
};

export const addCellChangeToRowChange = <R extends Table.RowData, M extends Model.Model = Model.Model>(
  rowChange: Table.RowChange<R, M>,
  cellChange: Table.SoloCellChange<R>
): Table.RowChange<R, M> => {
  const fieldChange = util.getKeyValue<Table.RowChangeData<R, M>, keyof R>(cellChange.field)(rowChange.data) as
    | Omit<Table.SoloCellChange<R>, "field" | "id">
    | undefined;
  if (isNil(fieldChange)) {
    return {
      ...rowChange,
      data: {
        ...rowChange.data,
        [cellChange.field as string]: collapseSoloCellChange(cellChange)
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

export const cellChangesToRowChanges = <R extends Table.RowData, M extends Model.Model = Model.Model>(
  cellChanges: Table.SoloCellChange<R>[]
): Table.RowChange<R, M>[] => {
  /* eslint-disable no-unused-vars */
  const grouped: { [key in Table.RowID]: Table.SoloCellChange<R>[] } = groupBy(
    cellChanges,
    (ch: Table.SoloCellChange<R>) => ch.id
  );
  return reduce(
    grouped,
    (curr: Table.RowChange<R, M>[], group: Table.SoloCellChange<R>[], id: ID) => {
      return [
        ...curr,
        reduce(
          group,
          (cr: Table.RowChange<R, M>, ch: Table.SoloCellChange<R>) => {
            return addCellChangeToRowChange(cr, ch);
          },
          { id, data: {} }
        )
      ];
    },
    []
  );
};

export const consolidateTableChange = <R extends Table.RowData, M extends Model.Model = Model.Model>(
  change: Table.DataChangePayload<R, M>
): Table.ConsolidatedChange<R, M> => {
  const reduceChangesForRow = (initial: Table.RowChange<R, M>, ch: Table.RowChange<R, M>): Table.RowChange<R, M> => {
    if (initial.id !== ch.id) {
      throw new Error("Cannot reduce table changes for different rows.");
    }
    let rowChange = { ...initial };
    let key: keyof R;
    for (key in ch.data) {
      const cellChange: Table.CellChange<R> | undefined = util.getKeyValue<Table.RowChangeData<R, M>, keyof R>(key)(
        ch.data
      );
      if (!isNil(cellChange)) {
        rowChange = addCellChangeToRowChange(rowChange, { ...cellChange, field: key, id: rowChange.id });
      }
    }
    return rowChange;
  };
  if (Array.isArray(change)) {
    const grouped = groupBy(change, "id") as {
      [key in Table.DataRowID]: Table.RowChange<R, M>[];
    };
    let id: Table.DataRowID;
    const merged: Table.RowChange<R, M>[] = [];
    for (id in grouped) {
      merged.push(reduce(grouped[parseInt(id)], reduceChangesForRow, { id: id, data: {} }));
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
