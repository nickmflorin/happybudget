import { combineReducers } from "redux";
import * as redux from "../../redux";

type M = Model.SubAccount;

export type SubAccountAccountDetailActionMap = Omit<Redux.ModelDetailResponseActionMap<M>, "updateInState"> & {
  readonly updateInState?: Redux.ActionCreator<Redux.UpdateActionPayload<Model.SubAccount>>;
};

type MinimalSubAccountStore = {
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
    detail: redux.reducers.createDetailResponseReducer<Model.SubAccount>({
      initialState: redux.initialState.initialDetailResponseState,
      actions: config.actions
    })
  }) as Redux.Reducer<S>;
};
