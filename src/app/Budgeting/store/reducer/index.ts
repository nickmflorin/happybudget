import { Reducer, combineReducers } from "redux";
import { redux } from "lib";

import { ActionType } from "../actions";

import budgetRootReducer from "./budget";
import templateRootReducer from "./template";

const rootReducer: Reducer<Modules.Budget.Store, Redux.Action<any>> = combineReducers({
  budget: budgetRootReducer,
  template: templateRootReducer,
  fringeColors: redux.factories.createListResponseReducer<string>({
    Response: ActionType.FringeColors.Response,
    Loading: ActionType.FringeColors.Loading
  }),
  subaccountUnits: redux.factories.createModelListResponseReducer<Model.Tag>({
    Response: ActionType.SubAccountUnits.Response,
    Loading: ActionType.SubAccountUnits.Loading
  })
});

export default rootReducer;
