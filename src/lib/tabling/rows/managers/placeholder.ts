import { tabling } from "lib";

import BodyRowManager, { BodyRowManagerConfig, FieldNotApplicableForRow } from "./base";

type CreatePlaceholderRowConfig<R extends Table.RowData> = {
  readonly id: Table.PlaceholderRowId;
  readonly data?: Partial<R>;
};

type PlaceholderRowConfig<
  RW extends Table.PlaceholderRow<R>,
  R extends Table.RowData,
  M extends model.RowTypedApiModel,
> = Omit<BodyRowManagerConfig<RW, R, M>, "rowType"> & {
  readonly defaultData?: Table.DefaultDataOnCreate<R>;
};

class PlaceholderRowManager<
  R extends Table.RowData,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
> extends BodyRowManager<Table.PlaceholderRow<R>, R, M, [Partial<R> | undefined]> {
  public getRowChildren: ((m: M) => number[]) | undefined;
  public defaultData?: Table.DefaultDataOnCreate<R>;

  constructor(config: PlaceholderRowConfig<Table.PlaceholderRow<R>, R, M>) {
    super({ ...config, rowType: "placeholder" });
    this.defaultData = config.defaultData;
  }

  getValueForRow<V extends Table.RawRowValue, C extends Table.ModelColumn<R, M, V>>(
    col: C,
    data?: Partial<R>,
  ): V | undefined {
    if (col.isApplicableForRowType?.(this.rowType) === false) {
      throw new FieldNotApplicableForRow();
    }
    const defaultData =
      this.defaultData === undefined
        ? undefined
        : tabling.rows.applyDefaultsOnCreate(
            tabling.columns.filterModelColumns(this.columns),
            data,
            this.defaultData,
          );
    const defaultValue =
      defaultData === undefined ? undefined : (defaultData[col.field] as V | undefined);

    if (data === undefined || data[col.field] === undefined) {
      return defaultValue === undefined ? col.nullValue : defaultValue;
    }
    return data[col.field] as unknown as V;
  }

  create(config: CreatePlaceholderRowConfig<R>): Table.PlaceholderRow<R> {
    return {
      children: [],
      ...this.createBasic({ id: config.id }, config.data),
    };
  }
}

export default PlaceholderRowManager;
