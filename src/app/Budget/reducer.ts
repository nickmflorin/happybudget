import { Reducer, combineReducers } from "redux";
import { createDetailResponseReducer, createSimpleBooleanReducer, createSimplePayloadReducer } from "store/factories";
import { ActionType } from "./actions";

const ancestorsReducer: Reducer<Redux.ListStore<IAncestor>, Redux.IAction<any>> = (
  state: Redux.ListStore<IAncestor> = [],
  action: Redux.IAction<any>
) => {
  let newState = [...state];
  if (action.type === ActionType.SetAncestors) {
    newState = action.payload;
  }
  return newState;
};

const rootReducer = combineReducers({
  ancestors: ancestorsReducer,
  commentsHistoryDrawerOpen: createSimpleBooleanReducer(ActionType.SetCommentsHistoryDrawerVisibility),
  budget: combineReducers({
    id: createSimplePayloadReducer<number | null>(ActionType.Budget.SetId, null),
    detail: createDetailResponseReducer<IBudget, Redux.IDetailResponseStore<IBudget>, Redux.IAction>({
      Response: ActionType.Budget.Response,
      Loading: ActionType.Budget.Loading,
      Request: ActionType.Budget.Request
    })
  })
});

export default rootReducer;
