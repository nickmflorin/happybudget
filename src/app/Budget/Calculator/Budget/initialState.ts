import { initialListResponseState, initialCommentsListResponseState } from "store/initialState";

export const initialAccountsState: Redux.Calculator.IAccountsStore = {
  table: [],
  deleting: [],
  updating: [],
  creating: false,
  history: initialListResponseState,
  ...initialListResponseState
};

const initialState: Redux.Calculator.IBudgetStore = {
  accounts: initialAccountsState,
  comments: initialCommentsListResponseState
};

export default initialState;
