import { initialListResponseState } from "store/initialState";

export const initialActualsState: Redux.Actuals.IActualsStore = {
  placeholders: [],
  deleting: [],
  updating: [],
  creating: false,
  ...initialListResponseState
};

const initialState: Redux.Actuals.IStore = {
  actuals: initialActualsState,
  budgetItems: initialListResponseState,
  budgetItemsTree: initialListResponseState
};

export default initialState;
