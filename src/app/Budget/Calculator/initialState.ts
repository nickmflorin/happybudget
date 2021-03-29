import { initialListResponseState } from "store/initialState";

import initialAccountState from "./Account/initialState";
import initialBudgetState from "./Budget/initialState";
import initialSubAccountState from "./SubAccount/initialState";

export const initialSubAccountGroupsState: Redux.Calculator.IGroupsStore<ISimpleSubAccount> = {
  deleting: [],
  ...initialListResponseState
};

export const initialSubAccountsState: Redux.Calculator.ISubAccountsStore<Table.SubAccountRow> = {
  placeholders: [],
  deleting: [],
  updating: [],
  creating: false,
  history: initialListResponseState,
  groups: initialSubAccountGroupsState,
  ...initialListResponseState
};

const initialState: Redux.Calculator.IStore = {
  subaccount: initialSubAccountState,
  account: initialAccountState,
  budget: initialBudgetState
};

export default initialState;
