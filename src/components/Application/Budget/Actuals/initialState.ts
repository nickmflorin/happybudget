import { initialTableState } from "store/initialState";

const initialState: Redux.Actuals.IStore = {
  table: initialTableState,
  deleting: [],
  updating: [],
  creating: false
};

export default initialState;
