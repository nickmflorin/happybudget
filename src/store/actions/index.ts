import { redux } from "lib";

export * as authenticated from "./authenticated";

export const setApplicationLoadingAction = redux.actions.createAction<boolean>("SetApplicationLoading");
export const requestContactsAction = redux.actions.createAction<null>("contacts.Request");
export const loadingContactsAction = redux.actions.createAction<boolean>("contacts.Loading");
export const responseContactsAction = redux.actions.createAction<Http.ListResponse<Model.Contact>>("contacts.Response");
