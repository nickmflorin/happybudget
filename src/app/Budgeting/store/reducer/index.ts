import { combineReducers } from "redux";
import { redux } from "lib";

import { ActionType } from "../actions";

import budgetRootReducer from "./budget";
import templateRootReducer from "./template";

const rootReducer: Redux.Reducer<Modules.Authenticated.Budget.Store> = combineReducers({
  budget: budgetRootReducer,
  template: templateRootReducer,
  fringeColors: redux.reducers.factories.createListResponseReducer<string>({
    Response: ActionType.FringeColors.Response,
    Loading: ActionType.FringeColors.Loading
  })
});

export default rootReducer;
