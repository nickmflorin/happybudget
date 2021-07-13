import { Reducer, combineReducers } from "redux";
import { isNil, find, filter } from "lodash";

import {
  createModelListResponseReducer,
  createDetailResponseReducer,
  createSimpleBooleanReducer,
  createSimplePayloadReducer,
  createCommentsListResponseReducer
} from "lib/redux/factories";
import { initialModelListResponseState } from "store/initialState";
import { warnInconsistentState } from "lib/redux/util";
import { replaceInArray } from "lib/util";
import { consolidateTableChange, mergeChangesWithModel } from "lib/model/util";
import * as typeguards from "lib/model/typeguards";

import { ActionType } from "../actions";
import initialState, {
  initialBudgetAccountState,
  initialBudgetSubAccountState,
  initialBudgetAccountsState
} from "../initialState";
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
      // This will eventually be removed when we let the reducer respond to
      // the RowAddEvent directly.
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
  let newState = listResponseReducer(state, action);
  if (action.type === ActionType.Budget.Actuals.TableChanged) {
    const event: Table.ChangeEvent<BudgetTable.ActualRow, Model.Actual> = action.payload;

    if (typeguards.isDataChangeEvent(event)) {
      const consolidated = consolidateTableChange(event.payload);

      // The consolidated changes should contain one change per actual, but
      // just in case we apply that grouping logic here.
      let changesPerActual: {
        [key: number]: { changes: Table.RowChange<BudgetTable.ActualRow, Model.Actual>[]; model: Model.Actual };
      } = {};
      for (let i = 0; i < consolidated.length; i++) {
        if (isNil(changesPerActual[consolidated[i].id])) {
          const actual: Model.Actual | undefined = find(newState.data, { id: consolidated[i].id } as any);
          if (isNil(actual)) {
            warnInconsistentState({
              action: action.type,
              reason: "Actual does not exist in state when it is expected to.",
              id: consolidated[i].id
            });
          } else {
            changesPerActual[consolidated[i].id] = { changes: [], model: actual };
          }
        }
        if (!isNil(changesPerActual[consolidated[i].id])) {
          changesPerActual[consolidated[i].id] = {
            ...changesPerActual[consolidated[i].id],
            changes: [...changesPerActual[consolidated[i].id].changes, consolidated[i]]
          };
        }
      }
      // For each of the SubAccount(s) that were changed, apply those changes to the current
      // SubAccount model in state.
      for (let k = 0; k < Object.keys(changesPerActual).length; k++) {
        const id = parseInt(Object.keys(changesPerActual)[k]);
        const changesObj = changesPerActual[id];
        let actual = changesObj.model;
        for (let j = 0; j < changesObj.changes.length; j++) {
          actual = mergeChangesWithModel(changesObj.model, changesObj.changes[j]);
        }
        newState = {
          ...newState,
          data: replaceInArray<Model.Actual>(newState.data, { id: actual.id }, actual)
        };
      }
    } else if (typeguards.isRowAddEvent(event)) {
      // Eventually, we will want to implement this - so we do not have to rely on waiting
      // for the response of the API request.
    } else if (typeguards.isRowDeleteEvent(event)) {
      const ids = Array.isArray(event.payload) ? event.payload : [event.payload];
      for (let i = 0; i < ids.length; i++) {
        newState = {
          ...newState,
          /* eslint-disable no-loop-func */
          data: filter(newState.data, (m: Model.Actual) => m.id !== ids[i]),
          count: newState.count - 1
        };
      }
    }
  }
  return newState;
};

