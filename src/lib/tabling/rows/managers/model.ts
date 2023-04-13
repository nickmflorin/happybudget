import * as model from "../../../model";
import * as columns from "../../columns";
import { CellValue } from "../../types";
import * as types from "../types";

import { BodyRowManagerConfig } from "./base";
import { EditableRowManager } from "./editable";

type GetRowValue<
  R extends types.Row,
  M extends model.RowTypedApiModel,
  N extends columns.ColumnFieldName<R> = columns.ColumnFieldName<R>,
  T extends CellValue<R, N> = CellValue<R, N>,
> = (
  m: M,
  col: columns.DataColumn<R, M, N, T>,
  original: (ci: columns.DataColumn<R, M, N, T>, mi: M) => T | undefined,
) => T | undefined;

type CreateModelRowConfig<
  R extends types.Row,
  M extends model.RowTypedApiModel,
  N extends columns.ColumnFieldName<R> = columns.ColumnFieldName<R>,
  T extends CellValue<R, N> = CellValue<R, N>,
> = {
  readonly model: M;
  // Used solely for PDF purposes.
  readonly getRowValue?: GetRowValue<R, M, N, T>;
};

type ModelRowManagerConfig<
  R extends types.Row,
  M extends model.RowTypedApiModel,
  N extends columns.ColumnFieldName<R> = columns.ColumnFieldName<R>,
  T extends CellValue<R, N> = CellValue<R, N>,
> = Omit<BodyRowManagerConfig<"model", R, M, types.ModelRowId, N, T>, "rowType"> & {
  readonly getRowChildren?: (m: M) => number[];
};

export class ModelRowManager<
  R extends types.Row,
  M extends model.RowTypedApiModel,
  N extends columns.ColumnFieldName<R> = columns.ColumnFieldName<R>,
  T extends CellValue<R, N> = CellValue<R, N>,
> extends EditableRowManager<
  "model",
  R,
  M,
  [M, GetRowValue<R, M, N, T> | undefined],
  types.ModelRowId,
  N,
  T
> {
  public getRowChildren: ((m: M) => number[]) | undefined;

  constructor(config: ModelRowManagerConfig<R, M, N, T>) {
    super({ ...config, rowType: types.RowTypes.MODEL });
    this.getRowChildren = config.getRowChildren;
  }

  getValueForRow(
    col: columns.ModelColumn<R, M, N, T>,
    m: M,
    getRowValue?: GetRowValue<R, M, N, T>,
  ): T | undefined {
    if (col.isApplicableForModel?.(m) === false) {
      this.throwNotApplicable();
    }
    if (getRowValue !== undefined && columns.isDataColumn<R, M, N, T>(col)) {
      return getRowValue(m, col, (colr: columns.DataColumn<R, M, N, T>, mr: M) =>
        this.getValueForRow(colr, mr),
      );
    } else if (col.getRowValue !== undefined) {
      return col.getRowValue(m);
    } else {
      return m[col.field as keyof M] as T | undefined;
    }
  }

  create(config: CreateModelRowConfig<R, M, N, T>): types.ModelRow<types.GetRowData<R, N, T>> {
    return {
      order: config.model.order,
      modelType: config.model.type,
      children: this.getRowChildren?.(config.model) || [],
      ...this.createBasic(
        {
          ...config,
          id: config.model.id,
        },
        config.model,
        config.getRowValue,
      ),
    };
  }
}
