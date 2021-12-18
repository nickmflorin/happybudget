import { isNil, filter, map, find } from "lodash";
import { redux, notifications } from "lib";

export const isClearOnAction = <T extends Redux.ActionPayload, C extends Table.Context = Table.Context>(
  clearOn: Redux.ClearOn<T, C>[],
  action: Redux.Action<T>
): boolean => {
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

export const findModelInData = <M extends Model.Model>(
  action: Redux.Action,
  data: M[],
  id: Redux.ModelLookup<M>,
  options: Redux.FindModelOptions = { name: "Model", warnIfMissing: true }
): M | null => {
  const predicate = typeof id === "number" || typeof id === "string" ? (m: M) => m.id === id : id;
  const m = find(data, predicate);
  if (!isNil(m)) {
    return m;
  } else {
    if (options.warnIfMissing !== false) {
      const warningData = {
        action: action,
        reason: `${options.name || "Model"} does not exist in state when it is expected to.`,
        ids: JSON.stringify(map(data, (mi: M) => mi.id)),
        model: options.name
      };
      if (typeof id === "function") {
        notifications.inconsistentStateError({
          ...warningData,
          id: "provided as callback",
          evaluatedCallback: JSON.stringify(map(data, (mi: M) => id(mi))),
          model: options.name
        });
      } else {
        notifications.inconsistentStateError({ ...warningData, id });
      }
    }
    return null;
  }
};

export const findModelsInData = <M extends Model.Model>(
  action: Redux.Action,
  data: M[],
  ids: Redux.ModelLookup<M>[],
  options: Redux.FindModelOptions = { name: "Model", warnIfMissing: true }
): M[] =>
  filter(
    map(ids, (predicate: Redux.ModelLookup<M>) => findModelInData(action, data, predicate, options)),
    (m: M | null) => m !== null
  ) as M[];

export const modelFromState = <M extends Model.Model>(
  action: Redux.Action,
  data: M[],
  id: Redux.ModelLookup<M> | M,
  options: Redux.FindModelOptions = { name: "Model", warnIfMissing: true }
): M | null => {
  if (typeof id === "number" || typeof id === "string" || typeof id === "function") {
    return findModelInData<M>(action, data, id, options);
  }
  return id;
};

export const identityReducer =
  <S>(initialState: S): Redux.Reducer<S> =>
  (st: S = initialState) =>
    st;
