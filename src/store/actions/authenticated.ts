import { redux } from "lib";

const ActionTypes = {
  User: {
    UpdateInState: "user.UpdateInState"
  },
  Contacts: {
    UpdateInState: "user.contacts.UpdateInState",
    RemoveFromState: "user.contacts.RemoveFromState",
    AddToState: "user.contacts.AddToState",
    SetSearch: "user.contacts.SetSearch",
    RequestFiltered: "user.contacts.RequestFiltered",
    ResponseFiltered: "user.contacts.ResponseFiltered",
    LoadingFiltered: "user.contacts.LoadingFiltered"
  }
};

export const updateLoggedInUserAction = redux.actions.createAction<Model.User>(ActionTypes.User.UpdateInState);

export const removeContactFromStateAction = redux.actions.createAction<number>(ActionTypes.Contacts.RemoveFromState);
export const updateContactInStateAction = redux.actions.createAction<Redux.UpdateActionPayload<Model.Contact>>(
  ActionTypes.Contacts.UpdateInState
);
export const addContactToStateAction = redux.actions.createAction<Model.Contact>(ActionTypes.Contacts.AddToState);
export const setContactsSearchAction = redux.actions.createContextAction<string, Tables.ContactTableContext>(
  ActionTypes.Contacts.SetSearch
);

export const requestFilteredContactsAction = redux.actions.createAction<null>(ActionTypes.Contacts.RequestFiltered);
export const loadingFilteredContactsAction = redux.actions.createAction<boolean>(ActionTypes.Contacts.LoadingFiltered);
export const responseFilteredContactsAction = redux.actions.createAction<Http.ListResponse<Model.Contact>>(
  ActionTypes.Contacts.ResponseFiltered
);

export default ActionTypes;
