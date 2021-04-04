import { Reducer, combineReducers } from "redux";
import { map, isNil, find, filter, reduce } from "lodash";
import { fringeValue } from "model/util";
import {
  createListResponseReducer,
  createDetailResponseReducer,
  createSimpleBooleanReducer,
  createSimplePayloadReducer,
  createCommentsListResponseReducer
} from "store/factories";
import { replaceInArray } from "util/arrays";

import { ActionType } from "./actions";
import initialState from "./initialState";

import accountRootReducer from "./Account/reducer";
import accountsRootReducer from "./Accounts/reducer";
import actualsRootReducer from "./Actuals/reducer";
import fringesRootReducer from "./Fringes/reducer";
import subAccountRootReducer from "./SubAccount/reducer";

const genericReducer = combineReducers({
  instance: createSimplePayloadReducer<IAccount | ISubAccount | null>(ActionType.SetInstance, null),
  commentsHistoryDrawerOpen: createSimpleBooleanReducer(ActionType.SetCommentsHistoryDrawerVisibility),
  account: accountRootReducer,
  subaccount: subAccountRootReducer,
  actuals: actualsRootReducer,
  accounts: accountsRootReducer,
  fringes: fringesRootReducer,
  budget: combineReducers({
    id: createSimplePayloadReducer<number | null>(ActionType.Budget.SetId, null),
    detail: createDetailResponseReducer<IBudget, Redux.IDetailResponseStore<IBudget>, Redux.IAction>({
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
  budgetItems: createListResponseReducer<IBudgetItem>(
    {
      Response: ActionType.BudgetItems.Response,
      Loading: ActionType.BudgetItems.Loading
    },
    { referenceEntity: "budget item" }
  ),
  budgetItemsTree: createListResponseReducer<IBudgetItemNode>(
    {
      Response: ActionType.BudgetItemsTree.Response,
      Loading: ActionType.BudgetItemsTree.Loading
    },
    { referenceEntity: "budget item tree node" }
  )
});

const rootReducer: Reducer<Redux.Budget.IStore> = (
  state: Redux.Budget.IStore = initialState,
  action: Redux.IAction<any>
): Redux.Budget.IStore => {
  let newState = genericReducer(state, action);

  const recalculateSubAccountFromFringes = (subAccount: ISubAccount): ISubAccount => {
    if (!isNil(subAccount.estimated)) {
      const fringes: IFringe[] = filter(
        map(subAccount.fringes, (id: number) => {
          const fringe: IFringe | undefined = find(newState.fringes.data, { id });
          if (!isNil(fringe)) {
            return fringe;
          } else {
            /* eslint-disable no-console */
            console.error(
              `Inconsistent State! Inconsistent state noticed when updating sub-account in state...
            The fringe ${id} for sub-account ${subAccount.id} does not exist in state when it
            is expected to.`
            );
            return null;
          }
        }),
        (fringe: IFringe | null) => fringe !== null
      ) as IFringe[];
      return { ...subAccount, estimated: fringeValue(subAccount.estimated, fringes) };
    } else {
      return subAccount;
    }
  };

  if (!isNil(action.payload)) {
    if (
      action.type === ActionType.SubAccount.SubAccounts.UpdateInState ||
      action.type === ActionType.SubAccount.SubAccounts.RemoveFromState ||
      action.type === ActionType.SubAccount.SubAccounts.AddToState ||
      action.type === ActionType.SubAccount.SubAccounts.Placeholders.UpdateInState
    ) {
      if (action.type === ActionType.SubAccount.SubAccounts.UpdateInState) {
        // Recalculate the estimated value of the SubAccount based on the fringes that it is
        // currently associated with after the update.
        const subAccount: ISubAccount | undefined = find(newState.subaccount.subaccounts.data, {
          id: action.payload.id
        });
        if (isNil(subAccount)) {
          /* eslint-disable no-console */
          console.error(
            `Inconsistent State: Inconsistent state noticed when updating sub-account in state. The
            sub-account with ID ${action.payload.id} does not exist in state when it is expected to.`
          );
        } else if (subAccount.estimated !== null) {
          newState = {
            ...newState,
            subaccount: {
              ...newState.subaccount,
              subaccounts: {
                ...newState.subaccount.subaccounts,
                data: replaceInArray<ISubAccount>(
                  newState.subaccount.subaccounts.data,
                  { id: subAccount.id },
                  recalculateSubAccountFromFringes(subAccount)
                )
              }
            }
          };
        }
      }
      // Update the overall SubAccount based on the underlying SubAccount(s) present and any potential
      // placeholders present.
      const subAccounts: ISubAccount[] = newState.subaccount.subaccounts.data;
      const placeholders: Table.SubAccountRow[] = newState.subaccount.subaccounts.placeholders;
      // Right now, the backend is configured such that the Actual value for the overall SubAccount is
      // determined from the Actual values tied to that SubAccount, not the underlying SubAccount(s).
      // If that logic changes in the backend, we need to also make that adjustment here.
      let payload: Partial<ISubAccount> = {
        estimated:
          reduce(subAccounts, (sum: number, s: ISubAccount) => sum + (s.estimated || 0), 0) +
          reduce(placeholders, (sum: number, s: Table.SubAccountRow) => sum + (s.estimated || 0), 0)
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
      action.type === ActionType.Account.SubAccounts.UpdateInState ||
      action.type === ActionType.Account.SubAccounts.RemoveFromState ||
      action.type === ActionType.Account.SubAccounts.AddToState ||
      action.type === ActionType.Account.SubAccounts.Placeholders.UpdateInState
    ) {
      if (action.type === ActionType.Account.SubAccounts.UpdateInState) {
        // Recalculate the estimated value of the SubAccount based on the fringes that it is
        // currently associated with after the update.
        const subAccount: ISubAccount | undefined = find(newState.account.subaccounts.data, { id: action.payload.id });
        if (isNil(subAccount)) {
          /* eslint-disable no-console */
          console.error(
            `Inconsistent State: Inconsistent state noticed when updating sub-account in state. The
              sub-account with ID ${action.payload.id} does not exist in state when it is expected to.`
          );
        } else if (subAccount.estimated !== null) {
          newState = {
            ...newState,
            account: {
              ...newState.account,
              subaccounts: {
                ...newState.account.subaccounts,
                data: replaceInArray<ISubAccount>(
                  newState.account.subaccounts.data,
                  { id: subAccount.id },
                  recalculateSubAccountFromFringes(subAccount)
                )
              }
            }
          };
        }
      }
      // Update the overall Account based on the underlying SubAccount(s) present and any potential
      // placeholders present.
      const subAccounts: ISubAccount[] = newState.account.subaccounts.data;
      const placeholders: Table.SubAccountRow[] = newState.account.subaccounts.placeholders;
      // Right now, the backend is configured such that the Actual value for the overall Account is
      // determined from the Actual values of the underlying SubAccount(s).  If that logic changes
      // in the backend, we need to also make that adjustment here.
      const actual =
        reduce(subAccounts, (sum: number, s: ISubAccount) => sum + (s.actual || 0), 0) +
        reduce(placeholders, (sum: number, s: Table.SubAccountRow) => sum + (s.actual || 0), 0);
      const estimated =
        reduce(subAccounts, (sum: number, s: ISubAccount) => sum + (s.estimated || 0), 0) +
        reduce(placeholders, (sum: number, s: Table.SubAccountRow) => sum + (s.estimated || 0), 0);
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
