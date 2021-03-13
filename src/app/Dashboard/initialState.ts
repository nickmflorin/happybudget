import { initialListResponseState } from "store/initialState";

export const initialContactsState: Redux.Dashboard.IContactsStore = {
  ...initialListResponseState,
  deleting: [],
  updating: [],
  creating: false
};

const initialState: Redux.Dashboard.IStore = {
  contacts: initialContactsState,
  budgets: {
    trash: { ...initialListResponseState, deleting: [], restoring: [] },
    active: { ...initialListResponseState, deleting: [] }
  }
};

export default initialState;
