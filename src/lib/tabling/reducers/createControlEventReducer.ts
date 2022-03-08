import { isNil, reduce, filter } from "lodash";

import { tabling, redux, util } from "lib";

import createModelsAddedEventReducer from "./createModelsAddedEventReducer";
import createModelsUpdatedEventReducer from "./createModelsUpdatedEventReducer";

import { reorderRows } from "./util";

const createControlEventReducer = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
  C extends Table.Context = Table.Context,
  A extends Redux.AuthenticatedTableActionMap<R, M, C> = Redux.AuthenticatedTableActionMap<R, M, C>
>(
  config: Table.ReducerConfig<R, M, S, C, A>
): Redux.Reducer<S, Table.ControlEvent<R, M>> => {
  const modelRowManager = new tabling.managers.ModelRowManager<R, M>({
    getRowChildren: config.getModelRowChildren,
    columns: config.columns
  });

  const modelsAddedReducer = createModelsAddedEventReducer(config);
  const modelsUpdatedReducer = createModelsUpdatedEventReducer(config);

  return (state: S = config.initialState, e: Table.ControlEvent<R, M>): S => {
    if (tabling.typeguards.isPlaceholdersActivatedEvent<R, M>(e)) {
      const payload: Table.PlaceholdersActivatedPayload<M> = e.payload;
      return reduce(
        payload.placeholderIds,
        (s: S, id: Table.PlaceholderRowId, index: number) => {
          const r: Table.PlaceholderRow<R> | null = redux.reducers.findModelInData<Table.PlaceholderRow<R>>(
            filter(s.data, (ri: Table.BodyRow<R>) =>
              tabling.typeguards.isPlaceholderRow(ri)
            ) as Table.PlaceholderRow<R>[],
            id
          );
          if (!isNil(r)) {
            return {
              ...s,
              data: util.replaceInArray<Table.BodyRow<R>>(
                s.data,
                { id: r.id },
                modelRowManager.create({ model: payload.models[index] })
              )
            };
          }
          return s;
        },
        state
      );
    } else if (tabling.typeguards.isModelsAddedEvent<R, M>(e)) {
      return modelsAddedReducer(state, e);
    } else if (tabling.typeguards.isUpdateRowsEvent(e)) {
      const updates: Table.UpdateRowPayload<R>[] = Array.isArray(e.payload) ? e.payload : [e.payload];
      return reduce(
        updates,
        (s: S, update: Table.UpdateRowPayload<R>) => {
          const r: Table.ModelRow<R> | null = redux.reducers.findModelInData(
            filter(s.data, (ri: Table.BodyRow<R>) => tabling.typeguards.isModelRow(ri)),
            update.id
          ) as Table.ModelRow<R> | null;
          if (!isNil(r)) {
            return reorderRows({
              ...s,
              data: util.replaceInArray<Table.BodyRow<R>>(
                s.data,
                { id: r.id },
                { ...r, data: { ...r.data, ...update.data } }
              )
            });
          }
          return s;
        },
        state
      );
    } else if (tabling.typeguards.isModelsUpdatedEvent<R, M>(e)) {
      return modelsUpdatedReducer(state, e);
    }
    return state;
  };
};

export default createControlEventReducer;
