import { isNil, filter, map } from "lodash";
import { util, redux } from "lib";

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
      redux.util.warnInconsistentState({
        action: action.type,
        reason: `${options.name || "Model"} does not exist in state when it is expected to.`,
        id: id
      });
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
