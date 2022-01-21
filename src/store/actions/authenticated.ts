import { redux } from "lib";

export const updateLoggedInUserAction = redux.actions.createAction<Model.User>("user.UpdateInState");
export const removeContactFromStateAction = redux.actions.createAction<number>("user.contacts.RemoveFromState");
export const updateContactInStateAction =
  redux.actions.createAction<Redux.UpdateActionPayload<Model.Contact>>("user.contacts.UpdateInState");
export const addContactToStateAction = redux.actions.createAction<Model.Contact>("user.contacts.AddToState");
export const setContactsSearchAction = redux.actions.createContextAction<string, Tables.ContactTableContext>(
  "user.contacts.SetSearch"
);
export const requestFilteredContactsAction = redux.actions.createAction<null>("user.contacts.RequestFiltered");
export const loadingFilteredContactsAction = redux.actions.createAction<boolean>("user.contacts.LoadingFiltered");
export const responseFilteredContactsAction = redux.actions.createAction<Http.ListResponse<Model.Contact>>(
  "user.contacts.ResponseFiltered"
);
export const setSubscriptionPermissionModalOpenAction = redux.actions.createAction<boolean>(
  "SetSubscriptionPermissionModalOpen"
);
