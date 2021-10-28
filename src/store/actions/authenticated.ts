import { createAction } from "@reduxjs/toolkit";

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

export const updateLoggedInUserAction = createAction<Model.User>(ActionTypes.User.UpdateInState);

export const removeContactFromStateAction = createAction<number>(ActionTypes.Contacts.RemoveFromState);
export const updateContactInStateAction = createAction<Redux.UpdateActionPayload<Model.Contact>>(
  ActionTypes.Contacts.UpdateInState
);
export const addContactToStateAction = createAction<Model.Contact>(ActionTypes.Contacts.AddToState);
export const setContactsSearchAction = createAction<string>(ActionTypes.Contacts.SetSearch);

export const requestFilteredContactsAction = createAction<null>(ActionTypes.Contacts.RequestFiltered);
export const loadingFilteredContactsAction = createAction<boolean>(ActionTypes.Contacts.LoadingFiltered);
export const responseFilteredContactsAction = createAction<Http.ListResponse<Model.Contact>>(
  ActionTypes.Contacts.ResponseFiltered
);

export default ActionTypes;
