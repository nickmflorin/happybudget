import { isNil } from "lodash";

import { tabling, util } from "lib";

import { BodyRowManagerConfig } from "./base";
import EditableRowManager from "./editable";

type GetRowValue<
  R extends Table.RowData,
  M extends Model.RowHttpModel,
  V extends Table.RawRowValue,
> = (
  m: M,
  col: Table.DataColumn<R, M>,
  original: (ci: Table.DataColumn<R, M>, mi: M) => V | undefined,
) => V | undefined;

type CreateModelRowConfig<R extends Table.RowData, M extends Model.RowHttpModel> = {
  readonly model: M;
  // Used solely for PDF purposes.
  readonly getRowValue?: GetRowValue<R, M, Table.RawRowValue> | undefined;
};

type ModelRowManagerConfig<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
> = Omit<BodyRowManagerConfig<Table.ModelRow<R>, R, M>, "rowType"> & {
  readonly getRowChildren?: (m: M) => number[];
};

class ModelRowManager<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
> extends EditableRowManager<Table.ModelRow<R>, R, M, [M, GetRowValue<R, M, any> | undefined]> {
  public getRowChildren: ((m: M) => number[]) | undefined;

  constructor(config: ModelRowManagerConfig<R, M>) {
    super({ ...config, rowType: "model" });
    this.getRowChildren = config.getRowChildren;
  }

  getValueForRow<
    V extends Table.RawRowValue,
    C extends Table.ModelColumn<R, M, V>,
    // The optional `getRowValue` callback is only used for PDF cases.
  >(col: C, m: M, getRowValue?: GetRowValue<R, M, V>): V | undefined {
    if (col.isApplicableForModel?.(m) === false) {
      this.throwNotApplicable();
    }
    if (!isNil(getRowValue) && tabling.columns.isDataColumn<R, M>(col)) {
      return getRowValue(m, col, (colr: Table.DataColumn<R, M>, mr: M) =>
        this.getValueForRow<V, C>(colr as C, mr),
      );
    } else if (!isNil(col.getRowValue)) {
      return col.getRowValue(m);
    } else {
      return util.getKeyValue<M, keyof M>(col.field as keyof M)(m) as unknown as V | undefined;
    }
  }

  create(config: CreateModelRowConfig<R, M>): Table.ModelRow<R> {
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

export default ModelRowManager;
