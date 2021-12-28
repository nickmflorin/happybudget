import { redux } from "lib";

export * as authenticated from "./authenticated";

export { default as AuthenticatedActionTypes } from "./authenticated";

export const GlobalActionTypes = {
  SetApplicationLoading: "SetApplicationLoading",
  Contacts: {
    Request: "contacts.Request",
    Loading: "contacts.Loading",
    Response: "contacts.Response"
  }
};

export const setApplicationLoadingAction = redux.actions.createAction<boolean>(GlobalActionTypes.SetApplicationLoading);

export const requestContactsAction = redux.actions.createAction<null>(GlobalActionTypes.Contacts.Request);
export const loadingContactsAction = redux.actions.createAction<boolean>(GlobalActionTypes.Contacts.Loading);
export const responseContactsAction = redux.actions.createAction<Http.ListResponse<Model.Contact>>(
  GlobalActionTypes.Contacts.Response
);
