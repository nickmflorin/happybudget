import { isNil, filter, map } from "lodash";
import { util, redux } from "lib";

export const isClearOnAction = <T>(clearOn: Redux.ClearOn<T>[], action: Redux.Action<T>): boolean => {
  for (let i = 0; i < clearOn.length; i++) {
    const clearer = clearOn[i];
    if (redux.typeguards.isClearOnDetail(clearer)) {
      if (clearer.action.toString() === action.type && clearer.payload(action.payload) === true) {
        return true;
      }
    } else if (clearer.toString() === action.type) {
      return true;
    }
  }
  return false;
};

export const findModelInData = <M extends Model.Model, A extends Array<any> = M[]>(
  action: Redux.Action,
  data: A,
  id: Redux.ModelLookup<M>,
  options: Redux.FindModelOptions = { name: "Model", warnIfMissing: true }
): M | null => {
  const predicate = typeof id === "number" || typeof id === "string" ? (m: M) => m.id === id : id;
  const m = util.findWithDistributedTypes<M, A>(data, predicate);
  if (!isNil(m)) {
    return m;
  } else {
    if (options.warnIfMissing !== false) {
      let warningData: any = {
        action: action,
        reason: `${options.name || "Model"} does not exist in state when it is expected to.`,
        ids: JSON.stringify(map(data, (mi: M) => mi.id)),
        model: options.name
      };
      if (typeof id === "function") {
        redux.util.warnInconsistentState({
          ...warningData,
          id: "provided as callback",
          evaluatedCallback: JSON.stringify(map(data, (mi: M) => id(mi))),
          model: options.name
        });
      } else {
        redux.util.warnInconsistentState({ ...warningData, id });
      }
    }
    return null;
  }
};

export const findModelsInData = <M extends Model.Model, A extends Array<any> = M[]>(
  action: Redux.Action,
  data: A,
  ids: Redux.ModelLookup<M>[],
  options: Redux.FindModelOptions = { name: "Model", warnIfMissing: true }
): M[] =>
  filter(
    map(ids, (predicate: Redux.ModelLookup<M>) => findModelInData(action, data, predicate, options)),
    (m: M | null) => m !== null
  ) as M[];

export const modelFromState = <M extends Model.Model, A extends Array<any> = M[]>(
  /* eslint-disable indent */
  action: Redux.Action,
  data: A,
  id: Redux.ModelLookup<M> | M,
  options: Redux.FindModelOptions = { name: "Model", warnIfMissing: true }
): M | null => {
  if (typeof id === "number" || typeof id === "string" || typeof id === "function") {
    return findModelInData<M, A>(action, data, id, options);
  }
  return id;
};

/**
 * Function to sequentially apply a series of simple reducers of form
 * (state, action) => newState into a larger reducer.
 *
 * This is useful in allowing users to cleanly write reducers for specific
 * action types without needing a giant switch statement.
 */
export const composeReducers = (initialState: any, ...args: any) => {
  const withIdentity: Redux.Reducer<any>[] = [(x: any) => x].concat(args);
  const composed = (prevState: any = initialState, action: Redux.Action) =>
    withIdentity.reduce(
      (state: any, reducer: Redux.Reducer<any>) => Object.assign(initialState, state, reducer(prevState, action)),
      {}
    );
  return composed;
};

export const identityReducer =
  <S>(initialState: S): Redux.Reducer<S> =>
  /* eslint-disable indent */
  (st: S = initialState, action: Redux.Action) =>
    st;
