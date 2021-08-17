import { combineReducers } from "redux";
import { isNil, reduce } from "lodash";

import { redux, tabling } from "lib";

interface HistoryActionMap {
  Response: string;
  Request: string;
  Loading: string;
}

type ReducerFactoryActionMap = {
  SetId: string;
  Request: string;
  Response: string;
  Loading: string;
  UpdateInState: string;
  // History only applicable in the Budget case (not the Template case).
  History?: HistoryActionMap;
  // Comments only applicable in the Budget case (not the Template case).
  Comments?: Partial<Redux.CommentsListResponseActionMap>;
};

export const createBudgetReducer = <M extends Model.Budget | Model.Template>(
  mapping: ReducerFactoryActionMap & { Table: Omit<Redux.BudgetTableActionMap, "RemoveFromState" | "UpdateInState"> },
  initialState: Modules.Authenticated.Budget.BudgetStore<M>
): Redux.Reducer<Modules.Authenticated.Budget.BudgetStore<M>> => {
  /* eslint-disable indent */
  const genericReducer: Redux.Reducer<Modules.Authenticated.Budget.BudgetStore<M>> = combineReducers({
    id: redux.reducers.factories.createSimplePayloadReducer<number | null>(mapping.SetId, initialState.id),
    detail: redux.reducers.factories.createDetailResponseReducer<M, Redux.ModelDetailResponseStore<M>>({
      Response: mapping.Response,
      Loading: mapping.Loading,
      Request: mapping.Request,
      UpdateInState: mapping.UpdateInState
    }),
    table: tabling.reducers.createBudgetTableReducer<Model.Account>(mapping.Table, initialState.table),
    comments: !isNil(mapping.Comments)
      ? redux.reducers.factories.createCommentsListResponseReducer(mapping.Comments, {
          initialState: redux.initialState.initialCommentsListResponseState
        })
      : redux.util.identityReducer<Redux.CommentsListResponseStore>(
          redux.initialState.initialCommentsListResponseState
        ),
    history: !isNil(mapping.History)
      ? redux.reducers.factories.createModelListResponseReducer<Model.HistoryEvent>(mapping.History, {
          initialState: initialState.history
        })
      : redux.util.identityReducer<Redux.ModelListResponseStore<Model.HistoryEvent>>(initialState.history)
  });

  return genericReducer;
};

const createAccountSubAccountReducer = <M extends Model.Account | Model.SubAccount>(
  /* eslint-disable indent */
  mapping: ReducerFactoryActionMap & {
    Table: Omit<Redux.BudgetTableWithFringesActionMap, "RemoveFromState" | "UpdateInState">;
  },
  initialState: Modules.Authenticated.Budget.AccountOrSubAccountStore<M>
): Redux.Reducer<Modules.Authenticated.Budget.AccountOrSubAccountStore<M>> => {
  /* eslint-disable indent */
  const genericReducer: Redux.Reducer<Modules.Authenticated.Budget.AccountOrSubAccountStore<M>> = combineReducers({
    id: redux.reducers.factories.createSimplePayloadReducer<number | null>(mapping.SetId, initialState.id),
    detail: redux.reducers.factories.createDetailResponseReducer<M, Redux.ModelDetailResponseStore<M>>({
      Response: mapping.Response,
      Loading: mapping.Loading,
      Request: mapping.Request,
      UpdateInState: mapping.UpdateInState
    }),
    table: tabling.reducers.createBudgetTableWithFringesReducer<Model.SubAccount>(
      mapping.Table,
      redux.initialState.initialBudgetTableWithFringesState
    ),
    comments: !isNil(mapping.Comments)
      ? redux.reducers.factories.createCommentsListResponseReducer(mapping.Comments, {
          initialState: initialState.comments
        })
      : redux.util.identityReducer<Redux.CommentsListResponseStore>(initialState.comments),
    history: !isNil(mapping.History)
      ? redux.reducers.factories.createModelListResponseReducer<Model.HistoryEvent>(mapping.History, {
          initialState: initialState.history
        })
      : redux.util.identityReducer<Redux.ModelListResponseStore<Model.HistoryEvent>>(initialState.history)
  });

  type GenericEvent = Table.ChangeEvent<Tables.FringeRow | Tables.SubAccountRow, Model.Fringe | Model.SubAccount>;

  return (state: Modules.Authenticated.Budget.AccountOrSubAccountStore<M> = initialState, action: Redux.Action) => {
    let newState: Modules.Authenticated.Budget.AccountOrSubAccountStore<M> = genericReducer(state, action);

    // When an Account's underlying subaccounts are removed, updated or added,
    // or the Fringes are changed, we need to update/recalculate the Account.
    if (action.type === mapping.Table.TableChanged || action.type === mapping.Table.Fringes.TableChanged) {
      const e: GenericEvent = action.payload;

      if (!tabling.typeguards.isGroupEvent(e) && tabling.util.eventWarrantsRecalculation(e)) {
        // Update the overall Account based on the underlying SubAccount(s) present.
        let subAccounts: Model.SubAccount[] = newState.table.data;
        let newData: { estimated: number; actual?: number; variance?: number } = {
          estimated: reduce(subAccounts, (sum: number, s: Model.SubAccount) => sum + (s.estimated || 0), 0)
        };
        // If we are dealing with the Budget case (and not the Template case) we need to also update
        // the overall Account's actual and variance values.
        const actual = reduce(subAccounts, (sum: number, s: Model.SubAccount) => sum + (s.actual || 0), 0);
        newData = { ...newData, actual, variance: newData.estimated - actual };
        if (!isNil(newState.detail.data)) {
          newState = {
            ...newState,
            detail: {
              ...newState.detail,
              data: {
                ...newState.detail.data,
                ...newData
              }
            }
          };
        }
      }
    }

    return newState;
  };
};

export const createAccountReducer = (
  mapping: ReducerFactoryActionMap & {
    Table: Omit<Redux.BudgetTableWithFringesActionMap, "RemoveFromState" | "UpdateInState">;
  },
  initialState: Modules.Authenticated.Budget.AccountStore
): Redux.Reducer<Modules.Authenticated.Budget.AccountStore> =>
  createAccountSubAccountReducer<Model.Account>(mapping, initialState);

export const createSubAccountReducer = (
  mapping: ReducerFactoryActionMap & {
    Table: Omit<Redux.BudgetTableWithFringesActionMap, "RemoveFromState" | "UpdateInState">;
  },
  initialState: Modules.Authenticated.Budget.SubAccountStore
): Redux.Reducer<Modules.Authenticated.Budget.SubAccountStore> =>
  createAccountSubAccountReducer<Model.SubAccount>(mapping, initialState);
