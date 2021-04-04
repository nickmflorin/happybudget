import { combineReducers, Reducer } from "redux";
import {
  createDetailResponseReducer,
  createSimplePayloadReducer,
  createCommentsListResponseReducer
} from "store/factories";

import { ActionType } from "../actions";
import { createSubAccountsReducer } from "../factories";

const rootReducer: Reducer<Redux.Budget.ISubAccountStore, Redux.IAction<any>> = combineReducers({
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

export default rootReducer;
