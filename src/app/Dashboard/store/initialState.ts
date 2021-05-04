import { initialModelListResponseState } from "store/initialState";

const initialState: Redux.Dashboard.Store = {
  contacts: initialModelListResponseState,
  budgets: initialModelListResponseState,
  templates: {
    ...initialModelListResponseState,
    duplicating: [],
    moving: []
  },
  community: {
    ...initialModelListResponseState,
    duplicating: []
  }
};

export default initialState;
