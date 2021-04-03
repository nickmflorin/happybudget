import { combineReducers } from "redux";
import {
  createListResponseReducer,
  createDetailResponseReducer,
  createSimpleBooleanReducer,
  createSimplePayloadReducer,
  createCommentsListResponseReducer
} from "store/factories";

import { ActionType } from "./actions";

import accountRootReducer from "./Account/reducer";
import accountsRootReducer from "./Accounts/reducer";
import actualsRootReducer from "./Actuals/reducer";
import subAccountRootReducer from "./SubAccount/reducer";

const rootReducer = combineReducers({
  instance: createSimplePayloadReducer<IAccount | ISubAccount | null>(ActionType.SetInstance, null),
  commentsHistoryDrawerOpen: createSimpleBooleanReducer(ActionType.SetCommentsHistoryDrawerVisibility),
  account: accountRootReducer,
  subaccount: subAccountRootReducer,
  actuals: actualsRootReducer,
  accounts: accountsRootReducer,
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
      Request: ActionType.BudgetItems.Request,
      Loading: ActionType.BudgetItems.Loading
    },
    { referenceEntity: "budget item" }
  ),
  budgetItemsTree: createListResponseReducer<IBudgetItemNode>(
    {
      Response: ActionType.BudgetItemsTree.Response,
      Request: ActionType.BudgetItemsTree.Request,
      Loading: ActionType.BudgetItemsTree.Loading
    },
    { referenceEntity: "budget item tree node" }
  )
});

export default rootReducer;
