import { tabling, budgeting } from "lib";

export type FringeTableActionMap = Redux.TableActionMap<Model.Fringe, Tables.FringeTableContext> & {
  readonly responseFringeColors: Redux.ActionCreator<Http.ListResponse<string>>;
};

export const createPublicFringesTableReducer = (
  config: Table.ReducerConfig<
    Tables.FringeRowData,
    Model.Fringe,
    Tables.FringeTableStore,
    Tables.FringeTableContext,
    FringeTableActionMap
  >
): Redux.Reducer<Tables.FringeTableStore> => {
  type S = Tables.FringeTableStore;

  const generic = tabling.reducers.createPublicTableReducer<
    Tables.FringeRowData,
    Model.Fringe,
    Tables.FringeTableStore,
    Tables.FringeTableContext
  >(config);

  return (state: S | undefined = config.initialState, action: Redux.Action): S => {
    let newState = generic(state, action);
    if (action.type === config.actions.responseFringeColors.toString()) {
      const payload: Http.ListResponse<string> = action.payload;
      newState = { ...newState, fringeColors: payload.data };
    }
    return newState;
  };
};

export type AuthenticatedFringeTableActionMap = Redux.AuthenticatedTableActionMap<
  Tables.FringeRowData,
  Model.Fringe,
  Tables.FringeTableContext
> & {
  readonly responseFringeColors: Redux.ActionCreator<Http.ListResponse<string>>;
};

export const createAuthenticatedFringesTableReducer = (
  config: Omit<
    Table.ReducerConfig<
      Tables.FringeRowData,
      Model.Fringe,
      Tables.FringeTableStore,
      Tables.FringeTableContext,
      AuthenticatedFringeTableActionMap
    >,
    "defaultData"
  >
): Redux.Reducer<Tables.FringeTableStore> => {
  type S = Tables.FringeTableStore;

  const generic = tabling.reducers.createAuthenticatedTableReducer<
    Tables.FringeRowData,
    Model.Fringe,
    Tables.FringeTableStore,
    Tables.FringeTableContext
  >({
    ...config,
    defaultData: {
      unit: budgeting.models.FringeUnitModels.PERCENT,
      rate: 0.0
    }
  });

  return (state: S | undefined = config.initialState, action: Redux.Action): S => {
    let newState = generic(state, action);
    if (action.type === config.actions.responseFringeColors.toString()) {
      const payload: Http.ListResponse<string> = action.payload;
      newState = { ...newState, fringeColors: payload.data };
    }
    return newState;
  };
};
