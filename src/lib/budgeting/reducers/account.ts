import { combineReducers } from "redux";
import { redux } from "lib";

type M = Model.Account;

export type AccountDetailActionMap = Omit<Redux.ModelDetailResponseActionMap<M>, "updateInState"> & {
  readonly updateInState?: Redux.ActionCreator<Redux.UpdateActionPayload<Model.Account>>;
};

type MinimalAccountStore = {
  readonly detail: Redux.ModelDetailResponseStore<Model.Account>;
  readonly table: Tables.SubAccountTableStore;
};

export type AccountDetailReducerConfig<S extends MinimalAccountStore> = Redux.ReducerConfig<
  S,
  AccountDetailActionMap
> & {
  readonly reducers?: Redux.ReducersMapObject<Omit<S, "detail" | "id">>;
};

export const createAccountDetailReducer = <S extends MinimalAccountStore>(
  config: AccountDetailReducerConfig<S>
): Redux.Reducer<S> => {
  return combineReducers({
    ...config.reducers,
    detail: redux.reducers.createDetailResponseReducer<Model.Account>({
      initialState: redux.initialState.initialDetailResponseState,
      actions: config.actions
    })
  }) as Redux.Reducer<S>;
};
