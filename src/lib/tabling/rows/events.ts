import { reduce } from "lodash";

import { tabling, util } from "lib";

export const mergeChangesWithRow = <R extends Table.RowData, RW extends Table.EditableRow<R> = Table.EditableRow<R>>(
  row: RW,
  changes: Table.DataChangePayload<R, RW>
): RW => {
  const consolidated: Table.ConsolidatedChange<R, RW> = tabling.events.consolidateRowChanges<R, RW>(changes);
  const data: RW["data"] = reduce(
    consolidated,
    (curr: RW["data"], change: Table.RowChange<R, RW>) => {
      if (change.id !== row.id) {
        console.error("Cannot apply table changes from one row to another row!");
        return curr;
      } else {
        let field: keyof RW["data"];
        for (field in change.data) {
          const cellChange = util.getKeyValue<Table.RowChangeData<R, RW>, keyof RW["data"]>(field)(
            change.data
          ) as Table.CellChange<R[keyof R]>;
          curr = { ...curr, [field as string]: cellChange.newValue };
        }
        return curr;
      }
    },
    { ...row.data }
  );
  return { ...row, data };
};
