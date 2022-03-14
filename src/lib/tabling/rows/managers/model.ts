import { isNil } from "lodash";

import { tabling, util } from "lib";

import BodyRowManager from "./body";

type GetRowValue<R extends Table.RowData, M extends Model.RowHttpModel, V extends Table.RawRowValue> = (
  m: M,
  col: Table.DataColumn<R, M>,
  original: (ci: Table.DataColumn<R, M>, mi: M) => V | undefined
) => V | undefined;

type CreateModelRowConfig<R extends Table.RowData, M extends Model.RowHttpModel> = {
  readonly model: M;
  // Used solely for PDF purposes.
  readonly getRowValue?: GetRowValue<R, M, Table.RawRowValue> | undefined;
};

type ModelRowManagerConfig<R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel> = {
  readonly columns: Table.Column<R, M>[];
  readonly getRowChildren?: (m: M) => number[];
};

class ModelRowManager<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel
> extends BodyRowManager<Table.ModelRow<R>, R, M> {
  public getRowChildren: ((m: M) => number[]) | undefined;

  constructor(config: ModelRowManagerConfig<R, M>) {
    super({ ...config, rowType: "model" });
    this.getRowChildren = config.getRowChildren;
  }

  getValueForRow<
    V extends Table.RawRowValue,
    C extends Table.ModelColumn<R, M, V>
    // The optional `getRowValue` callback is only used for PDF cases.
  >(col: C, m: M, getRowValue?: GetRowValue<R, M, V>): [V | undefined, boolean] {
    if (col.isApplicableForModel?.(m) === false) {
      return [undefined, false];
    }
    if (!isNil(getRowValue) && tabling.columns.isDataColumn<R, M>(col)) {
      return [
        getRowValue(m, col, (colr: Table.DataColumn<R, M>, mr: M) => this.getValueForRow<V, C>(colr as C, mr)[0]),
        true
      ];
    } else if (!isNil(col.getRowValue)) {
      return [col.getRowValue(m), true];
    } else {
      return [util.getKeyValue<M, keyof M>(col.field as keyof M)(m) as unknown as V | undefined, true];
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
          id: config.model.id
        },
        config.model,
        config.getRowValue
      )
    };
  }
}

export default ModelRowManager;
