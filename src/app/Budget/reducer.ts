import { Reducer, combineReducers } from "redux";
import { map, isNil, find, filter } from "lodash";
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

  // NOTE: In order to do recalculation of a SubAccount with it's fringes, we need access to the
  // Fringes state, which is at the top level of the Redux state tree.  Thus, we have to do this
  // manipulation in the top level of the Reducer tree.
  if (!isNil(action.payload)) {
    if (action.type === ActionType.SubAccount.SubAccounts.UpdateInState) {
      const subAccount: ISubAccount | undefined = find(newState.subaccount.subaccounts.data, { id: action.payload.id });
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
    } else if (action.type === ActionType.Account.SubAccounts.UpdateInState) {
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
  }
  return newState;
};

export default rootReducer;