const genericReducer = combineReducers({
  autoIndex: createSimplePayloadReducer<boolean>(ActionType.Budget.SetAutoIndex, false),
  commentsHistoryDrawerOpen: createSimpleBooleanReducer(ActionType.Budget.SetCommentsHistoryDrawerVisibility),
  account: factories.createAccountReducer<Modules.Budgeting.Budget.AccountStore>(
    {
      SetId: ActionType.Budget.Account.SetId,
      Response: ActionType.Budget.Account.Response,
      Loading: ActionType.Budget.Account.Loading,
      Request: ActionType.Budget.Account.Request,
      UpdateInState: ActionType.Budget.Account.UpdateInState,
      TableChanged: ActionType.Budget.Account.TableChanged,
      SubAccounts: {
        Response: ActionType.Budget.Account.SubAccounts.Response,
        Request: ActionType.Budget.Account.SubAccounts.Request,
        Loading: ActionType.Budget.Account.SubAccounts.Loading,
        SetSearch: ActionType.Budget.Account.SubAccounts.SetSearch,
        AddToState: ActionType.Budget.Account.SubAccounts.AddToState,
        Deleting: ActionType.Budget.Account.SubAccounts.Deleting,
        Creating: ActionType.Budget.Account.SubAccounts.Creating,
        Updating: ActionType.Budget.Account.SubAccounts.Updating,
        RemoveFromGroup: ActionType.Budget.Account.SubAccounts.RemoveFromGroup,
        AddToGroup: ActionType.Budget.Account.SubAccounts.AddToGroup,
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
      Fringes: {
        TableChanged: ActionType.Budget.Account.Fringes.TableChanged,
        Response: ActionType.Budget.Account.Fringes.Response,
        Request: ActionType.Budget.Account.Fringes.Request,
        Loading: ActionType.Budget.Account.Fringes.Loading,
        AddToState: ActionType.Budget.Account.Fringes.AddToState,
        SetSearch: ActionType.Budget.Account.Fringes.SetSearch,
        Deleting: ActionType.Budget.Account.Fringes.Deleting,
        Creating: ActionType.Budget.Account.Fringes.Creating,
        Updating: ActionType.Budget.Account.Fringes.Updating
      },
      Comments: {
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
      }
    },
    initialBudgetAccountState
  ),
  subaccount: factories.createSubAccountReducer<Modules.Budgeting.Budget.SubAccountStore>(
    {
      SetId: ActionType.Budget.SubAccount.SetId,
      Response: ActionType.Budget.SubAccount.Response,
      Loading: ActionType.Budget.SubAccount.Loading,
      Request: ActionType.Budget.SubAccount.Request,
      UpdateInState: ActionType.Budget.SubAccount.UpdateInState,
      TableChanged: ActionType.Budget.SubAccount.TableChanged,
      SubAccounts: {
        Response: ActionType.Budget.SubAccount.SubAccounts.Response,
        Request: ActionType.Budget.SubAccount.SubAccounts.Request,
        Loading: ActionType.Budget.SubAccount.SubAccounts.Loading,
        SetSearch: ActionType.Budget.SubAccount.SubAccounts.SetSearch,
        AddToState: ActionType.Budget.SubAccount.SubAccounts.AddToState,
        Deleting: ActionType.Budget.SubAccount.SubAccounts.Deleting,
        Creating: ActionType.Budget.SubAccount.SubAccounts.Creating,
        Updating: ActionType.Budget.SubAccount.SubAccounts.Updating,
        RemoveFromGroup: ActionType.Budget.SubAccount.SubAccounts.RemoveFromGroup,
        AddToGroup: ActionType.Budget.SubAccount.SubAccounts.AddToGroup,
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
      Fringes: {
        TableChanged: ActionType.Budget.SubAccount.Fringes.TableChanged,
        Response: ActionType.Budget.SubAccount.Fringes.Response,
        Request: ActionType.Budget.SubAccount.Fringes.Request,
        Loading: ActionType.Budget.SubAccount.Fringes.Loading,
        AddToState: ActionType.Budget.SubAccount.Fringes.AddToState,
        SetSearch: ActionType.Budget.SubAccount.Fringes.SetSearch,
        Deleting: ActionType.Budget.SubAccount.Fringes.Deleting,
        Creating: ActionType.Budget.SubAccount.Fringes.Creating,
        Updating: ActionType.Budget.SubAccount.Fringes.Updating
      },
      Comments: {
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
      }
    },
    initialBudgetSubAccountState
  ),
  actuals: actualsRootReducer,
  accounts: factories.createAccountsReducer<Modules.Budgeting.Budget.AccountsStore>(
    {
      TableChanged: ActionType.Budget.Accounts.TableChanged,
      Response: ActionType.Budget.Accounts.Response,
      Request: ActionType.Budget.Accounts.Request,
      Loading: ActionType.Budget.Accounts.Loading,
      SetSearch: ActionType.Budget.Accounts.SetSearch,
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
    initialBudgetAccountsState
  ),
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
  return genericReducer(newState, action);
};

export default rootReducer;
