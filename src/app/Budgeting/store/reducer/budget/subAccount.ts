import { combineReducers, Reducer } from "redux";
import {
  createDetailResponseReducer,
  createSimplePayloadReducer,
  createCommentsListResponseReducer
} from "lib/redux/factories";
import { ActionType } from "../../actions";
import { createBudgetSubAccountsReducer } from "../factories";

const rootReducer: Reducer<Redux.Budget.SubAccountStore, Redux.Action<any>> = combineReducers({
  id: createSimplePayloadReducer<number | null>(ActionType.Budget.SubAccount.SetId, null),
  detail: createDetailResponseReducer<
    Model.BudgetSubAccount,
    Redux.DetailResponseStore<Model.BudgetSubAccount>,
    Redux.Action
  >({
    Response: ActionType.Budget.SubAccount.Response,
    Loading: ActionType.Budget.SubAccount.Loading,
    Request: ActionType.Budget.SubAccount.Request
  }),
  comments: createCommentsListResponseReducer({
    Response: ActionType.Budget.SubAccount.Comments.Response,
    Request: ActionType.Budget.SubAccount.Comments.Request,
    Loading: ActionType.Budget.SubAccount.Comments.Loading,
    AddToState: ActionType.Budget.SubAccount.Comments.AddToState,
    RemoveFromState: ActionType.Budget.SubAccount.Comments.RemoveFromState,
    UpdateInState: ActionType.Budget.SubAccount.Comments.UpdateInState,
    Creating: ActionType.Budget.SubAccount.Comments.Creating,
    Deleting: ActionType.Budget.SubAccount.Comments.Deleting,
    Updating: ActionType.Budget.SubAccount.Comments.Updating,
    Replying: ActionType.Budget.SubAccount.Comments.Replying
  }),
  subaccounts: createBudgetSubAccountsReducer({
    Response: ActionType.Budget.SubAccount.SubAccounts.Response,
    Request: ActionType.Budget.SubAccount.SubAccounts.Request,
    Loading: ActionType.Budget.SubAccount.SubAccounts.Loading,
    SetSearch: ActionType.Budget.SubAccount.SubAccounts.SetSearch,
    UpdateInState: ActionType.Budget.SubAccount.SubAccounts.UpdateInState,
    RemoveFromState: ActionType.Budget.SubAccount.SubAccounts.RemoveFromState,
    AddToState: ActionType.Budget.SubAccount.SubAccounts.AddToState,
    Select: ActionType.Budget.SubAccount.SubAccounts.Select,
    Deselect: ActionType.Budget.SubAccount.SubAccounts.Deselect,
    SelectAll: ActionType.Budget.SubAccount.SubAccounts.SelectAll,
    Deleting: ActionType.Budget.SubAccount.SubAccounts.Deleting,
    Creating: ActionType.Budget.SubAccount.SubAccounts.Creating,
    Updating: ActionType.Budget.SubAccount.SubAccounts.Updating,
    RemoveFromGroup: ActionType.Budget.SubAccount.SubAccounts.RemoveFromGroup,
    History: {
      Response: ActionType.Budget.SubAccount.SubAccounts.History.Response,
      Request: ActionType.Budget.SubAccount.SubAccounts.History.Request,
      Loading: ActionType.Budget.SubAccount.SubAccounts.History.Loading
    },
    Groups: {
      Response: ActionType.Budget.SubAccount.SubAccounts.Groups.Response,
      Request: ActionType.Budget.SubAccount.SubAccounts.Groups.Request,
      Loading: ActionType.Budget.SubAccount.SubAccounts.Groups.Loading,
      RemoveFromState: ActionType.Budget.SubAccount.SubAccounts.Groups.RemoveFromState,
      UpdateInState: ActionType.Budget.SubAccount.SubAccounts.Groups.UpdateInState,
      AddToState: ActionType.Budget.SubAccount.SubAccounts.Groups.AddToState,
      Deleting: ActionType.Budget.SubAccount.SubAccounts.Groups.Deleting
    },
    Placeholders: {
      AddToState: ActionType.Budget.SubAccount.SubAccounts.Placeholders.AddToState,
      Activate: ActionType.Budget.SubAccount.SubAccounts.Placeholders.Activate,
      RemoveFromState: ActionType.Budget.SubAccount.SubAccounts.Placeholders.RemoveFromState,
      UpdateInState: ActionType.Budget.SubAccount.SubAccounts.Placeholders.UpdateInState
    }
  })
});

export default rootReducer;
