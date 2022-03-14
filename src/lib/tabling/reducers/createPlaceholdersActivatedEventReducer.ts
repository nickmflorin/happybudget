import { isNil, reduce, filter } from "lodash";

import * as redux from "../../redux";
import * as util from "../../util";
import * as rows from "../rows";

const createPlaceholdersActivatedEventReducer = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
  C extends Table.Context = Table.Context,
  A extends Redux.AuthenticatedTableActionMap<R, M, C> = Redux.AuthenticatedTableActionMap<R, M, C>
>(
  config: Table.ReducerConfig<R, M, S, C, A>
): Redux.Reducer<S, Table.PlaceholdersActivatedEvent<M>> => {
  const modelRowManager = new rows.ModelRowManager<R, M>({
    getRowChildren: config.getModelRowChildren,
    columns: config.columns
  });
  return (s: S = config.initialState, e: Table.PlaceholdersActivatedEvent<M>): S => {
    return reduce(
      e.payload.placeholderIds,
      (st: S, id: Table.PlaceholderRowId, index: number) => {
        const r: Table.PlaceholderRow<R> | null = redux.reducers.findModelInData<Table.PlaceholderRow<R>>(
          filter(st.data, (ri: Table.BodyRow<R>) => rows.isPlaceholderRow(ri)) as Table.PlaceholderRow<R>[],
          id
        );
        if (!isNil(r)) {
          return {
            ...st,
            data: util.replaceInArray<Table.BodyRow<R>>(
              st.data,
              { id: r.id },
              modelRowManager.create({ model: e.payload.models[index] })
            )
          };
        }
        return st;
      },
      s
    );
  };
};

export default createPlaceholdersActivatedEventReducer;
