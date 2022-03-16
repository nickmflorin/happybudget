import { tabling, budgeting } from "lib";

type R = Tables.FringeRowData;
type M = Model.Fringe;
type S = Tables.FringeTableStore;
type CTX = Tables.FringeTableContext;
type ACTION = Redux.TableAction<Redux.ActionPayload, CTX>;

export type FringeTableActionMap = Redux.TableActionMap<M, CTX> & {
  readonly responseFringeColors: Redux.ActionCreator<Http.ListResponse<string>>;
};

export const createPublicFringesTableReducer = (
  config: Table.ReducerConfig<R, M, S, CTX, FringeTableActionMap>
): Redux.Reducer<S, ACTION> => {
  const generic = tabling.reducers.createPublicTableReducer<
    Tables.FringeRowData,
    Model.Fringe,
    Tables.FringeTableStore,
    Tables.FringeTableContext
  >(config);

  return (state: S | undefined = config.initialState, action: ACTION): S => {
    let newState = generic(state, action);
    if (action.type === config.actions.responseFringeColors.toString()) {
      const payload: Http.ListResponse<string> = action.payload;
      newState = { ...newState, fringeColors: payload.data };
    }
    return newState;
  };
};

export type AuthenticatedFringeTableActionMap = Redux.AuthenticatedTableActionMap<R, M, CTX> & {
  readonly responseFringeColors: Redux.ActionCreator<Http.ListResponse<string>>;
};

export const createAuthenticatedFringesTableReducer = (
  config: Omit<Table.ReducerConfig<R, M, S, CTX, AuthenticatedFringeTableActionMap>, "defaultDataOnCreate">
): Redux.Reducer<S, ACTION> => {
  const generic = tabling.reducers.createAuthenticatedTableReducer<
    R,
    M,
    S,
    CTX,
    AuthenticatedFringeTableActionMap,
    ACTION
  >({
    ...config,
    defaultDataOnCreate: {
      unit: budgeting.models.FringeUnits.Percent,
      rate: 0.0
    }
  });
  return (state: S | undefined = config.initialState, action: ACTION): S => {
    let newState = generic(state, action);
    if (action.type === config.actions.responseFringeColors.toString()) {
      const payload: Http.ListResponse<string> = action.payload;
      newState = { ...newState, fringeColors: payload.data };
    }
    return newState;
  };
};
