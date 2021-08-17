import { combineReducers } from "redux";

import { redux } from "lib";

import { ActionType } from "../actions";
import initialState, {
  initialAccountState,
  initialSubAccountState,
  initialBudgetBudgetState,
  initialHeaderTemplatesState
} from "../initialState";
import * as factories from "./factories";

const genericReducer = combineReducers({
  autoIndex: redux.reducers.factories.createSimplePayloadReducer<boolean>(ActionType.Template.SetAutoIndex, false),
  account: factories.createAccountReducer(
    {
      SetId: ActionType.Template.Account.SetId,
      Response: ActionType.Template.Account.Response,
      Loading: ActionType.Template.Account.Loading,
      Request: ActionType.Template.Account.Request,
      UpdateInState: ActionType.Template.Account.UpdateInState,
      Table: {
        TableChanged: ActionType.Template.Account.TableChanged,
        Response: ActionType.Template.Account.SubAccounts.Response,
        Request: ActionType.Template.Account.SubAccounts.Request,
        Loading: ActionType.Template.Account.SubAccounts.Loading,
        SetSearch: ActionType.Template.Account.SubAccounts.SetSearch,
        AddToState: ActionType.Template.Account.SubAccounts.AddToState,
        Deleting: ActionType.Template.Account.SubAccounts.Deleting,
        Creating: ActionType.Template.Account.SubAccounts.Creating,
        Updating: ActionType.Template.Account.SubAccounts.Updating,
        Groups: {
          Response: ActionType.Template.Account.Groups.Response,
          Request: ActionType.Template.Account.Groups.Request,
          Loading: ActionType.Template.Account.Groups.Loading,
          UpdateInState: ActionType.Template.Account.Groups.UpdateInState,
          AddToState: ActionType.Template.Account.Groups.AddToState,
          Deleting: ActionType.Template.Account.Groups.Deleting
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
      }
    },
    initialAccountState
  ),
  subaccount: factories.createSubAccountReducer(
    {
      SetId: ActionType.Template.SubAccount.SetId,
      Response: ActionType.Template.SubAccount.Response,
      Loading: ActionType.Template.SubAccount.Loading,
      Request: ActionType.Template.SubAccount.Request,
      UpdateInState: ActionType.Template.SubAccount.UpdateInState,
      Table: {
        TableChanged: ActionType.Template.SubAccount.TableChanged,
        Response: ActionType.Template.SubAccount.SubAccounts.Response,
        Request: ActionType.Template.SubAccount.SubAccounts.Request,
        Loading: ActionType.Template.SubAccount.SubAccounts.Loading,
        SetSearch: ActionType.Template.SubAccount.SubAccounts.SetSearch,
        AddToState: ActionType.Template.SubAccount.SubAccounts.AddToState,
        Deleting: ActionType.Template.SubAccount.SubAccounts.Deleting,
        Creating: ActionType.Template.SubAccount.SubAccounts.Creating,
        Updating: ActionType.Template.SubAccount.SubAccounts.Updating,
        Groups: {
          Response: ActionType.Template.SubAccount.Groups.Response,
          Request: ActionType.Template.SubAccount.Groups.Request,
          Loading: ActionType.Template.SubAccount.Groups.Loading,
          UpdateInState: ActionType.Template.SubAccount.Groups.UpdateInState,
          AddToState: ActionType.Template.SubAccount.Groups.AddToState,
          Deleting: ActionType.Template.SubAccount.Groups.Deleting
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
      }
    },
    initialSubAccountState
  ),
  budget: factories.createBudgetReducer<Model.Template>(
    {
      Response: ActionType.Template.Response,
      Loading: ActionType.Template.Loading,
      Request: ActionType.Template.Request,
      SetId: ActionType.Template.SetId,
      UpdateInState: ActionType.Template.UpdateInState,
      Table: {
        TableChanged: ActionType.Template.Accounts.TableChanged,
        Response: ActionType.Template.Accounts.Response,
        Request: ActionType.Template.Accounts.Request,
        Loading: ActionType.Template.Accounts.Loading,
        SetSearch: ActionType.Template.Accounts.SetSearch,
        AddToState: ActionType.Template.Accounts.AddToState,
        Deleting: ActionType.Template.Accounts.Deleting,
        Creating: ActionType.Template.Accounts.Creating,
        Updating: ActionType.Template.Accounts.Updating,
        Groups: {
          Response: ActionType.Template.Groups.Response,
          Request: ActionType.Template.Groups.Request,
          Loading: ActionType.Template.Groups.Loading,
          UpdateInState: ActionType.Template.Groups.UpdateInState,
          AddToState: ActionType.Template.Groups.AddToState,
          Deleting: ActionType.Template.Groups.Deleting
        }
      }
    },
    initialBudgetBudgetState
  ),
  commentsHistoryDrawerOpen: redux.util.identityReducer<boolean>(false),
  actuals: redux.util.identityReducer<Redux.ModelListResponseStore<Model.Actual>>(
    redux.initialState.initialModelListResponseState
  ),
  headerTemplates:
    redux.util.identityReducer<Modules.Authenticated.Budget.HeaderTemplatesStore>(initialHeaderTemplatesState),
  subAccountsTree: redux.util.identityReducer<Redux.ModelListResponseStore<Model.SubAccountTreeNode>>(
    redux.initialState.initialModelListResponseState
  )
});

const rootReducer: Redux.Reducer<Modules.Authenticated.Budget.ModuleStore<Model.Template>> = (
  state: Modules.Authenticated.Budget.ModuleStore<Model.Template> = initialState.template,
  action: Redux.Action
): Modules.Authenticated.Budget.ModuleStore<Model.Template> => {
  let newState = { ...state };
  if (action.type === ActionType.Template.WipeState) {
    newState = initialState.template;
  }
  return genericReducer(newState, action);
};

export default rootReducer;
