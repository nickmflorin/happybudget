import { redux } from "lib";

const initialState: Modules.Dashboard.Store = {
  budgets: redux.initialState.initialAuthenticatedModelListResponseState,
  templates: redux.initialState.initialAuthenticatedModelListResponseState,
  community: redux.initialState.initialAuthenticatedModelListResponseState
};

export default initialState;
