import initialAccountState from "./Account/initialState";
import initialBudgetState from "./Budget/initialState";
import initialSubAccountState from "./SubAccount/initialState";

const initialState: Redux.Calculator.IStore = {
  subaccount: initialSubAccountState,
  account: initialAccountState,
  budget: initialBudgetState
};

export default initialState;
