import { combineReducers, Reducer } from "redux";
import { reduce, isNil } from "lodash";

import {
  createDetailResponseReducer,
  createSimplePayloadReducer,
  createCommentsListResponseReducer
} from "store/factories";

import { createSubAccountsReducer } from "../factories";
import { initialAccountState } from "../initialState";
import { ActionType } from "./actions";

const genericReducer: Reducer<Redux.Calculator.IAccountStore, Redux.IAction<any>> = combineReducers({
  id: createSimplePayloadReducer<number | null>(ActionType.Account.SetId, null),
  detail: createDetailResponseReducer<IAccount, Redux.IDetailResponseStore<IAccount>, Redux.IAction>({
    Response: ActionType.Account.Response,
    Loading: ActionType.Account.Loading,
    Request: ActionType.Account.Request,
    UpdateInState: ActionType.Account.UpdateInState
  }),
  comments: createCommentsListResponseReducer({
    Response: ActionType.Comments.Response,
    Request: ActionType.Comments.Request,
    Loading: ActionType.Comments.Loading,
    AddToState: ActionType.Comments.AddToState,
    RemoveFromState: ActionType.Comments.RemoveFromState,
    UpdateInState: ActionType.Comments.UpdateInState,
    Submitting: ActionType.Comments.Submitting,
    Deleting: ActionType.Comments.Deleting,
    Editing: ActionType.Comments.Editing,
    Replying: ActionType.Comments.Replying
  }),
  subaccounts: createSubAccountsReducer({
    Response: ActionType.SubAccounts.Response,
    Request: ActionType.SubAccounts.Request,
    Loading: ActionType.SubAccounts.Loading,
    SetSearch: ActionType.SubAccounts.SetSearch,
    UpdateInState: ActionType.SubAccounts.UpdateInState,
    RemoveFromState: ActionType.SubAccounts.RemoveFromState,
    AddToState: ActionType.SubAccounts.AddToState,
    Select: ActionType.SubAccounts.Select,
    Deselect: ActionType.SubAccounts.Deselect,
    SelectAll: ActionType.SubAccounts.SelectAll,
    Deleting: ActionType.SubAccounts.Deleting,
    Creating: ActionType.SubAccounts.Creating,
    Updating: ActionType.SubAccounts.Updating,
    RemoveFromGroup: ActionType.SubAccounts.RemoveFromGroup,
    History: {
      Response: ActionType.SubAccounts.History.Response,
      Request: ActionType.SubAccounts.History.Request,
      Loading: ActionType.SubAccounts.History.Loading
    },
    Groups: {
      Response: ActionType.SubAccounts.Groups.Response,
      Request: ActionType.SubAccounts.Groups.Request,
      Loading: ActionType.SubAccounts.Groups.Loading,
      RemoveFromState: ActionType.SubAccounts.Groups.RemoveFromState,
      UpdateInState: ActionType.SubAccounts.Groups.UpdateInState,
      AddToState: ActionType.SubAccounts.Groups.AddToState,
      Deleting: ActionType.SubAccounts.Groups.Deleting
    },
    Placeholders: {
      AddToState: ActionType.SubAccounts.Placeholders.AddToState,
      Activate: ActionType.SubAccounts.Placeholders.Activate,
      RemoveFromState: ActionType.SubAccounts.Placeholders.RemoveFromState,
      UpdateInState: ActionType.SubAccounts.Placeholders.UpdateInState
    }
  })
});

const rootReducer: Reducer<Redux.Calculator.IAccountStore, Redux.IAction<any>> = (
  state: Redux.Calculator.IAccountStore = initialAccountState,
  action: Redux.IAction<any>
): Redux.Calculator.IAccountStore => {
  let newState = genericReducer(state, action);

  // NOTE: The above reducer handles updates to the Account itself or the SubAccount itself
  // via some of these same actions. However, it does not do any recalculation of the account values,
  // because it needs the state of the Account and the state of the SubAccount(s) to do so. This
  // means moving that logic/recalculation further up the reducer tree where we have access to both
  // the SubAccount(s) and the Account in the state.
  if (
    action.type === ActionType.SubAccounts.UpdateInState ||
    action.type === ActionType.SubAccounts.RemoveFromState ||
    action.type === ActionType.SubAccounts.AddToState ||
    action.type === ActionType.SubAccounts.Placeholders.UpdateInState
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
