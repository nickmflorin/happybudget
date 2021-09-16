import { combineReducers } from "redux";
import { reduce, filter, isNil } from "lodash";

import { redux, tabling } from "lib";

type R = Tables.SubAccountRowData;
type M = Model.Account;

export type AccountDetailActionMap = Omit<Redux.ModelDetailResponseActionMap<M>, "updateInState"> & {
  readonly setId: number | null;
  readonly tableChanged?: Table.ChangeEvent<Tables.SubAccountRowData, Model.SubAccount>;
  readonly fringesTableChanged?: Table.ChangeEvent<Tables.FringeRowData, Model.Fringe>;
};

type MinimalAccountStore = {
  readonly id: number | null;
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
  const genericReducer: Redux.Reducer<S> = combineReducers({
    ...config.reducers,
    detail: redux.reducers.createDetailResponseReducer<Model.Account, AccountDetailActionMap>({
      initialState: redux.initialState.initialDetailResponseState,
      actions: config.actions
    }),
    id: redux.reducers.createSimplePayloadReducer<number | null>({
      initialState: null,
      actions: { set: config.actions.setId }
    })
  }) as Redux.Reducer<S>;

  return (state: S = config.initialState, action: Redux.Action<any>): S => {
    let newState = genericReducer(state, action);
    // These should be undefined for the unauthenticated cases.
    if (!isNil(config.actions.tableChanged) && !isNil(config.actions.fringesTableChanged)) {
      if (
        action.type === config.actions.tableChanged.toString() ||
        action.type === config.actions.fringesTableChanged.toString()
      ) {
        newState = {
          ...newState,
          detail: {
            ...newState.detail,
            data: {
              ...newState.detail.data,
              estimated: reduce(
                filter(newState.table.data, (r: Table.Row<R, M>) => tabling.typeguards.isDataRow(r)) as Table.DataRow<
                  R,
                  M
                >[],
                (curr: number, row: Table.DataRow<R, M>) => curr + (row.data.estimated || 0),
                0
              ),
              actual: reduce(
                filter(newState.table.data, (r: Table.Row<R, M>) => tabling.typeguards.isDataRow(r)) as Table.DataRow<
                  R,
                  M
                >[],
                (curr: number, row: Table.DataRow<R, M>) => curr + (row.data.actual || 0),
                0
              )
            }
          }
        };
        newState = {
          ...newState,
          detail: {
            ...newState.detail,
            data: {
              ...newState.detail.data,
              variance: (newState.detail.data?.estimated || 0) - (newState.detail.data?.actual || 0)
            }
          }
        };
      }
    }
    return newState;
  };
};
