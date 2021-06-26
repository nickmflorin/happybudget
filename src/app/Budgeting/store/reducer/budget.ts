import { Reducer, combineReducers } from "redux";
import { isNil, reduce } from "lodash";
import * as models from "lib/model";
import {
  createModelListResponseReducer,
  createDetailResponseReducer,
  createSimpleBooleanReducer,
  createSimplePayloadReducer,
  createCommentsListResponseReducer
} from "lib/redux/factories";
import { initialModelListResponseState } from "store/initialState";

import { ActionType } from "../actions";
import initialState, { initialBudgetAccountsState, initialBudgetSubAccountsState } from "../initialState";
import * as factories from "./factories";

const actualsRootReducer: Reducer<Redux.ModelListResponseStore<Model.Actual>, Redux.Action<any>> = (
  state: Redux.ModelListResponseStore<Model.Actual> = initialModelListResponseState,
  action: Redux.Action<any>
): Redux.ModelListResponseStore<Model.Actual> => {
  const listResponseReducer = createModelListResponseReducer<Model.Actual, Redux.ModelListResponseStore<Model.Actual>>(
    {
      Response: ActionType.Budget.Actuals.Response,
      Request: ActionType.Budget.Actuals.Request,
      Loading: ActionType.Budget.Actuals.Loading,
      SetSearch: ActionType.Budget.Actuals.SetSearch,
      UpdateInState: ActionType.Budget.Actuals.UpdateInState,
      RemoveFromState: ActionType.Budget.Actuals.RemoveFromState,
      AddToState: ActionType.Budget.Actuals.AddToState,
      Deleting: ActionType.Budget.Actuals.Deleting,
      Updating: ActionType.Budget.Actuals.Updating,
      Creating: ActionType.Budget.Actuals.Creating
    },
    {
      strictSelect: false,
      initialState: initialModelListResponseState
    }
  );
  return listResponseReducer(state, action);
};

const genericReducer = combineReducers({
  autoIndex: createSimplePayloadReducer<boolean>(ActionType.Budget.SetAutoIndex, false),
  commentsHistoryDrawerOpen: createSimpleBooleanReducer(ActionType.Budget.SetCommentsHistoryDrawerVisibility),
  account: combineReducers({
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
    subaccounts: factories.createSubAccountsReducer<
      Modules.Budgeting.Budget.SubAccountsStore,
      BudgetTable.BudgetSubAccountRow,
      Model.BudgetSubAccount,
      Model.BudgetGroup
    >(
      "Budget",
      {
        TableChanged: ActionType.Budget.Account.TableChanged,
        Response: ActionType.Budget.Account.SubAccounts.Response,
        Request: ActionType.Budget.Account.SubAccounts.Request,
        Loading: ActionType.Budget.Account.SubAccounts.Loading,
        SetSearch: ActionType.Budget.Account.SubAccounts.SetSearch,
        RemoveFromState: ActionType.Budget.Account.SubAccounts.RemoveFromState,
        AddToState: ActionType.Budget.Account.SubAccounts.AddToState,
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
      },
      models.BudgetSubAccountRowManager,
      initialBudgetSubAccountsState
    )
  }),
  subaccount: combineReducers({
    id: createSimplePayloadReducer<number | null>(ActionType.Budget.SubAccount.SetId, null),
    detail: createDetailResponseReducer<
      Model.BudgetSubAccount,
      Redux.ModelDetailResponseStore<Model.BudgetSubAccount>,
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
    subaccounts: factories.createSubAccountsReducer<
      Modules.Budgeting.Budget.SubAccountsStore,
      BudgetTable.BudgetSubAccountRow,
      Model.BudgetSubAccount,
      Model.BudgetGroup
    >(
      "Budget",
      {
        TableChanged: ActionType.Budget.SubAccount.TableChanged,
        Response: ActionType.Budget.SubAccount.SubAccounts.Response,
        Request: ActionType.Budget.SubAccount.SubAccounts.Request,
        Loading: ActionType.Budget.SubAccount.SubAccounts.Loading,
        SetSearch: ActionType.Budget.SubAccount.SubAccounts.SetSearch,
        RemoveFromState: ActionType.Budget.SubAccount.SubAccounts.RemoveFromState,
        AddToState: ActionType.Budget.SubAccount.SubAccounts.AddToState,
        Deleting: ActionType.Budget.SubAccount.SubAccounts.Deleting,
        Creating: ActionType.Budget.SubAccount.SubAccounts.Creating,
        Updating: ActionType.Budget.SubAccount.SubAccounts.Updating,
        RemoveFromGroup: ActionType.Budget.SubAccount.SubAccounts.RemoveFromGroup,
        AddToGroup: ActionType.Budget.SubAccount.SubAccounts.AddToGroup,
        // NOTE: This will cause updates to both the Account and SubAccount level when
        // fringes change, even though only one level is visible at any given time.  We
        // should adjust this, so that it only updates the Account SubAccount(s) or the
        // SubAccount SubAccount(s) when Fringes change.
        Fringes: {
          UpdateInState: ActionType.Budget.Fringes.UpdateInState
        },
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
        }
      },
      models.BudgetSubAccountRowManager,
      initialBudgetSubAccountsState
    )
  }),
  actuals: actualsRootReducer,
  accounts: factories.createAccountsReducer<
    Modules.Budgeting.Budget.AccountsStore,
    BudgetTable.BudgetAccountRow,
    Model.BudgetAccount,
    Model.BudgetGroup
  >(
    {
      TableChanged: ActionType.Budget.Accounts.TableChanged,
      Response: ActionType.Budget.Accounts.Response,
      Request: ActionType.Budget.Accounts.Request,
      Loading: ActionType.Budget.Accounts.Loading,
      SetSearch: ActionType.Budget.Accounts.SetSearch,
      RemoveFromState: ActionType.Budget.Accounts.RemoveFromState,
      AddToState: ActionType.Budget.Accounts.AddToState,
      Deleting: ActionType.Budget.Accounts.Deleting,
      Creating: ActionType.Budget.Accounts.Creating,
      Updating: ActionType.Budget.Accounts.Updating,
      RemoveFromGroup: ActionType.Budget.Accounts.RemoveFromGroup,
      AddToGroup: ActionType.Budget.Accounts.AddToGroup,
      History: {
        Response: ActionType.Budget.Accounts.History.Response,
        Request: ActionType.Budget.Accounts.History.Request,
        Loading: ActionType.Budget.Accounts.History.Loading
      },
      Groups: {
        Response: ActionType.Budget.Accounts.Groups.Response,
        Request: ActionType.Budget.Accounts.Groups.Request,
        Loading: ActionType.Budget.Accounts.Groups.Loading,
        RemoveFromState: ActionType.Budget.Accounts.Groups.RemoveFromState,
        UpdateInState: ActionType.Budget.Accounts.Groups.UpdateInState,
        AddToState: ActionType.Budget.Accounts.Groups.AddToState,
        Deleting: ActionType.Budget.Accounts.Groups.Deleting
      }
    },
    models.BudgetAccountRowManager,
    initialBudgetAccountsState
  ),
  fringes: factories.createFringesReducer("Budget"),
  budget: combineReducers({
    id: createSimplePayloadReducer<number | null>(ActionType.Budget.SetId, null),
    detail: createDetailResponseReducer<Model.Budget, Redux.ModelDetailResponseStore<Model.Budget>, Redux.Action>({
      Response: ActionType.Budget.Response,
      Loading: ActionType.Budget.Loading,
      Request: ActionType.Budget.Request
    }),
    comments: createCommentsListResponseReducer({
      Response: ActionType.Budget.Comments.Response,
      Request: ActionType.Budget.Comments.Request,
      Loading: ActionType.Budget.Comments.Loading,
      AddToState: ActionType.Budget.Comments.AddToState,
      RemoveFromState: ActionType.Budget.Comments.RemoveFromState,
      UpdateInState: ActionType.Budget.Comments.UpdateInState,
      Creating: ActionType.Budget.Comments.Creating,
      Deleting: ActionType.Budget.Comments.Deleting,
      Updating: ActionType.Budget.Comments.Updating,
      Replying: ActionType.Budget.Comments.Replying
    })
  }),
  subAccountsTree: createModelListResponseReducer<Model.SubAccountTreeNode>({
    Response: ActionType.Budget.SubAccountsTree.Response,
    Loading: ActionType.Budget.SubAccountsTree.Loading,
    SetSearch: ActionType.Budget.SubAccountsTree.SetSearch,
    RestoreSearchCache: ActionType.Budget.SubAccountsTree.RestoreSearchCache
  })
});

