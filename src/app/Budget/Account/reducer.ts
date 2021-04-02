import { combineReducers, Reducer } from "redux";
import { reduce, isNil } from "lodash";

import {
  createDetailResponseReducer,
  createSimplePayloadReducer,
  createCommentsListResponseReducer
} from "store/factories";

import { ActionType } from "../actions";
import { createSubAccountsReducer } from "../factories";
import { initialAccountState } from "../initialState";

const genericReducer: Reducer<Redux.Budget.IAccountStore, Redux.IAction<any>> = combineReducers({
  id: createSimplePayloadReducer<number | null>(ActionType.Account.SetId, null),
  detail: createDetailResponseReducer<IAccount, Redux.IDetailResponseStore<IAccount>, Redux.IAction>({
    Response: ActionType.Account.Response,
    Loading: ActionType.Account.Loading,
    Request: ActionType.Account.Request,
    UpdateInState: ActionType.Account.UpdateInState
  }),
  comments: createCommentsListResponseReducer({
    Response: ActionType.Account.Comments.Response,
    Request: ActionType.Account.Comments.Request,
    Loading: ActionType.Account.Comments.Loading,
    AddToState: ActionType.Account.Comments.AddToState,
    RemoveFromState: ActionType.Account.Comments.RemoveFromState,
    UpdateInState: ActionType.Account.Comments.UpdateInState,
    Submitting: ActionType.Account.Comments.Submitting,
    Deleting: ActionType.Account.Comments.Deleting,
    Editing: ActionType.Account.Comments.Editing,
    Replying: ActionType.Account.Comments.Replying
  }),
  subaccounts: createSubAccountsReducer({
    Response: ActionType.Account.SubAccounts.Response,
    Request: ActionType.Account.SubAccounts.Request,
    Loading: ActionType.Account.SubAccounts.Loading,
    SetSearch: ActionType.Account.SubAccounts.SetSearch,
    UpdateInState: ActionType.Account.SubAccounts.UpdateInState,
    RemoveFromState: ActionType.Account.SubAccounts.RemoveFromState,
    AddToState: ActionType.Account.SubAccounts.AddToState,
    Select: ActionType.Account.SubAccounts.Select,
    Deselect: ActionType.Account.SubAccounts.Deselect,
    SelectAll: ActionType.Account.SubAccounts.SelectAll,
    Deleting: ActionType.Account.SubAccounts.Deleting,
    Creating: ActionType.Account.SubAccounts.Creating,
    Updating: ActionType.Account.SubAccounts.Updating,
    RemoveFromGroup: ActionType.Account.SubAccounts.RemoveFromGroup,
    History: {
      Response: ActionType.Account.SubAccounts.History.Response,
      Request: ActionType.Account.SubAccounts.History.Request,
      Loading: ActionType.Account.SubAccounts.History.Loading
    },
    Groups: {
      Response: ActionType.Account.SubAccounts.Groups.Response,
      Request: ActionType.Account.SubAccounts.Groups.Request,
      Loading: ActionType.Account.SubAccounts.Groups.Loading,
      RemoveFromState: ActionType.Account.SubAccounts.Groups.RemoveFromState,
      UpdateInState: ActionType.Account.SubAccounts.Groups.UpdateInState,
      AddToState: ActionType.Account.SubAccounts.Groups.AddToState,
      Deleting: ActionType.Account.SubAccounts.Groups.Deleting
    },
    Placeholders: {
      AddToState: ActionType.Account.SubAccounts.Placeholders.AddToState,
      Activate: ActionType.Account.SubAccounts.Placeholders.Activate,
      RemoveFromState: ActionType.Account.SubAccounts.Placeholders.RemoveFromState,
      UpdateInState: ActionType.Account.SubAccounts.Placeholders.UpdateInState
    }
  })
});

const rootReducer: Reducer<Redux.Budget.IAccountStore, Redux.IAction<any>> = (
  state: Redux.Budget.IAccountStore = initialAccountState,
  action: Redux.IAction<any>
): Redux.Budget.IAccountStore => {
  let newState = genericReducer(state, action);

  // NOTE: The above reducer handles updates to the Account itself or the SubAccount itself
  // via some of these same actions. However, it does not do any recalculation of the account values,
  // because it needs the state of the Account and the state of the SubAccount(s) to do so. This
  // means moving that logic/recalculation further up the reducer tree where we have access to both
  // the SubAccount(s) and the Account in the state.
  if (
    action.type === ActionType.Account.SubAccounts.UpdateInState ||
    action.type === ActionType.Account.SubAccounts.RemoveFromState ||
    action.type === ActionType.Account.SubAccounts.AddToState ||
    action.type === ActionType.Account.SubAccounts.Placeholders.UpdateInState
  ) {
    // Update the overall Account based on the underlying SubAccount(s) present and any potential
    // placeholders present.
    const subAccounts: ISubAccount[] = newState.subaccounts.data;
    const placeholders: Table.SubAccountRow[] = newState.subaccounts.placeholders;
    // Right now, the backend is configured such that the Actual value for the overall Account is
    // determined from the Actual values of the underlying SubAccount(s).  If that logic changes
    // in the backend, we need to also make that adjustment here.
    const actual =
      reduce(subAccounts, (sum: number, s: ISubAccount) => sum + (s.actual || 0), 0) +
      reduce(placeholders, (sum: number, s: Table.SubAccountRow) => sum + (s.actual || 0), 0);
    const estimated =
      reduce(subAccounts, (sum: number, s: ISubAccount) => sum + (s.estimated || 0), 0) +
      reduce(placeholders, (sum: number, s: Table.SubAccountRow) => sum + (s.estimated || 0), 0);
    if (!isNil(newState.detail.data)) {
      newState = {
        ...newState,
        detail: {
          ...newState.detail,
          data: { ...newState.detail.data, actual, estimated, variance: estimated - actual }
        }
      };
    }
  }
  return newState;
};

export default rootReducer;
