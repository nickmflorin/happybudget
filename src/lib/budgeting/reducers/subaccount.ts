import { combineReducers } from "redux";
import { redux } from "lib";

type M = Model.SubAccount;

export type SubAccountAccountDetailActionMap = Omit<Redux.ModelDetailResponseActionMap<M>, "updateInState"> & {
  readonly setId: number | null;
  readonly updateInState?: Redux.UpdateActionPayload<Model.SubAccount>;
};

type MinimalSubAccountStore = {
  readonly id: number | null;
  readonly detail: Redux.ModelDetailResponseStore<Model.SubAccount>;
  readonly table: Tables.SubAccountTableStore;
};

export type SubAccountAccountDetailReducerConfig<S extends MinimalSubAccountStore> = Redux.ReducerConfig<
  S,
  SubAccountAccountDetailActionMap
> & {
  readonly reducers?: Redux.ReducersMapObject<Omit<S, "detail" | "id">>;
};

export const createSubAccountDetailReducer = <S extends MinimalSubAccountStore>(
  config: SubAccountAccountDetailReducerConfig<S>
): Redux.Reducer<S> => {
  return combineReducers({
    ...config.reducers,
    detail: redux.reducers.createDetailResponseReducer<Model.SubAccount, SubAccountAccountDetailActionMap>({
      initialState: redux.initialState.initialDetailResponseState,
      actions: config.actions
    }),
    id: redux.reducers.createSimplePayloadReducer<number | null>({
      initialState: null,
      actions: { set: config.actions.setId }
    })
  }) as Redux.Reducer<S>;
};
