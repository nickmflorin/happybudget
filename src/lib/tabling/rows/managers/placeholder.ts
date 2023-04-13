import * as model from "../../../model";
import * as columns from "../../columns";
import { CellValue } from "../../types";
import * as defaults from "../defaults";
import * as types from "../types";

import { BodyRowManager, BodyRowManagerConfig } from "./base";

type CreatePlaceholderRowConfig<
  R extends types.Row,
  N extends columns.ColumnFieldName<R> = columns.ColumnFieldName<R>,
  T extends CellValue<R, N> = CellValue<R, N>,
> = {
  readonly id: types.PlaceholderRowId;
  readonly data?: Partial<types.GetRowData<R, N, T>>;
};

type PlaceholderRowManagerConfig<
  R extends types.Row,
  M extends model.RowTypedApiModel,
  N extends columns.ColumnFieldName<R> = columns.ColumnFieldName<R>,
  T extends CellValue<R, N> = CellValue<R, N>,
> = Omit<BodyRowManagerConfig<"placeholder", R, M, types.PlaceholderRowId, N, T>, "rowType"> & {
  readonly defaultData?: defaults.DefaultDataOnCreate<R, N, T>;
};

export class PlaceholderRowManager<
  R extends types.Row,
  M extends model.RowTypedApiModel,
  N extends columns.ColumnFieldName<R> = columns.ColumnFieldName<R>,
  T extends CellValue<R, N> = CellValue<R, N>,
> extends BodyRowManager<
  "placeholder",
  R,
  M,
  [Partial<types.GetRowData<R, N, T>> | undefined],
  types.PlaceholderRowId,
  N,
  T
> {
  public defaultData?: defaults.DefaultDataOnCreate<R, N, T>;

  constructor(config: PlaceholderRowManagerConfig<R, M, N, T>) {
    super({ ...config, rowType: types.RowTypes.PLACEHOLDER });
    this.defaultData = config.defaultData;
  }

  getValueForRow(
    col: columns.ModelColumn<R, M, N, T>,
    data?: Partial<types.GetRowData<R, N, T>>,
  ): T | undefined {
    if (col.isApplicableForRowType?.(this.rowType) === false) {
      this.throwNotApplicable();
    }
    const defaultData =
      this.defaultData === undefined
        ? undefined
        : defaults.applyDefaultsOnCreate<R, M, N, T>(
            columns.filterModelColumns(this.columns),
            data,
            this.defaultData,
          );

    const defaultValue: T | undefined =
      defaultData === undefined ? undefined : defaultData[col.field];

    if (data === undefined || data[col.field] === undefined) {
      return defaultValue === undefined ? col.nullValue : defaultValue;
    }
    return data[col.field];
  }

  create(
    config: CreatePlaceholderRowConfig<R, N, T>,
  ): types.PlaceholderRow<types.GetRowData<R, N, T>> {
    return {
      children: [],
      ...this.createBasic({ id: config.id }, config.data),
    };
  }
}
