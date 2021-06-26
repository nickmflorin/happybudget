import { Reducer, combineReducers } from "redux";
import { isNil, reduce } from "lodash";

import * as models from "lib/model";
import { createDetailResponseReducer, createSimplePayloadReducer } from "lib/redux/factories";

import { ActionType } from "../actions";
import initialState, { initialTemplateAccountsState, initialTemplateSubAccountsState } from "../initialState";

import * as factories from "./factories";

const genericReducer = combineReducers({
  autoIndex: createSimplePayloadReducer<boolean>(ActionType.Template.SetAutoIndex, false),
  account: combineReducers({
    id: createSimplePayloadReducer<number | null>(ActionType.Template.Account.SetId, null),
    detail: createDetailResponseReducer<
      Model.TemplateAccount,
      Redux.ModelDetailResponseStore<Model.TemplateAccount>,
      Redux.Action
    >({
      Response: ActionType.Template.Account.Response,
      Loading: ActionType.Template.Account.Loading,
      Request: ActionType.Template.Account.Request,
      UpdateInState: ActionType.Template.Account.UpdateInState
    }),
    subaccounts: factories.createSubAccountsReducer<
      Modules.Budgeting.Template.SubAccountsStore,
      BudgetTable.TemplateSubAccountRow,
      Model.TemplateSubAccount,
      Model.TemplateGroup
    >(
      "Template",
      {
        TableChanged: ActionType.Template.Account.TableChanged,
        Response: ActionType.Template.Account.SubAccounts.Response,
        Request: ActionType.Template.Account.SubAccounts.Request,
        Loading: ActionType.Template.Account.SubAccounts.Loading,
        SetSearch: ActionType.Template.Account.SubAccounts.SetSearch,
        RemoveFromState: ActionType.Template.Account.SubAccounts.RemoveFromState,
        AddToState: ActionType.Template.Account.SubAccounts.AddToState,
        Select: ActionType.Template.Account.SubAccounts.Select,
        Deselect: ActionType.Template.Account.SubAccounts.Deselect,
        SelectAll: ActionType.Template.Account.SubAccounts.SelectAll,
        Deleting: ActionType.Template.Account.SubAccounts.Deleting,
        Creating: ActionType.Template.Account.SubAccounts.Creating,
        Updating: ActionType.Template.Account.SubAccounts.Updating,
        RemoveFromGroup: ActionType.Template.Account.SubAccounts.RemoveFromGroup,
        AddToGroup: ActionType.Template.Account.SubAccounts.AddToGroup,
        // NOTE: This will cause updates to both the Account and SubAccount level when
        // fringes change, even though only one level is visible at any given time.  We
        // should adjust this, so that it only updates the Account SubAccount(s) or the
        // SubAccount SubAccount(s) when Fringes change.
        Fringes: {
          UpdateInState: ActionType.Template.Fringes.UpdateInState
        },
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
      models.TemplateSubAccountRowManager,
      initialTemplateSubAccountsState
    )
  }),
  subaccount: combineReducers({
    id: createSimplePayloadReducer<number | null>(ActionType.Template.SubAccount.SetId, null),
    detail: createDetailResponseReducer<
      Model.TemplateSubAccount,
      Redux.ModelDetailResponseStore<Model.TemplateSubAccount>,
      Redux.Action
    >({
      Response: ActionType.Template.SubAccount.Response,
      Loading: ActionType.Template.SubAccount.Loading,
      Request: ActionType.Template.SubAccount.Request
    }),
    subaccounts: factories.createSubAccountsReducer<
      Modules.Budgeting.Template.SubAccountsStore,
      BudgetTable.TemplateSubAccountRow,
      Model.TemplateSubAccount,
      Model.TemplateGroup
    >(
      "Template",
      {
        TableChanged: ActionType.Template.SubAccount.TableChanged,
        Response: ActionType.Template.SubAccount.SubAccounts.Response,
        Request: ActionType.Template.SubAccount.SubAccounts.Request,
        Loading: ActionType.Template.SubAccount.SubAccounts.Loading,
        SetSearch: ActionType.Template.SubAccount.SubAccounts.SetSearch,
        RemoveFromState: ActionType.Template.SubAccount.SubAccounts.RemoveFromState,
        AddToState: ActionType.Template.SubAccount.SubAccounts.AddToState,
        Select: ActionType.Template.SubAccount.SubAccounts.Select,
        Deselect: ActionType.Template.SubAccount.SubAccounts.Deselect,
        SelectAll: ActionType.Template.SubAccount.SubAccounts.SelectAll,
        Deleting: ActionType.Template.SubAccount.SubAccounts.Deleting,
        Creating: ActionType.Template.SubAccount.SubAccounts.Creating,
        Updating: ActionType.Template.SubAccount.SubAccounts.Updating,
        RemoveFromGroup: ActionType.Template.SubAccount.SubAccounts.RemoveFromGroup,
        AddToGroup: ActionType.Template.SubAccount.SubAccounts.AddToGroup,
        // NOTE: This will cause updates to both the Account and SubAccount level when
        // fringes change, even though only one level is visible at any given time.  We
        // should adjust this, so that it only updates the Account SubAccount(s) or the
        // SubAccount SubAccount(s) when Fringes change.
        Fringes: {
          UpdateInState: ActionType.Template.Fringes.UpdateInState
        },
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
      models.TemplateSubAccountRowManager,
      initialTemplateSubAccountsState
    )
  }),
  accounts: factories.createAccountsReducer<
    Modules.Budgeting.Template.AccountsStore,
    BudgetTable.TemplateAccountRow,
    Model.TemplateAccount,
    Model.TemplateGroup
  >(
    {
      TableChanged: ActionType.Template.Accounts.TableChanged,
      Response: ActionType.Template.Accounts.Response,
      Request: ActionType.Template.Accounts.Request,
      Loading: ActionType.Template.Accounts.Loading,
      SetSearch: ActionType.Template.Accounts.SetSearch,
      RemoveFromState: ActionType.Template.Accounts.RemoveFromState,
      AddToState: ActionType.Template.Accounts.AddToState,
      Select: ActionType.Template.Accounts.Select,
      Deselect: ActionType.Template.Accounts.Deselect,
      SelectAll: ActionType.Template.Accounts.SelectAll,
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
    models.TemplateAccountRowManager,
    initialTemplateAccountsState
  ),
  fringes: factories.createFringesReducer("Template"),
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

  newState = genericReducer(newState, action);

  if (!isNil(action.payload)) {
    if (
      action.type === ActionType.Template.SubAccount.SubAccounts.RemoveFromState ||
      action.type === ActionType.Template.SubAccount.SubAccounts.AddToState
    ) {
      // Update the overall SubAccount based on the underlying SubAccount(s) present.
      const subAccounts: Model.TemplateSubAccount[] = newState.subaccount.subaccounts.data;
      let payload: Partial<Model.TemplateSubAccount> = {
        estimated: reduce(subAccounts, (sum: number, s: Model.TemplateSubAccount) => sum + (s.estimated || 0), 0)
      };
      if (!isNil(newState.subaccount.detail.data)) {
        if (!isNil(newState.subaccount.detail.data)) {
          newState = {
            ...newState,
            subaccount: {
              ...newState.subaccount,
              detail: {
                ...newState.subaccount.detail,
                data: { ...newState.subaccount.detail.data, ...payload }
              }
            }
          };
        }
      }
    } else if (
      action.type === ActionType.Template.Account.SubAccounts.RemoveFromState ||
      action.type === ActionType.Template.Account.SubAccounts.AddToState
    ) {
      // Update the overall Account based on the underlying SubAccount(s) present.
      const subAccounts: Model.TemplateSubAccount[] = newState.account.subaccounts.data;
      const estimated = reduce(subAccounts, (sum: number, s: Model.TemplateSubAccount) => sum + (s.estimated || 0), 0);
      if (!isNil(newState.account.detail.data)) {
        newState = {
          ...newState,
          account: {
            ...newState.account,
            detail: {
              ...newState.account.detail,
              data: { ...newState.account.detail.data, estimated }
            }
          }
        };
      }
    }
  }
  return newState;
};

export default rootReducer;
