import { redux } from "lib";

const initialState: Modules.Dashboard.Store = {
  budgets: redux.initialState.initialModelListResponseState,
  templates: {
    ...redux.initialState.initialModelListResponseState,
    duplicating: [],
    moving: []
  },
  community: {
    ...redux.initialState.initialModelListResponseState,
    duplicating: [],
    hiding: [],
    showing: []
  }
};

export default initialState;
