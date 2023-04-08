import { model } from "lib";

import * as types from "../../types";
import * as tabling from "../tabling";

type M = model.Actual;
type R = model.ActualRow;
type C = ActualsTableActionContext;
type S = types.ActualTableStore;

export const createAuthenticatedActualsTableReducer = (
  config: types.AuthenticatedTableReducerConfig<R, M, S, C> & {
    readonly owners: types.Reducer<types.AuthenticatedApiModelListStore<model.ActualOwner>, C>;
  },
): types.Reducer<S, C> => {
  const generic = tabling.createAuthenticatedTableReducer<R, M, S, C>(config);
  return (state: S | undefined = config.initialState, action: types.Action): S => {
    const newState = generic(state, action);
    return { ...newState, owners: config.owners(newState.owners, action) };
  };
};
