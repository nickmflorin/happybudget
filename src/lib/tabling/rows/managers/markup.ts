import * as model from "../../../model";
import { SingleOrArray } from "../../../util";
import * as columns from "../../columns";
import { CellValue } from "../../types";
import * as ids from "../ids";
import * as types from "../types";

import { BodyRowManagerConfig } from "./base";
import { EditableRowManager } from "./editable";

type CreateMarkupRowConfig = {
  readonly model: model.Markup;
};

type MarkupRowManagerConfig<
  R extends types.Row,
  M extends model.RowTypedApiModel,
  N extends columns.ColumnFieldName<R> = columns.ColumnFieldName<R>,
  T extends CellValue<R, N> = CellValue<R, N>,
> = Omit<BodyRowManagerConfig<"model", R, M, types.ModelRowId, N, T>, "rowType">;

export class MarkupRowManager<
  R extends types.Row,
  M extends model.RowTypedApiModel,
  N extends columns.ColumnFieldName<R> = columns.ColumnFieldName<R>,
  T extends CellValue<R, N> = CellValue<R, N>,
> extends EditableRowManager<"markup", R, M, [model.Markup], types.MarkupRowId, N, T> {
  constructor(config: MarkupRowManagerConfig<R, M, N, T>) {
    super({ ...config, rowType: types.RowTypes.MARKUP });
  }

  getValueForRow(col: columns.ModelColumn<R, M, N, T>, m: model.Markup): T | undefined {
    if (columns.isDataColumn<R, M, N, T>(col) && col.markupField !== undefined) {
      return m[col.markupField] as T | undefined;
    }
    /* We need to indicate that the value is not applicable for the column for this MarkupRow,
       otherwise a warning will be issued and the value will be set to the column's `nullValue`. */
    this.throwNotApplicable();
  }

  removeChildren(
    row: types.MarkupRow<types.GetRowData<R, N, T>>,
    ids: SingleOrArray<number>,
  ): types.MarkupRow<types.GetRowData<R, N, T>> {
    const IDs: number[] = Array.isArray(ids) ? ids : [ids];
    return {
      ...row,
      children: row.children.filter((child: number) => !IDs.includes(child)),
    };
  }

  create(config: CreateMarkupRowConfig): types.MarkupRow<types.GetRowData<R, N, T>> {
    return {
      ...this.createBasic(
        {
          ...config,
          id: ids.markupRowId(config.model.id),
        },
        config.model,
      ),
      children: model.isPercentMarkup(config.model) ? config.model.children : [],
      data: config.model,
    };
  }
}
