import { Reducer, combineReducers } from "redux";
import { createDetailResponseReducer, createSimplePayloadReducer } from "lib/redux/factories";
import { ActionType } from "../actions";
import initialState, {
  initialTemplateAccountState,
  initialTemplateSubAccountState,
  initialTemplateAccountsState
} from "../initialState";
import * as factories from "./factories";

const genericReducer = combineReducers({
  autoIndex: createSimplePayloadReducer<boolean>(ActionType.Template.SetAutoIndex, false),
  account: factories.createAccountReducer<Modules.Budgeting.Template.AccountStore>(
    {
      SetId: ActionType.Template.Account.SetId,
      Response: ActionType.Template.Account.Response,
      Loading: ActionType.Template.Account.Loading,
      Request: ActionType.Template.Account.Request,
      UpdateInState: ActionType.Template.Account.UpdateInState,
      TableChanged: ActionType.Template.Account.TableChanged,
      SubAccounts: {
        Response: ActionType.Template.Account.SubAccounts.Response,
        Request: ActionType.Template.Account.SubAccounts.Request,
        Loading: ActionType.Template.Account.SubAccounts.Loading,
        SetSearch: ActionType.Template.Account.SubAccounts.SetSearch,
        AddToState: ActionType.Template.Account.SubAccounts.AddToState,
        Deleting: ActionType.Template.Account.SubAccounts.Deleting,
        Creating: ActionType.Template.Account.SubAccounts.Creating,
        Updating: ActionType.Template.Account.SubAccounts.Updating,
        RemoveFromGroup: ActionType.Template.Account.SubAccounts.RemoveFromGroup,
        AddToGroup: ActionType.Template.Account.SubAccounts.AddToGroup,
        Groups: {
          Response: ActionType.Template.Account.SubAccounts.Groups.Response,
          Request: ActionType.Template.Account.SubAccounts.Groups.Request,
          Loading: ActionType.Template.Account.SubAccounts.Groups.Loading,
          RemoveFromState: ActionType.Template.Account.SubAccounts.Groups.RemoveFromState,
          UpdateInState: ActionType.Template.Account.SubAccounts.Groups.UpdateInState,
          AddToState: ActionType.Template.Account.SubAccounts.Groups.AddToState,
          Deleting: ActionType.Template.Account.SubAccounts.Groups.Deleting
        }
      },
      Fringes: {
        TableChanged: ActionType.Template.Account.Fringes.TableChanged,
        Response: ActionType.Template.Account.Fringes.Response,
        Request: ActionType.Template.Account.Fringes.Request,
        Loading: ActionType.Template.Account.Fringes.Loading,
        AddToState: ActionType.Template.Account.Fringes.AddToState,
        SetSearch: ActionType.Template.Account.Fringes.SetSearch,
        Deleting: ActionType.Template.Account.Fringes.Deleting,
        Creating: ActionType.Template.Account.Fringes.Creating,
        Updating: ActionType.Template.Account.Fringes.Updating
      }
    },
    initialTemplateAccountState
  ),
  subaccount: factories.createSubAccountReducer<Modules.Budgeting.Template.SubAccountStore>(
    {
      SetId: ActionType.Template.SubAccount.SetId,
      Response: ActionType.Template.SubAccount.Response,
      Loading: ActionType.Template.SubAccount.Loading,
      Request: ActionType.Template.SubAccount.Request,
      UpdateInState: ActionType.Template.SubAccount.UpdateInState,
      TableChanged: ActionType.Template.SubAccount.TableChanged,
      SubAccounts: {
        Response: ActionType.Template.SubAccount.SubAccounts.Response,
        Request: ActionType.Template.SubAccount.SubAccounts.Request,
        Loading: ActionType.Template.SubAccount.SubAccounts.Loading,
        SetSearch: ActionType.Template.SubAccount.SubAccounts.SetSearch,
        AddToState: ActionType.Template.SubAccount.SubAccounts.AddToState,
        Deleting: ActionType.Template.SubAccount.SubAccounts.Deleting,
        Creating: ActionType.Template.SubAccount.SubAccounts.Creating,
        Updating: ActionType.Template.SubAccount.SubAccounts.Updating,
        RemoveFromGroup: ActionType.Template.SubAccount.SubAccounts.RemoveFromGroup,
        AddToGroup: ActionType.Template.SubAccount.SubAccounts.AddToGroup,
        Groups: {
          Response: ActionType.Template.SubAccount.SubAccounts.Groups.Response,
          Request: ActionType.Template.SubAccount.SubAccounts.Groups.Request,
          Loading: ActionType.Template.SubAccount.SubAccounts.Groups.Loading,
          RemoveFromState: ActionType.Template.SubAccount.SubAccounts.Groups.RemoveFromState,
          UpdateInState: ActionType.Template.SubAccount.SubAccounts.Groups.UpdateInState,
          AddToState: ActionType.Template.SubAccount.SubAccounts.Groups.AddToState,
          Deleting: ActionType.Template.SubAccount.SubAccounts.Groups.Deleting
        }
      },
      Fringes: {
        TableChanged: ActionType.Template.SubAccount.Fringes.TableChanged,
        Response: ActionType.Template.SubAccount.Fringes.Response,
        Request: ActionType.Template.SubAccount.Fringes.Request,
        Loading: ActionType.Template.SubAccount.Fringes.Loading,
        AddToState: ActionType.Template.SubAccount.Fringes.AddToState,
        SetSearch: ActionType.Template.SubAccount.Fringes.SetSearch,
        Deleting: ActionType.Template.SubAccount.Fringes.Deleting,
        Creating: ActionType.Template.SubAccount.Fringes.Creating,
        Updating: ActionType.Template.SubAccount.Fringes.Updating
      }
    },
    initialTemplateSubAccountState
  ),
  accounts: factories.createAccountsReducer<Modules.Budgeting.Template.AccountsStore>(
    {
      TableChanged: ActionType.Template.Accounts.TableChanged,
      Response: ActionType.Template.Accounts.Response,
      Request: ActionType.Template.Accounts.Request,
      Loading: ActionType.Template.Accounts.Loading,
      SetSearch: ActionType.Template.Accounts.SetSearch,
      AddToState: ActionType.Template.Accounts.AddToState,
      Deleting: ActionType.Template.Accounts.Deleting,
      Creating: ActionType.Template.Accounts.Creating,
      Updating: ActionType.Template.Accounts.Updating,
      RemoveFromGroup: ActionType.Template.Accounts.RemoveFromGroup,
      AddToGroup: ActionType.Template.Accounts.AddToGroup,
      Groups: {
        Response: ActionType.Template.Accounts.Groups.Response,
        Request: ActionType.Template.Accounts.Groups.Request,
        Loading: ActionType.Template.Accounts.Groups.Loading,
        RemoveFromState: ActionType.Template.Accounts.Groups.RemoveFromState,
        UpdateInState: ActionType.Template.Accounts.Groups.UpdateInState,
        AddToState: ActionType.Template.Accounts.Groups.AddToState,
        Deleting: ActionType.Template.Accounts.Groups.Deleting
      }
    },
    initialTemplateAccountsState
  ),
  template: combineReducers({
    id: createSimplePayloadReducer<number | null>(ActionType.Template.SetId, null),
    detail: createDetailResponseReducer<Model.Template, Redux.ModelDetailResponseStore<Model.Template>, Redux.Action>({
      Response: ActionType.Template.Response,
      Loading: ActionType.Template.Loading,
      Request: ActionType.Template.Request
    })
  })
});

const rootReducer: Reducer<Modules.Budgeting.Template.Store, Redux.Action<any>> = (
  state: Modules.Budgeting.Template.Store = initialState.template,
  action: Redux.Action<any>
): Modules.Budgeting.Template.Store => {
  let newState = { ...state };
  if (action.type === ActionType.Template.WipeState) {
    newState = initialState.template;
  }
  return genericReducer(newState, action);
};

export default rootReducer;
