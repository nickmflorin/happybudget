import { map } from "lodash";
import { redux, notifications, models } from "lib";

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

const onMissing =
  <M extends Model.Model>(action: Redux.Action, data: M[]) =>
  (params: Model.OnModelMissingCallbackParams<M>) => {
    const warningData = {
      action: action,
      reason: `${params.ref} does not exist in state when it is expected to.`,
      ids: JSON.stringify(map(data, (mi: M) => mi.id))
    };
    const lookup = params.lookup;
    if (typeof lookup === "function") {
      notifications.inconsistentStateError({
        ...warningData,
        evaluatedCallback: JSON.stringify(map(data, (mi: M) => lookup(mi)))
      });
    } else {
      notifications.inconsistentStateError({ ...warningData, id: params.lookup });
    }
  };

export const findModelInData = <M extends Model.Model>(
  action: Redux.Action,
  data: M[],
  id: Model.ModelLookup<M>,
  options?: Omit<Model.GetModelOptions<M>, "onMissing">
): M | null =>
  models.getModel(data, id, {
    ...options,
    onMissing: onMissing(action, data)
  });

export const findModelsInData = <M extends Model.Model>(
  action: Redux.Action,
  data: M[],
  id: Model.ModelLookup<M>[],
  options?: Omit<Model.GetModelOptions<M>, "onMissing">
): M[] =>
  models.getModels<M>(data, id, {
    ...options,
    onMissing: onMissing(action, data)
  });

const isModel = <M extends Model.Model>(m: Model.ModelLookup<M> | M): m is M =>
  !(typeof m === "number" || typeof m === "string" || typeof m === "function");

export const modelFromState = <M extends Model.Model>(
  action: Redux.Action,
  data: M[],
  id: Model.ModelLookup<M> | M,
  options?: Omit<Model.GetModelOptions<M>, "onMissing">
): M | null => (isModel(id) ? id : findModelInData<M>(action, data, id as Model.ModelLookup<M>, options));

export const identityReducer =
  <S>(initialState: S): Redux.Reducer<S> =>
  (st: S = initialState) =>
    st;
