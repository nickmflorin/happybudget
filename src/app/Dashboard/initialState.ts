import { initialListResponseState } from "store/initialState";

const initialState: Redux.Dashboard.Store = {
  contacts: initialListResponseState,
  budgets: {
    trash: { ...initialListResponseState, restoring: [], permanentlyDeleting: [] },
    active: { ...initialListResponseState }
  }
};

export default initialState;