const rootReducer: Reducer<Modules.Budgeting.Budget.Store, Redux.Action<any>> = (
  state: Modules.Budgeting.Budget.Store = initialState.budget,
  action: Redux.Action<any>
): Modules.Budgeting.Budget.Store => {
  let newState = { ...state };

  if (action.type === ActionType.Budget.WipeState) {
    newState = initialState.budget;
  }

  newState = genericReducer(newState, action);

  if (!isNil(action.payload)) {
    if (
      action.type === ActionType.Budget.SubAccount.SubAccounts.RemoveFromState ||
      action.type === ActionType.Budget.SubAccount.SubAccounts.AddToState
    ) {
      // Update the overall SubAccount based on the underlying SubAccount(s) present.
      const subAccounts: Model.BudgetSubAccount[] = newState.subaccount.subaccounts.data;
      // Right now, the backend is configured such that the Actual value for the overall SubAccount is
      // determined from the Actual values tied to that SubAccount, not the underlying SubAccount(s).
      // If that logic changes in the backend, we need to also make that adjustment here.
      let payload: Partial<Model.BudgetSubAccount> = {
        estimated: reduce(subAccounts, (sum: number, s: Model.BudgetSubAccount) => sum + (s.estimated || 0), 0)
      };
      if (!isNil(newState.subaccount.detail.data)) {
        if (!isNil(newState.subaccount.detail.data.actual) && !isNil(payload.estimated)) {
          payload = { ...payload, variance: payload.estimated - newState.subaccount.detail.data.actual };
        }
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
      action.type === ActionType.Budget.Account.SubAccounts.RemoveFromState ||
      action.type === ActionType.Budget.Account.SubAccounts.AddToState
    ) {
      // Update the overall Account based on the underlying SubAccount(s) present.
      const subAccounts: Model.BudgetSubAccount[] = newState.account.subaccounts.data;
      // Right now, the backend is configured such that the Actual value for the overall Account is
      // determined from the Actual values of the underlying SubAccount(s).  If that logic changes
      // in the backend, we need to also make that adjustment here.
      const actual = reduce(subAccounts, (sum: number, s: Model.BudgetSubAccount) => sum + (s.actual || 0), 0);
      const estimated = reduce(subAccounts, (sum: number, s: Model.BudgetSubAccount) => sum + (s.estimated || 0), 0);
      if (!isNil(newState.account.detail.data)) {
        newState = {
          ...newState,
          account: {
            ...newState.account,
            detail: {
              ...newState.account.detail,
              data: { ...newState.account.detail.data, actual, estimated, variance: estimated - actual }
            }
          }
        };
      }
    }
  }
  return newState;
};

export default rootReducer;
