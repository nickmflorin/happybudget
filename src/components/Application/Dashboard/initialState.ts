import { initialListResponseState } from "store/initialState";

const initialState: Redux.Dashboard.IStore = {
  budgets: {
    trash: initialListResponseState,
    active: initialListResponseState
  }
};

export default initialState;
