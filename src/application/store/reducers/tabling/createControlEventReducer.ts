import { isNil, reduce, filter } from "lodash";

import { redux, util, tabling } from "lib";

import createModelsAddedEventReducer from "./createModelsAddedEventReducer";
import createModelsUpdatedEventReducer from "./createModelsUpdatedEventReducer";
import createPlaceholdersActivatedEventReducer from "./createPlaceholdersActivatedEventReducer";
import { reorderRows } from "./util";

const updateRowsReducer = <
  R extends Table.RowData,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
>(
  s: S,
  e: Table.UpdateRowsEvent<R>,
): S =>
  reduce(
    Array.isArray(e.payload) ? e.payload : [e.payload],
    (st: S, update: Table.UpdateRowPayload<R>) => {
      const r: Table.ModelRow<R> | null = redux.findModelInData(
        filter(st.data, (ri: Table.BodyRow<R>) => tabling.rows.isModelRow(ri)),
        update.id,
      ) as Table.ModelRow<R> | null;
      if (!isNil(r)) {
        return reorderRows({
          ...st,
          data: util.replaceInArray<Table.BodyRow<R>>(
            st.data,
            { id: r.id },
            { ...r, data: { ...r.data, ...update.data } },
          ),
        });
      }
      return st;
    },
    s,
  );

type ControlEventReducers<
  R extends Table.RowData,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
> = {
  readonly [Property in keyof Table.ControlEvents<R, M>]: Redux.BasicReducerWithDefinedState<
    S,
    Table.ControlEvents<R, M>[Property]
  >;
};

const createControlEventReducer = <
  R extends Table.RowData,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
  C extends Redux.ActionContext = Redux.ActionContext,
>(
  config: Table.AuthenticatedReducerConfig<R, M, S, C>,
): Redux.BasicReducer<S, Table.ControlEvent<R, M>> => {
  const controlEventReducers: ControlEventReducers<R, M, S> = {
    modelsAdded: createModelsAddedEventReducer(config),
    modelsUpdated: createModelsUpdatedEventReducer(config),
    placeholdersActivated: createPlaceholdersActivatedEventReducer(config),
    updateRows: updateRowsReducer,
  };

  return (state: S = config.initialState, e: Table.ControlEvent<R, M>): S => {
    const reducer = controlEventReducers[e.type] as Redux.BasicReducerWithDefinedState<S, typeof e>;
    return reducer(state, e);
  };
};

export default createControlEventReducer;
