import { combineReducers } from "redux";

import accountRootReducer from "./Account/reducer";
import accountsRootReducer from "./Accounts/reducer";
import subAccountRootReducer from "./SubAccount/reducer";

const rootReducer = combineReducers({
  accounts: accountsRootReducer,
  account: accountRootReducer,
  subaccount: subAccountRootReducer
});

export default rootReducer;
