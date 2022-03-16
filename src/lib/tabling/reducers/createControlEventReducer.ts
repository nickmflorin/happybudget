import { isNil, reduce, filter } from "lodash";

import { redux, util, tabling } from "lib";

import createModelsAddedEventReducer from "./createModelsAddedEventReducer";
import createModelsUpdatedEventReducer from "./createModelsUpdatedEventReducer";
import createPlaceholdersActivatedEventReducer from "./createPlaceholdersActivatedEventReducer";

import { reorderRows } from "./util";

const updateRowsReducer = <R extends Table.RowData, S extends Redux.TableStore<R> = Redux.TableStore<R>>(
  s: S,
  e: Table.UpdateRowsEvent<R>
): S =>
  reduce(
    Array.isArray(e.payload) ? e.payload : [e.payload],
    (st: S, update: Table.UpdateRowPayload<R>) => {
      const r: Table.ModelRow<R> | null = redux.reducers.findModelInData(
        filter(st.data, (ri: Table.BodyRow<R>) => tabling.rows.isModelRow(ri)),
        update.id
      ) as Table.ModelRow<R> | null;
      if (!isNil(r)) {
        return reorderRows({
          ...st,
          data: util.replaceInArray<Table.BodyRow<R>>(
            st.data,
            { id: r.id },
            { ...r, data: { ...r.data, ...update.data } }
          )
        });
      }
      return st;
    },
    s
  );

type ControlEventReducers<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>
> = {
  readonly [Property in keyof Table.ControlEvents<R, M>]: Redux.ReducerWithDefinedState<
    S,
    Table.ControlEvents<R, M>[Property]
  >;
};

const createControlEventReducer = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
  C extends Table.Context = Table.Context,
  A extends Redux.AuthenticatedTableActionMap<R, M, C> = Redux.AuthenticatedTableActionMap<R, M, C>
>(
  config: Table.ReducerConfig<R, M, S, C, A>
): Redux.Reducer<S, Table.ControlEvent<R, M>> => {
  const controlEventReducers: ControlEventReducers<R, M, S> = {
    modelsAdded: createModelsAddedEventReducer(config),
    modelsUpdated: createModelsUpdatedEventReducer(config),
    placeholdersActivated: createPlaceholdersActivatedEventReducer(config),
    updateRows: updateRowsReducer
  };

  return (state: S = config.initialState, e: Table.ControlEvent<R, M>): S => {
    const reducer = controlEventReducers[e.type] as Redux.ReducerWithDefinedState<S, typeof e>;
    return reducer(state, e);
  };
};

export default createControlEventReducer;
