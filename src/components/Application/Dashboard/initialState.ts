import { initialListResponseState } from "store/initialState";

const initialState: Redux.Dashboard.IStore = {
  budgets: {
    trash: { ...initialListResponseState, deleting: [], restoring: [] },
    active: { ...initialListResponseState, deleting: [] }
  }
};

export default initialState;
