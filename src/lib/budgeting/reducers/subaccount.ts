import { combineReducers } from "redux";
import { isNil } from "lodash";

import { redux } from "lib";

// type R = Tables.SubAccountRowData;
type M = Model.SubAccount;

export type SubAccountAccountDetailActionMap = Omit<Redux.ModelDetailResponseActionMap<M>, "updateInState"> & {
  readonly setId: number | null;
  readonly tableChanged?: Table.ChangeEvent<Tables.SubAccountRowData>;
  readonly fringesTableChanged?: Table.ChangeEvent<Tables.FringeRowData>;
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
  const genericReducer: Redux.Reducer<S> = combineReducers({
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
              ...newState.detail.data
              // estimated: reduce(
              //   filter(newState.table.data, (r: Table.BodyRow<R>) =>
              //     tabling.typeguards.isDataRow(r)
              //   ) as Table.DataRow<R>[],
              //   (curr: number, row: Table.DataRow<R>) => curr + (row.data.estimated || 0),
              //   0
              // ),
              // actual: reduce(
              //   filter(newState.table.data, (r: Table.BodyRow<R>) =>
              //     tabling.typeguards.isDataRow(r)
              //   ) as Table.DataRow<R>[],
              //   (curr: number, row: Table.DataRow<R>) => curr + (row.data.actual || 0),
              //   0
              // )
            }
          }
        };
        newState = {
          ...newState
          // detail: {
          //   ...newState.detail,
          //   data: {
          //     ...newState.detail.data,
          //     variance: (newState.detail.data?.estimated || 0) - (newState.detail.data?.actual || 0)
          //   }
          // }
        };
      }
    }
    return newState;
  };
};
