import initialAccountState from "./Account/initialState";
import initialAccountsState from "./Accounts/initialState";
import initialSubAccountState from "./SubAccount/initialState";

const initialState: Redux.Calculator.IStore = {
  subaccount: initialSubAccountState,
  account: initialAccountState,
  accounts: initialAccountsState
};

export default initialState;
