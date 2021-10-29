import { tabling, model } from "lib";

export type FringeTableActionMap = Redux.TableActionMap<Model.Fringe> & {
  readonly responseFringeColors: Http.ListResponse<string>;
};

/* eslint-disable indent */
export const createUnauthenticatedFringesTableReducer = (
  config: Table.ReducerConfig<Tables.FringeRowData, Model.Fringe, Tables.FringeTableStore, FringeTableActionMap>
): Redux.Reducer<Tables.FringeTableStore> => {
  type S = Tables.FringeTableStore;

  const generic = tabling.reducers.createUnauthenticatedTableReducer<
    Tables.FringeRowData,
    Model.Fringe,
    Tables.FringeTableStore
  >(config);

  return (state: S | undefined = config.initialState, action: Redux.Action<any>): S => {
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
  Model.Fringe
> & {
  readonly responseFringeColors: Http.ListResponse<string>;
};

/* eslint-disable indent */
export const createAuthenticatedFringesTableReducer = (
  config: Omit<
    Table.ReducerConfig<Tables.FringeRowData, Model.Fringe, Tables.FringeTableStore, AuthenticatedFringeTableActionMap>,
    "defaultData"
  >
): Redux.Reducer<Tables.FringeTableStore> => {
  type S = Tables.FringeTableStore;

  const generic = tabling.reducers.createAuthenticatedTableReducer<
    Tables.FringeRowData,
    Model.Fringe,
    Tables.FringeTableStore
  >({
    ...config,
    defaultData: {
      unit: model.models.FringeUnitModels.PERCENT,
      rate: 0.0
    }
  });

  return (state: S | undefined = config.initialState, action: Redux.Action<any>): S => {
    let newState = generic(state, action);
    if (action.type === config.actions.responseFringeColors.toString()) {
      const payload: Http.ListResponse<string> = action.payload;
      newState = { ...newState, fringeColors: payload.data };
    }
    return newState;
  };
};
