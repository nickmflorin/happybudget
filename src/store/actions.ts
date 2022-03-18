import { redux } from "lib";

export const setApplicationLoadingAction = redux.actions.createAction<boolean>("SetApplicationLoading");

export const updateLoggedInUserAction = redux.actions.createAction<Model.User>("user.UpdateInState");
export const clearLoggedInUserAction = redux.actions.createAction<null>("user.Clear");
export const setProductPermissionModalOpenAction = redux.actions.createAction<boolean>("SetProductPermissionModalOpen");

export const requestContactsAction = redux.actions.createAction<null>("contacts.Request");
export const loadingContactsAction = redux.actions.createAction<boolean>("contacts.Loading");
export const responseContactsAction = redux.actions.createAction<Http.ListResponse<Model.Contact>>("contacts.Response");
export const removeContactFromStateAction = redux.actions.createAction<number>("user.contacts.RemoveFromState");
export const updateContactInStateAction =
  redux.actions.createAction<Redux.UpdateModelPayload<Model.Contact>>("user.contacts.UpdateInState");
export const addContactToStateAction = redux.actions.createAction<Model.Contact>("user.contacts.AddToState");
export const setContactsSearchAction = redux.actions.createTableAction<string, Tables.ContactTableContext>(
  "user.contacts.SetSearch"
);
export const requestFilteredContactsAction = redux.actions.createAction<null>("user.contacts.RequestFiltered");
export const loadingFilteredContactsAction = redux.actions.createAction<boolean>("user.contacts.LoadingFiltered");
export const responseFilteredContactsAction = redux.actions.createAction<Http.ListResponse<Model.Contact>>(
  "user.contacts.ResponseFiltered"
);
