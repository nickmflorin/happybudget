import { groupBy, isNil, reduce, filter } from "lodash";

import * as util from "../util";
import { isDataChangeEvent, isRowAddEvent, isFullRowEvent, isRowDeleteEvent } from "./typeguards";
import { rowWarrantsRecalculation } from "./rows";

export const collapseSoloCellChange = <R extends Table.RowData, M extends Model.Model = Model.Model>(
  cellChange: Table.SoloCellChange<R, M>
): Table.CellChange<R, M> => {
  return {
    oldValue: cellChange.oldValue,
    newValue: cellChange.newValue,
    row: cellChange.row,
    column: cellChange.column
  };
};

export const cellChangeToRowChange = <R extends Table.RowData, M extends Model.Model = Model.Model>(
  cellChange: Table.SoloCellChange<R, M>
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
  cellChange: Table.SoloCellChange<R, M>
): Table.RowChange<R, M> => {
  const fieldChange = util.getKeyValue<Table.RowChangeData<R, M>, keyof R>(cellChange.field)(rowChange.data) as
    | Omit<Table.SoloCellChange<R, M>, "field" | "id">
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
  cellChanges: Table.SoloCellChange<R, M>[]
): Table.RowChange<R, M>[] => {
  /* eslint-disable no-unused-vars */
  const grouped: { [key in Table.RowID]: Table.SoloCellChange<R, M>[] } = groupBy(
    cellChanges,
    (ch: Table.SoloCellChange<R, M>) => ch.id
  );
  return reduce(
    grouped,
    (curr: Table.RowChange<R, M>[], group: Table.SoloCellChange<R, M>[], id: ID) => {
      return [
        ...curr,
        reduce(
          group,
          (cr: Table.RowChange<R, M>, ch: Table.SoloCellChange<R, M>) => {
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
      const cellChange: Table.CellChange<R, M> | undefined = util.getKeyValue<Table.RowChangeData<R, M>, keyof R>(key)(
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

export const cellChangeOrAddWarantsRecalculation = <R extends Table.RowData, M extends Model.Model = Model.Model>(
  change: Table.SoloCellChange<R, M> | Table.CellChange<R, M> | Table.CellAdd<R, M>
): boolean => change.column.isCalculating === true;

export const rowChangeOrAddWarrantsRecalculation = <R extends Table.RowData, M extends Model.Model = Model.Model>(
  change: Table.RowChange<R, M> | Table.RowAdd<R, M>
): boolean =>
  /* eslint-disable indent */
  filter(
    change.data,
    (value: Table.CellChange<R, M> | Table.CellAdd<R, M> | undefined) =>
      !isNil(value) && cellChangeOrAddWarantsRecalculation(value)
  ).length !== 0;

export const changeOrAddWarrantsRecalculation = <R extends Table.RowData, M extends Model.Model = Model.Model>(
  change: Table.DataChangePayload<R, M> | Table.RowAddPayload<R, M>
): boolean => {
  const arrayChanges: (Table.RowChange<R, M> | Table.RowAdd<R, M>)[] = Array.isArray(change) ? change : [change];
  return (
    filter(arrayChanges, (ch: Table.RowChange<R, M> | Table.RowAdd<R, M>) => rowChangeOrAddWarrantsRecalculation(ch))
      .length !== 0
  );
};

export const rowAddToRowData = <R extends Table.RowData, M extends Model.Model = Model.Model>(
  add: Table.RowAdd<R, M>
): R =>
  reduce(
    add.data,
    (curr: R, cellAdd: Table.CellAdd<R, M> | undefined, field: string) => {
      return !isNil(cellAdd) ? { ...curr, [field as keyof R]: cellAdd.value } : curr;
    },
    {} as R
  );

export const addWarrantsRecalculation = <R extends Table.RowData, M extends Model.Model = Model.Model>(
  add: Table.RowAdd<R, M>
): boolean =>
  /* eslint-disable indent */
  filter(add.data, (value: Table.CellAdd<R, M> | undefined) => !isNil(value) && value.column.isCalculating === true)
    .length !== 0;

export const additionsWarrantParentRefresh = <R extends Table.RowData, M extends Model.Model = Model.Model>(
  additions: Table.RowAddPayload<R, M>
): boolean => {
  // If the payload is just a number, we are just creating a certain number of blank
  // rows - so no refresh is warranted.
  if (typeof additions === "number") {
    return false;
  }
  return Array.isArray(additions)
    ? filter(additions, (add: Table.RowAdd<R, M>) => addWarrantsRecalculation(add) === true).length !== 0
    : addWarrantsRecalculation(additions);
};

export const fullRowPayloadRequiresRefresh = <R extends Table.RowData, M extends Model.Model = Model.Model>(payload: {
  rows: Table.DataRow<R, M>[] | Table.DataRow<R, M>;
  columns: Table.Column<R, M>[];
}): boolean => {
  const rows: Table.DataRow<R, M>[] = Array.isArray(payload.rows) ? payload.rows : [payload.rows];
  return filter(rows, (row: Table.DataRow<R, M>) => rowWarrantsRecalculation<R, M>(row, payload.columns)).length !== 0;
};

// Not applicable for GroupDeleteEvent because deletion of a group should not
// warrant any recalculation of that deleted group.
export const eventWarrantsGroupRecalculation = <R extends Table.RowData, M extends Model.Model = Model.Model>(
  e:
    | Table.DataChangeEvent<R, M>
    | Table.RowAddEvent<R, M>
    | Table.RowDeleteEvent<R, M>
    | Table.RowRemoveFromGroupEvent<R, M>
    | Table.RowAddToGroupEvent<R, M>
): boolean => {
  if (isDataChangeEvent(e) || isRowAddEvent(e) || isRowDeleteEvent(e)) {
    return eventWarrantsRecalculation(e);
  } else {
    // Only RowRemoveFromGroupEvent | RowAddToGroupEvent at this point.
    return fullRowPayloadRequiresRefresh(e.payload);
  }
};

// Not applicable for RowAddToGroupEvent, RowRemoveFromGroupEvent and GroupDeleteEvent
// because modifications to a group only cause recalculation of the group itself, not
// the parent Account/SubAccount and/or Budget/Template.
export const eventWarrantsRecalculation = <R extends Table.RowData, M extends Model.Model = Model.Model>(
  e: Table.DataChangeEvent<R, M> | Table.RowAddEvent<R, M> | Table.RowDeleteEvent<R, M>
): boolean => {
  if (isFullRowEvent(e)) {
    return fullRowPayloadRequiresRefresh(e.payload);
  } else if (isDataChangeEvent(e)) {
    return changeOrAddWarrantsRecalculation(e.payload);
  } else {
    return additionsWarrantParentRefresh(e.payload);
  }
};
