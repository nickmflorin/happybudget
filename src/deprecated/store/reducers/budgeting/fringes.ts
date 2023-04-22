import { model } from "lib";

import * as tabling from "../tabling";
import * as types from "../../../../application/store/types";

type R = model.FringeRow;
type M = model.Fringe;
type S = types.FringeTableStore;

export const createPublicFringesTableReducer = <
  B extends model.Budget | model.Template,
  P extends model.Account | model.SubAccount = model.Account | model.SubAccount,
>(
  config: types.TableReducerConfig<R, M, S, FringesTableActionContext<B, P, true>>,
): types.Reducer<S, FringesTableActionContext<B, P, true>> =>
  tabling.createPublicTableReducer<R, M, S, FringesTableActionContext<B, P, true>>(config);

export const createAuthenticatedFringesTableReducer = <
  B extends model.Budget | model.Template,
  P extends model.Account | model.SubAccount = model.Account | model.SubAccount,
>(
  config: Omit<
    types.AuthenticatedTableReducerConfig<R, M, S, FringesTableActionContext<B, P, false>>,
    "defaultDataOnCreate"
  >,
): types.Reducer<S, FringesTableActionContext<B, P, false>> =>
  tabling.createAuthenticatedTableReducer<R, M, S, FringesTableActionContext<B, P, false>>({
    ...config,
    defaultDataOnCreate: {
      unit: model.FringeUnits.percent,
      rate: 0.0,
    },
  });
