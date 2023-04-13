import * as model from "../../../model";
import * as columns from "../../columns";
import * as events from "../../events";
import { CellValue } from "../../types";
import * as types from "../types";

import { BodyRowManager } from "./base";

export abstract class EditableRowManager<
  TP extends types.BodyRowType,
  R extends types.Row,
  M extends model.RowTypedApiModel,
  ARGS extends unknown[],
  I extends types.RowId<TP> = types.RowId<TP>,
  N extends columns.ColumnFieldName<R> = columns.ColumnFieldName<R>,
  T extends CellValue<R, N> = CellValue<R, N>,
> extends BodyRowManager<TP, R, M, ARGS, I, N, T> {
  mergeChangesWithRow = <Ri extends types.RowSubType<R, types.EditableRowType, N, T>>(
    row: Ri,
    change: events.RowChangeData<R, N>,
  ): Ri => {
    let field: N;
    for (field in change) {
      const cellChange = change[field];
      if (cellChange !== undefined) {
        row = {
          ...row,
          data: { ...row.data, [field]: cellChange.newValue } as types.GetRowData<R>,
        };
      }
    }
    return row;
  };
}
