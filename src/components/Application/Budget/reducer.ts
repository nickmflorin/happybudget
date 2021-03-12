import { Reducer, combineReducers } from "redux";
import {
  createDetailResponseReducer,
  createSimpleBooleanReducer,
  createSimplePayloadReducer
} from "store/reducerFactories";
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
  ancestorsLoading: createSimpleBooleanReducer(ActionType.SetAncestorsLoading),
  commentsHistoryDrawerOpen: createSimpleBooleanReducer(ActionType.SetCommentsHistoryDrawerVisibility),
  budget: combineReducers({
    id: createSimplePayloadReducer(ActionType.Budget.SetId),
    detail: createDetailResponseReducer<IBudget, Redux.IDetailResponseStore<IBudget>, Redux.IAction>({
      Response: ActionType.Budget.Response,
      Loading: ActionType.Budget.Loading,
      Request: ActionType.Budget.Request
    })
  })
});

export default rootReducer;
