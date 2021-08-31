import { createAction } from "@reduxjs/toolkit";

const ActionTypes = {
  User: {
    UpdateInState: "user.UpdateInState"
  },
  Contacts: {
    UpdateInState: "user.contacts.UpdateInState",
    RemoveFromState: "user.contacts.RemoveFromState",
    AddToState: "user.contacts.AddToState",
    Deleting: "user.contacts.Deleting",
    Updating: "user.contacts.Updating",
    Creating: "user.contacts.Creating"
  }
};

export const updateLoggedInUserAction = createAction<Model.User>(ActionTypes.User.UpdateInState);
export const deletingContactAction = createAction<Redux.ModelListActionPayload>(ActionTypes.Contacts.Deleting);
export const removeContactFromStateAction = createAction<ID>(ActionTypes.Contacts.RemoveFromState);
export const updateContactInStateAction = createAction<Redux.UpdateActionPayload<Model.Contact>>(
  ActionTypes.Contacts.UpdateInState
);
export const addContactToStateAction = createAction<Model.Contact>(ActionTypes.Contacts.AddToState);
export const updatingContactAction = createAction<Redux.ModelListActionPayload>(ActionTypes.Contacts.Updating);
export const creatingContactAction = createAction<boolean>(ActionTypes.Contacts.Creating);

export default ActionTypes;
