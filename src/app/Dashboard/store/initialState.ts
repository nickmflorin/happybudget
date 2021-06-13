import { initialModelListResponseState } from "store/initialState";

const initialState: Modules.Dashboard.Store = {
  contacts: initialModelListResponseState,
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
