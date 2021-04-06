import { initialListResponseState } from "store/initialState";

const initialState: Redux.Dashboard.IStore = {
  contacts: initialListResponseState,
  budgets: {
    trash: { ...initialListResponseState, restoring: [], permanentlyDeleting: [] },
    active: { ...initialListResponseState }
  }
};

export default initialState;
