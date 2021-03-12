import { initialDetailResponseState } from "store/initialState";

export const initialBudgetState: Redux.Budget.IBudgetStore = {
  id: null,
  detail: initialDetailResponseState
};

const initialState: Redux.Budget.IStore = {
  budget: initialBudgetState,
  ancestors: [],
  ancestorsLoading: false,
  commentsHistoryDrawerOpen: false
};

export default initialState;
