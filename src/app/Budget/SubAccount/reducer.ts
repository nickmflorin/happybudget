import { combineReducers, Reducer } from "redux";
import { reduce, isNil } from "lodash";
import {
  createDetailResponseReducer,
  createSimplePayloadReducer,
  createCommentsListResponseReducer
} from "store/factories";

import { ActionType } from "../actions";
import { createSubAccountsReducer } from "../factories";
import { initialSubAccountState } from "../initialState";

const genericReducer: Reducer<Redux.Budget.ISubAccountStore, Redux.IAction<any>> = combineReducers({
  id: createSimplePayloadReducer<number | null>(ActionType.SubAccount.SetId, null),
  detail: createDetailResponseReducer<ISubAccount, Redux.IDetailResponseStore<ISubAccount>, Redux.IAction>({
    Response: ActionType.SubAccount.Response,
    Loading: ActionType.SubAccount.Loading,
    Request: ActionType.SubAccount.Request
  }),
  comments: createCommentsListResponseReducer({
    Response: ActionType.SubAccount.Comments.Response,
    Request: ActionType.SubAccount.Comments.Request,
    Loading: ActionType.SubAccount.Comments.Loading,
    AddToState: ActionType.SubAccount.Comments.AddToState,
    RemoveFromState: ActionType.SubAccount.Comments.RemoveFromState,
    UpdateInState: ActionType.SubAccount.Comments.UpdateInState,
    Creating: ActionType.SubAccount.Comments.Creating,
    Deleting: ActionType.SubAccount.Comments.Deleting,
    Updating: ActionType.SubAccount.Comments.Updating,
    Replying: ActionType.SubAccount.Comments.Replying
  }),
  subaccounts: createSubAccountsReducer({
    Response: ActionType.SubAccount.SubAccounts.Response,
    Request: ActionType.SubAccount.SubAccounts.Request,
    Loading: ActionType.SubAccount.SubAccounts.Loading,
    SetSearch: ActionType.SubAccount.SubAccounts.SetSearch,
    UpdateInState: ActionType.SubAccount.SubAccounts.UpdateInState,
    RemoveFromState: ActionType.SubAccount.SubAccounts.RemoveFromState,
    AddToState: ActionType.SubAccount.SubAccounts.AddToState,
    Select: ActionType.SubAccount.SubAccounts.Select,
    Deselect: ActionType.SubAccount.SubAccounts.Deselect,
    SelectAll: ActionType.SubAccount.SubAccounts.SelectAll,
    Deleting: ActionType.SubAccount.SubAccounts.Deleting,
    Creating: ActionType.SubAccount.SubAccounts.Creating,
    Updating: ActionType.SubAccount.SubAccounts.Updating,
    RemoveFromGroup: ActionType.SubAccount.SubAccounts.RemoveFromGroup,
    History: {
      Response: ActionType.SubAccount.SubAccounts.History.Response,
      Request: ActionType.SubAccount.SubAccounts.History.Request,
      Loading: ActionType.SubAccount.SubAccounts.History.Loading
    },
    Groups: {
      Response: ActionType.SubAccount.SubAccounts.Groups.Response,
      Request: ActionType.SubAccount.SubAccounts.Groups.Request,
      Loading: ActionType.SubAccount.SubAccounts.Groups.Loading,
      RemoveFromState: ActionType.SubAccount.SubAccounts.Groups.RemoveFromState,
      UpdateInState: ActionType.SubAccount.SubAccounts.Groups.UpdateInState,
      AddToState: ActionType.SubAccount.SubAccounts.Groups.AddToState,
      Deleting: ActionType.SubAccount.SubAccounts.Groups.Deleting
    },
    Placeholders: {
      AddToState: ActionType.SubAccount.SubAccounts.Placeholders.AddToState,
      Activate: ActionType.SubAccount.SubAccounts.Placeholders.Activate,
      RemoveFromState: ActionType.SubAccount.SubAccounts.Placeholders.RemoveFromState,
      UpdateInState: ActionType.SubAccount.SubAccounts.Placeholders.UpdateInState
    }
  })
});

const rootReducer: Reducer<Redux.Budget.ISubAccountStore, Redux.IAction<any>> = (
  state: Redux.Budget.ISubAccountStore = initialSubAccountState,
  action: Redux.IAction<any>
): Redux.Budget.ISubAccountStore => {
  let newState = genericReducer(state, action);

  // NOTE: The above reducer handles updates to the Account itself or the SubAccount itself
  // via some of these same actions. However, it does not do any recalculation of the account values,
  // because it needs the state of the Account and the state of the SubAccount(s) to do so. This
  // means moving that logic/recalculation further up the reducer tree where we have access to both
  // the SubAccount(s) and the Account in the state.
  if (
    action.type === ActionType.SubAccount.SubAccounts.UpdateInState ||
    action.type === ActionType.SubAccount.SubAccounts.RemoveFromState ||
    action.type === ActionType.SubAccount.SubAccounts.AddToState ||
    action.type === ActionType.SubAccount.SubAccounts.Placeholders.UpdateInState
  ) {
    // Update the overall SubAccount based on the underlying SubAccount(s) present and any potential
    // placeholders present.
    const subAccounts: ISubAccount[] = newState.subaccounts.data;
    const placeholders: Table.SubAccountRow[] = newState.subaccounts.placeholders;
    // Right now, the backend is configured such that the Actual value for the overall SubAccount is
    // determined from the Actual values tied to that SubAccount, not the underlying SubAccount(s).
    // If that logic changes in the backend, we need to also make that adjustment here.
    let payload: Partial<ISubAccount> = {
      estimated:
        reduce(subAccounts, (sum: number, s: ISubAccount) => sum + (s.estimated || 0), 0) +
        reduce(placeholders, (sum: number, s: Table.SubAccountRow) => sum + (s.estimated || 0), 0)
    };
    if (!isNil(newState.detail.data)) {
      if (!isNil(newState.detail.data.actual) && !isNil(payload.estimated)) {
        payload = { ...payload, variance: payload.estimated - newState.detail.data.actual };
      }
      if (!isNil(newState.detail.data)) {
        newState = {
          ...newState,
          detail: {
            ...newState.detail,
            data: { ...newState.detail.data, ...payload }
          }
        };
      }
    }
  }
  return newState;
};

export default rootReducer;
