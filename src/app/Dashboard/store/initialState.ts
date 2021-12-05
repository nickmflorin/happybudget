import { redux } from "lib";

const initialState: Modules.Dashboard.Store = {
  budgets: redux.initialState.initialAuthenticatedModelListResponseState,
  templates: redux.initialState.initialAuthenticatedModelListResponseState,
  community: redux.initialState.initialAuthenticatedModelListResponseState,
  contacts: redux.initialState.initialTableState
};

export default initialState;
