import { initialModelListResponseState } from "store/initialState";

const initialState: Modules.Dashboard.Store = {
  budgets: initialModelListResponseState,
  templates: {
    ...initialModelListResponseState,
    duplicating: [],
    moving: []
  },
  community: {
    ...initialModelListResponseState,
    duplicating: [],
    hiding: [],
    showing: []
  }
};

export default initialState;
