import * as model from "../../../model";
import { SingleOrArray } from "../../../util";
import * as columns from "../../columns";
import { CellValue } from "../../types";
import * as ids from "../ids";
import * as types from "../types";

import { BodyRowManagerConfig } from "./base";
import { EditableRowManager } from "./editable";

type CreateGroupRowConfig = {
  readonly model: model.Group;
};

type GroupRowManagerConfig<
  R extends types.Row,
  M extends model.RowTypedApiModel,
  N extends columns.ColumnFieldName<R> = columns.ColumnFieldName<R>,
  T extends CellValue<R, N> = CellValue<R, N>,
> = Omit<BodyRowManagerConfig<"model", R, M, types.ModelRowId, N, T>, "rowType">;

export class GroupRowManager<
  R extends types.Row,
  M extends model.RowTypedApiModel,
  N extends columns.ColumnFieldName<R> = columns.ColumnFieldName<R>,
  T extends CellValue<R, N> = CellValue<R, N>,
> extends EditableRowManager<"group", R, M, [model.Group], types.GroupRowId, N, T> {
  constructor(config: GroupRowManagerConfig<R, M, N, T>) {
    super({ ...config, rowType: types.RowTypes.GROUP });
  }

  getValueForRow(col: columns.ModelColumn<R, M, N, T>, m: model.Group): T | undefined {
    if (columns.isDataColumn<R, M, N, T>(col) && col.groupField !== undefined) {
      return m[col.groupField] as T | undefined;
    }
    /* We need to indicate that the value is not applicable for the column for this GroupRow,
       otherwise a warning will be issued and the value will be set to the column's `nullValue`. */
    this.throwNotApplicable();
  }

  removeChildren(
    row: types.RowSubType<R, "group", N, T>,
    ids: SingleOrArray<number>,
  ): types.RowSubType<R, "group", N, T> {
    const IDs: number[] = Array.isArray(ids) ? ids : [ids];
    return {
      ...row,
      children: row.children.filter((child: number) => !IDs.includes(child)),
    };
  }

  create(config: CreateGroupRowConfig): types.GroupRow<types.GetRowData<R, N, T>> {
    return {
      ...this.createBasic(
        {
          ...config,
          id: ids.groupRowId(config.model.id),
        },
        config.model,
      ),
      children: config.model.children,
      data: config.model,
    };
  }
}
