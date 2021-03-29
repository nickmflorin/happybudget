import {
  initialListResponseState,
  initialDetailResponseState,
  initialCommentsListResponseState
} from "store/initialState";

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

const initialState: Redux.Calculator.IAccountStore = {
  id: null,
  detail: initialDetailResponseState,
  subaccounts: initialSubAccountsState,
  comments: initialCommentsListResponseState
};

export default initialState;
