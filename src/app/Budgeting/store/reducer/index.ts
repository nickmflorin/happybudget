import { Reducer, combineReducers } from "redux";
import { createListResponseReducer, createModelListResponseReducer } from "lib/redux/factories";

import { ActionType } from "../actions";

import budgetRootReducer from "./budget";
import templateRootReducer from "./template";

const rootReducer: Reducer<Redux.Budgeting.Store, Redux.Action<any>> = combineReducers({
  budget: budgetRootReducer,
  template: templateRootReducer,
  fringeColors: createListResponseReducer<string>({
    Response: ActionType.FringeColors.Response,
    Loading: ActionType.FringeColors.Loading
  }),
  subaccountUnits: createModelListResponseReducer<Model.Tag>({
    Response: ActionType.SubAccountUnits.Response,
    Loading: ActionType.SubAccountUnits.Loading
  })
});

export default rootReducer;
