import { combineReducers, Reducer } from "redux";

import {
  createDetailResponseReducer,
  createSimplePayloadReducer,
  createCommentsListResponseReducer
} from "store/factories";

import { ActionType } from "../actions";
import { createSubAccountsReducer } from "../factories";

const rootReducer: Reducer<Redux.Budget.IAccountStore, Redux.IAction<any>> = combineReducers({
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
    Creating: ActionType.Account.Comments.Creating,
    Deleting: ActionType.Account.Comments.Deleting,
    Updating: ActionType.Account.Comments.Updating,
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

export default rootReducer;
