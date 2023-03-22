import { tabling, model } from "lib";

type R = Tables.FringeRowData;
type M = Model.Fringe;
type S = Tables.FringeTableStore;

export const createPublicFringesTableReducer = <
  B extends Model.Budget | Model.Template,
  P extends Model.Account | Model.SubAccount = Model.Account | Model.SubAccount,
>(
  config: Table.ReducerConfig<R, M, S, FringesTableActionContext<B, P, true>>,
): Redux.Reducer<S, FringesTableActionContext<B, P, true>> =>
  tabling.reducers.createPublicTableReducer<R, M, S, FringesTableActionContext<B, P, true>>(config);

export const createAuthenticatedFringesTableReducer = <
  B extends Model.Budget | Model.Template,
  P extends Model.Account | Model.SubAccount = Model.Account | Model.SubAccount,
>(
  config: Omit<
    Table.AuthenticatedReducerConfig<R, M, S, FringesTableActionContext<B, P, false>>,
    "defaultDataOnCreate"
  >,
): Redux.Reducer<S, FringesTableActionContext<B, P, false>> =>
  tabling.reducers.createAuthenticatedTableReducer<R, M, S, FringesTableActionContext<B, P, false>>(
    {
      ...config,
      defaultDataOnCreate: {
        unit: model.budgeting.FringeUnits.percent,
        rate: 0.0,
      },
    },
  );
