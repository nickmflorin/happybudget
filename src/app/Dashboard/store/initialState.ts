import { redux } from "lib";

const initialState: Modules.Authenticated.Dashboard.StoreObj = {
  budgets: redux.initialState.initialModelListResponseState,
  templates: redux.initialState.initialModelListResponseState,
  community: redux.initialState.initialModelListResponseState
};

export default initialState;
