import { createAction } from "@reduxjs/toolkit";

export * as authenticated from "./authenticated";

export { default as AuthenticatedActionTypes } from "./authenticated";

export const GlobalActionTypes = {
  Set404Redirect: "Set404Redirect",
  SetDrawerVisibility: "SetDrawerVisibility",
  SetApplicationLoading: "SetApplicationLoading",
  Contacts: {
    Request: "contacts.Request",
    Loading: "contacts.Loading",
    Response: "contacts.Response"
  }
};

export const redirect404Action = createAction<string | true>(GlobalActionTypes.Set404Redirect);
export const setDrawerVisibilityAction = createAction<boolean>(GlobalActionTypes.SetDrawerVisibility);
export const setApplicationLoadingAction = createAction<boolean>(GlobalActionTypes.SetApplicationLoading);

export const requestContactsAction = createAction<null>(GlobalActionTypes.Contacts.Request);
export const loadingContactsAction = createAction<boolean>(GlobalActionTypes.Contacts.Loading);
export const responseContactsAction = createAction<Http.ListResponse<Model.Contact>>(
  GlobalActionTypes.Contacts.Response
);
