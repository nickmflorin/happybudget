import { combineReducers } from "redux";

import accountRootReducer from "./Account/reducer";
import budgetRootReducer from "./Budget/reducer";
import subAccountRootReducer from "./SubAccount/reducer";

const rootReducer = combineReducers({
  budget: budgetRootReducer,
  account: accountRootReducer,
  subaccount: subAccountRootReducer
});

export default rootReducer;
