import { util } from "lib";

import BodyRowManager from "./base";

abstract class EditableRowManager<
  RW extends Table.EditableRow<R>,
  R extends Table.RowData,
  M extends Model.RowHttpModel,
  ARGS extends unknown[]
> extends BodyRowManager<RW, R, M, ARGS> {
  mergeChangesWithRow = (row: RW, change: Table.RowChangeData<R, RW>): RW => {
    let field: keyof RW["data"];
    for (field in change) {
      const cellChange = util.getKeyValue<Table.RowChangeData<R, RW>, keyof RW["data"]>(field)(
        change
      ) as Table.CellChange<R[keyof R]>;
      row = { ...row, data: { ...row.data, [field as string]: cellChange.newValue } };
    }
    return row;
  };
}

export default EditableRowManager;
