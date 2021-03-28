import { initialListResponseState, initialCommentsListResponseState } from "store/initialState";

export const initialSubAccountGroupsState: Redux.Calculator.ISubAccountGroupsStore = {
  deleting: []
};

export const initialAccountsState: Redux.Calculator.IAccountsStore = {
  placeholders: [],
  deleting: [],
  updating: [],
  creating: false,
  history: initialListResponseState,
  groups: initialSubAccountGroupsState,
  ...initialListResponseState
};

const initialState: Redux.Calculator.IBudgetStore = {
  accounts: initialAccountsState,
  comments: initialCommentsListResponseState
};

export default initialState;
