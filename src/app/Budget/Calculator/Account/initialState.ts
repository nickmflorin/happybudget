import {
  initialDetailResponseState,
  initialListResponseState,
  initialCommentsListResponseState
} from "store/initialState";

export const initialSubAccountGroupsState: Redux.Calculator.ISubAccountGroupsStore = {
  deleting: []
};

export const initialSubAccountsState: Redux.Calculator.ISubAccountsStore = {
  placeholders: [],
  deleting: [],
  updating: [],
  creating: false,
  history: initialListResponseState,
  groups: initialSubAccountGroupsState,
  ...initialListResponseState
};

const initialState: Redux.Calculator.IAccountStore = {
  id: null,
  detail: initialDetailResponseState,
  subaccounts: initialSubAccountsState,
  comments: initialCommentsListResponseState
};

export default initialState;
