import { redux } from "lib";

export const ApplicationActionTypes = {
  SetDrawerVisibility: "SetDrawerVisibility",
  SetApplicationLoading: "SetApplicationLoading",
  User: {
    UpdateInState: "user.UpdateInState",
    Contacts: {
      Loading: "user.contacts.Loading",
      Response: "user.contacts.Response",
      Request: "user.contacts.Request",
      Select: "user.contacts.Select",
      SetSearch: "user.contacts.SetSearch",
      SetPage: "user.contacts.SetPage",
      SetPageSize: "user.contacts.SetPageSize",
      SetPageAndSize: "user.contacts.SetPageAndSize",
      UpdateInState: "user.contacts.UpdateInState",
      RemoveFromState: "user.contacts.RemoveFromState",
      AddToState: "user.contacts.AddToState",
      Delete: "user.contacts.Delete",
      DeleteMultiple: "user.contacts.DeleteMultiple",
      Deleting: "user.contacts.Deleting",
      Update: "user.contacts.Update",
      Updating: "user.contacts.Updating",
      Create: "user.contacts.Create",
      Creating: "user.contacts.Creating"
    }
  }
};

export const updateLoggedInUserAction = (user: Partial<Model.User>) => {
  return redux.actions.createAction<Partial<Model.User>>(ApplicationActionTypes.User.UpdateInState, user);
};
export const setDrawerVisibilityAction = redux.actions.simpleAction<boolean>(
  ApplicationActionTypes.SetDrawerVisibility
);
export const setApplicationLoadingAction = redux.actions.simpleAction<boolean>(
  ApplicationActionTypes.SetApplicationLoading
);

export const requestContactsAction = redux.actions.simpleAction<null>(ApplicationActionTypes.User.Contacts.Request);
export const loadingContactsAction = redux.actions.simpleAction<boolean>(ApplicationActionTypes.User.Contacts.Loading);
export const responseContactsAction = redux.actions.simpleAction<Http.ListResponse<Model.Contact>>(
  ApplicationActionTypes.User.Contacts.Response
);
export const selectContactsAction = redux.actions.simpleAction<number[]>(ApplicationActionTypes.User.Contacts.Select);
export const setContactsSearchAction = redux.actions.simpleAction<string>(
  ApplicationActionTypes.User.Contacts.SetSearch
);
export const setContactsPageSizeAction = redux.actions.simpleAction<number>(
  ApplicationActionTypes.User.Contacts.SetPageSize
);
export const setContactsPageAction = redux.actions.simpleAction<number>(ApplicationActionTypes.User.Contacts.SetPage);
export const setContactsPageAndSizeAction = redux.actions.simpleAction<PageAndSize>(
  ApplicationActionTypes.User.Contacts.SetPageAndSize
);
export const deleteContactAction = redux.actions.simpleAction<number>(ApplicationActionTypes.User.Contacts.Delete);
export const deleteContactsAction = redux.actions.simpleAction<number[]>(
  ApplicationActionTypes.User.Contacts.DeleteMultiple
);
export const deletingContactAction = redux.actions.simpleAction<Redux.ModelListActionPayload>(
  ApplicationActionTypes.User.Contacts.Deleting
);
export const removeContactFromStateAction = redux.actions.simpleAction<number>(
  ApplicationActionTypes.User.Contacts.RemoveFromState
);
export const updateContactInStateAction = redux.actions.simpleAction<Redux.UpdateModelActionPayload<Model.Contact>>(
  ApplicationActionTypes.User.Contacts.UpdateInState
);
export const addContactToStateAction = redux.actions.simpleAction<Model.Contact>(
  ApplicationActionTypes.User.Contacts.AddToState
);

// Not currently used, because the updateContact service is used directly in the
// modal for editing a contact, but we might use in the future.
export const updateContactAction = redux.actions.simpleAction<Redux.UpdateModelActionPayload<Model.Contact>>(
  ApplicationActionTypes.User.Contacts.Update
);
export const updatingContactAction = redux.actions.simpleAction<Redux.ModelListActionPayload>(
  ApplicationActionTypes.User.Contacts.Updating
);

// Not currently used, because the createContact service is used directly in the
// modal for creating a contact, but we might use in the future.
export const createContactAction = redux.actions.simpleAction<Http.ContactPayload>(
  ApplicationActionTypes.User.Contacts.Create
);
export const creatingContactAction = redux.actions.simpleAction<boolean>(ApplicationActionTypes.User.Contacts.Creating);
