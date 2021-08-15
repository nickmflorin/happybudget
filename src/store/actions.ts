import { redux } from "lib";

export const ApplicationActionTypes = {
  SetDrawerVisibility: "SetDrawerVisibility",
  SetApplicationLoading: "SetApplicationLoading",
  User: {
    UpdateInState: "user.UpdateInState",
    Contacts: {
      TableChanged: "user.contacts.TableChanged",
      Loading: "user.contacts.Loading",
      Response: "user.contacts.Response",
      Request: "user.contacts.Request",
      SetSearch: "user.contacts.SetSearch",
      UpdateInState: "user.contacts.UpdateInState",
      RemoveFromState: "user.contacts.RemoveFromState",
      AddToState: "user.contacts.AddToState",
      Deleting: "user.contacts.Deleting",
      Updating: "user.contacts.Updating",
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
export const handleContactsTableChangeEventAction = redux.actions.simpleAction<
  Table.ChangeEvent<Tables.ContactRow, Model.Contact>
>(ApplicationActionTypes.User.Contacts.TableChanged);
export const setContactsSearchAction = redux.actions.simpleAction<string>(
  ApplicationActionTypes.User.Contacts.SetSearch
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
export const updatingContactAction = redux.actions.simpleAction<Redux.ModelListActionPayload>(
  ApplicationActionTypes.User.Contacts.Updating
);
export const creatingContactAction = redux.actions.simpleAction<boolean>(ApplicationActionTypes.User.Contacts.Creating);
