import { Reducer, combineReducers } from "redux";
import { isNil, reduce } from "lodash";
import {
  createListResponseReducer,
  createDetailResponseReducer,
  createSimpleBooleanReducer,
  createSimplePayloadReducer,
  createCommentsListResponseReducer
} from "lib/redux/factories";

import { ActionType } from "../../actions";
import initialState from "../../initialState";

import accountRootReducer from "./account";
import accountsRootReducer from "./accounts";
import actualsRootReducer from "./actuals";
import createFringesReducer from "../fringes";
import subAccountRootReducer from "./subAccount";

const genericReducer = combineReducers({
  instance: createSimplePayloadReducer<Model.BudgetAccount | Model.BudgetSubAccount | null>(
    ActionType.Budget.SetInstance,
    null
  ),
  commentsHistoryDrawerOpen: createSimpleBooleanReducer(ActionType.Budget.SetCommentsHistoryDrawerVisibility),
  account: accountRootReducer,
  subaccount: subAccountRootReducer,
  actuals: actualsRootReducer,
  accounts: accountsRootReducer,
  fringes: createFringesReducer("Budget"),
  budget: combineReducers({
    id: createSimplePayloadReducer<number | null>(ActionType.Budget.SetId, null),
    detail: createDetailResponseReducer<Model.Budget, Redux.DetailResponseStore<Model.Budget>, Redux.Action>({
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
  budgetItems: createListResponseReducer<Model.BudgetLineItem>({
    Response: ActionType.Budget.BudgetItems.Response,
    Loading: ActionType.Budget.BudgetItems.Loading
  }),
  budgetItemsTree: createListResponseReducer<Model.AccountTreeNode>({
    Response: ActionType.Budget.BudgetItemsTree.Response,
    Loading: ActionType.Budget.BudgetItemsTree.Loading
  })
});

const rootReducer: Reducer<Redux.Budget.Store, Redux.Action<any>> = (
  state: Redux.Budget.Store = initialState.budget,
  action: Redux.Action<any>
): Redux.Budget.Store => {
  let newState = genericReducer(state, action);

  if (!isNil(action.payload)) {
    if (
      action.type === ActionType.Budget.SubAccount.SubAccounts.UpdateInState ||
      action.type === ActionType.Budget.SubAccount.SubAccounts.RemoveFromState ||
      action.type === ActionType.Budget.SubAccount.SubAccounts.AddToState ||
      action.type === ActionType.Budget.SubAccount.SubAccounts.Placeholders.UpdateInState
    ) {
      // Update the overall SubAccount based on the underlying SubAccount(s) present and any potential
      // placeholders present.
      const subAccounts: Model.BudgetSubAccount[] = newState.subaccount.subaccounts.data;
      const placeholders: Table.BudgetSubAccountRow[] = newState.subaccount.subaccounts.placeholders;
      // Right now, the backend is configured such that the Actual value for the overall SubAccount is
      // determined from the Actual values tied to that SubAccount, not the underlying SubAccount(s).
      // If that logic changes in the backend, we need to also make that adjustment here.
      let payload: Partial<Model.BudgetSubAccount> = {
        estimated:
          reduce(subAccounts, (sum: number, s: Model.BudgetSubAccount) => sum + (s.estimated || 0), 0) +
          reduce(placeholders, (sum: number, s: Table.BudgetSubAccountRow) => sum + (s.estimated || 0), 0)
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
      action.type === ActionType.Budget.Account.SubAccounts.UpdateInState ||
      action.type === ActionType.Budget.Account.SubAccounts.RemoveFromState ||
      action.type === ActionType.Budget.Account.SubAccounts.AddToState ||
      action.type === ActionType.Budget.Account.SubAccounts.Placeholders.UpdateInState
    ) {
      // Update the overall Account based on the underlying SubAccount(s) present and any potential
      // placeholders present.
      const subAccounts: Model.BudgetSubAccount[] = newState.account.subaccounts.data;
      const placeholders: Table.BudgetSubAccountRow[] = newState.account.subaccounts.placeholders;
      // Right now, the backend is configured such that the Actual value for the overall Account is
      // determined from the Actual values of the underlying SubAccount(s).  If that logic changes
      // in the backend, we need to also make that adjustment here.
      const actual =
        reduce(subAccounts, (sum: number, s: Model.BudgetSubAccount) => sum + (s.actual || 0), 0) +
        reduce(placeholders, (sum: number, s: Table.BudgetSubAccountRow) => sum + (s.actual || 0), 0);
      const estimated =
        reduce(subAccounts, (sum: number, s: Model.BudgetSubAccount) => sum + (s.estimated || 0), 0) +
        reduce(placeholders, (sum: number, s: Table.BudgetSubAccountRow) => sum + (s.estimated || 0), 0);
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
