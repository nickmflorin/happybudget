import { initialListResponseState } from "store/initialState";

const initialState: Redux.Dashboard.Store = {
  contacts: initialListResponseState,
  budgets: initialListResponseState,
  templates: initialListResponseState
};

export default initialState;
