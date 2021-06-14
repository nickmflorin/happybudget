import { combineReducers, Reducer } from "redux";
import {
  createDetailResponseReducer,
  createSimplePayloadReducer,
  createCommentsListResponseReducer
} from "lib/redux/factories";
import { ActionType } from "../../actions";
import { createBudgetSubAccountsReducer } from "../factories";

const rootReducer: Reducer<Modules.Budgeting.Budget.AccountStore, Redux.Action<any>> = combineReducers({
  id: createSimplePayloadReducer<number | null>(ActionType.Budget.Account.SetId, null),
  detail: createDetailResponseReducer<
    Model.BudgetAccount,
    Redux.ModelDetailResponseStore<Model.BudgetAccount>,
    Redux.Action
  >({
    Response: ActionType.Budget.Account.Response,
    Loading: ActionType.Budget.Account.Loading,
    Request: ActionType.Budget.Account.Request,
    UpdateInState: ActionType.Budget.Account.UpdateInState
  }),
  comments: createCommentsListResponseReducer({
    Response: ActionType.Budget.Account.Comments.Response,
    Request: ActionType.Budget.Account.Comments.Request,
    Loading: ActionType.Budget.Account.Comments.Loading,
    AddToState: ActionType.Budget.Account.Comments.AddToState,
    RemoveFromState: ActionType.Budget.Account.Comments.RemoveFromState,
    UpdateInState: ActionType.Budget.Account.Comments.UpdateInState,
    Creating: ActionType.Budget.Account.Comments.Creating,
    Deleting: ActionType.Budget.Account.Comments.Deleting,
    Updating: ActionType.Budget.Account.Comments.Updating,
    Replying: ActionType.Budget.Account.Comments.Replying
  }),
  subaccounts: createBudgetSubAccountsReducer({
    Response: ActionType.Budget.Account.SubAccounts.Response,
    Request: ActionType.Budget.Account.SubAccounts.Request,
    Loading: ActionType.Budget.Account.SubAccounts.Loading,
    SetSearch: ActionType.Budget.Account.SubAccounts.SetSearch,
    UpdateInState: ActionType.Budget.Account.SubAccounts.UpdateInState,
    RemoveFromState: ActionType.Budget.Account.SubAccounts.RemoveFromState,
    AddToState: ActionType.Budget.Account.SubAccounts.AddToState,
    Select: ActionType.Budget.Account.SubAccounts.Select,
    Deselect: ActionType.Budget.Account.SubAccounts.Deselect,
    SelectAll: ActionType.Budget.Account.SubAccounts.SelectAll,
    Deleting: ActionType.Budget.Account.SubAccounts.Deleting,
    Creating: ActionType.Budget.Account.SubAccounts.Creating,
    Updating: ActionType.Budget.Account.SubAccounts.Updating,
    RemoveFromGroup: ActionType.Budget.Account.SubAccounts.RemoveFromGroup,
    AddToGroup: ActionType.Budget.Account.SubAccounts.AddToGroup,
    // NOTE: This will cause updates to both the Account and SubAccount level when
    // fringes change, even though only one level is visible at any given time.  We
    // should adjust this, so that it only updates the Account SubAccount(s) or the
    // SubAccount SubAccount(s) when Fringes change.
    Fringes: {
      UpdateInState: ActionType.Budget.Fringes.UpdateInState
    },
    History: {
      Response: ActionType.Budget.Account.SubAccounts.History.Response,
      Request: ActionType.Budget.Account.SubAccounts.History.Request,
      Loading: ActionType.Budget.Account.SubAccounts.History.Loading
    },
    Groups: {
      Response: ActionType.Budget.Account.SubAccounts.Groups.Response,
      Request: ActionType.Budget.Account.SubAccounts.Groups.Request,
      Loading: ActionType.Budget.Account.SubAccounts.Groups.Loading,
      RemoveFromState: ActionType.Budget.Account.SubAccounts.Groups.RemoveFromState,
      UpdateInState: ActionType.Budget.Account.SubAccounts.Groups.UpdateInState,
      AddToState: ActionType.Budget.Account.SubAccounts.Groups.AddToState,
      Deleting: ActionType.Budget.Account.SubAccounts.Groups.Deleting
    }
  })
});

export default rootReducer;
