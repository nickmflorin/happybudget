import { createAction } from "@reduxjs/toolkit";

const ActionTypes = {
  User: {
    UpdateInState: "user.UpdateInState"
  },
  Contacts: {
    UpdateInState: "user.contacts.UpdateInState",
    RemoveFromState: "user.contacts.RemoveFromState",
    AddToState: "user.contacts.AddToState",
    SetSearch: "user.contacts.SetSearch"
  }
};

export const updateLoggedInUserAction = createAction<Model.User>(ActionTypes.User.UpdateInState);

export const removeContactFromStateAction = createAction<number>(ActionTypes.Contacts.RemoveFromState);
export const updateContactInStateAction = createAction<Redux.UpdateActionPayload<Model.Contact>>(
  ActionTypes.Contacts.UpdateInState
);
export const addContactToStateAction = createAction<Model.Contact>(ActionTypes.Contacts.AddToState);
export const setContactsSearchAction = createAction<string>(ActionTypes.Contacts.SetSearch);

export default ActionTypes;
