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
  <M extends Model.Model>(data: M[], warningData?: Record<string, unknown>) =>
  (params: Model.OnModelMissingCallbackParams<M>) => {
    const mutatedWarningData = {
      reason: `${params.ref} does not exist in state when it is expected to.`,
      ids: notifications.objToJson(map(data, (mi: M) => mi.id)),
      ...warningData
    };
    const lookup = params.lookup;
    if (typeof lookup === "function") {
      notifications.inconsistentStateError({
        ...mutatedWarningData,
        evaluatedCallback: notifications.objToJson(map(data, (mi: M) => lookup(mi)))
      });
    } else {
      notifications.inconsistentStateError({ ...mutatedWarningData, id: params.lookup });
    }
  };

export const findModelInData = <M extends Model.Model>(
  data: M[],
  id: Model.ModelLookup<M>,
  options?: Model.GetReduxModelOptions<M>
): M | null =>
  models.getModel(data, id, {
    ...options,
    onMissing: onMissing(data, { action: options?.action, ...options?.warningData })
  });

export const findModelsInData = <M extends Model.Model>(
  data: M[],
  id: Model.ModelLookup<M>[],
  options?: Model.GetReduxModelOptions<M>
): M[] =>
  models.getModels<M>(data, id, {
    ...options,
    onMissing: onMissing(data, { action: options?.action, ...options?.warningData })
  });

const isModel = <M extends Model.Model>(m: Model.ModelLookup<M> | M): m is M =>
  !(typeof m === "number" || typeof m === "string" || typeof m === "function");

export const modelFromState = <M extends Model.Model>(
  data: M[],
  id: Model.ModelLookup<M> | M,
  options?: Model.GetReduxModelOptions<M>
): M | null => (isModel(id) ? id : findModelInData<M>(data, id as Model.ModelLookup<M>, options));

export const identityReducer =
  <S>(initialState: S): Redux.Reducer<S> =>
  (st: S = initialState) =>
    st;
