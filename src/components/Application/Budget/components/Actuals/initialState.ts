import { initialListResponseState, initialTableState } from "store/initialState";

const initialState: Redux.Actuals.IStore = {
  budgetItems: initialListResponseState,
  table: initialTableState,
  deleting: [],
  updating: [],
  creating: false
};

export default initialState;
