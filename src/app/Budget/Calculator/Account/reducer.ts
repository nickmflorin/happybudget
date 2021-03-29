import { combineReducers } from "redux";

import {
  createDetailResponseReducer,
  createSimplePayloadReducer,
  createCommentsListResponseReducer
} from "store/factories";

import { createSubAccountsReducer } from "../factories";
import { ActionType } from "./actions";

const rootReducer = combineReducers({
  id: createSimplePayloadReducer(ActionType.Account.SetId),
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

export default rootReducer;
