import { initialListResponseState, initialTableState, initialCommentsListResponseState } from "store/initialState";

export const initialSubAccountGroupsState: Redux.Calculator.ISubAccountGroupsStore = {
  deleting: []
};

export const initialSubAccountsState: Redux.Calculator.ISubAccountsStore = {
  table: initialTableState,
  deleting: [],
  updating: [],
  creating: false,
  history: initialListResponseState,
  groups: initialSubAccountGroupsState
};

const initialState: Redux.Calculator.IAccountsStore = {
  table: initialTableState,
  deleting: [],
  updating: [],
  creating: false,
  comments: initialCommentsListResponseState,
  history: initialListResponseState
};

export default initialState;
