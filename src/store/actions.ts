import { redux } from "lib";

export const setApplicationLoadingAction =
  redux.actions.createAction<boolean>("SetApplicationLoading");
export const setApplicationDrawerAction = redux.actions.createAction<boolean | "TOGGLE">(
  "SetApplicationDrawer",
);

export const updateLoggedInUserMetricsAction =
  redux.actions.createAction<Redux.UserMetricsActionPayload>("user.UpdateMetrics");
export const updateLoggedInUserAction =
  redux.actions.createAction<Model.User>("user.UpdateInState");
export const clearLoggedInUserAction = redux.actions.createAction<null>("user.Clear");
export const setProductPermissionModalOpenAction = redux.actions.createAction<boolean>(
  "SetProductPermissionModalOpen",
);

export const requestContactsAction =
  redux.actions.createAction<Redux.RequestPayload>("contacts.Request");
export const loadingContactsAction = redux.actions.createAction<boolean>("contacts.Loading");
export const responseContactsAction =
  redux.actions.createAction<Http.RenderedListResponse<Model.Contact>>("contacts.Response");
export const removeContactFromStateAction = redux.actions.createAction<number>(
  "user.contacts.RemoveFromState",
);
export const updateContactInStateAction = redux.actions.createAction<
  Redux.UpdateModelPayload<Model.Contact>
>("user.contacts.UpdateInState");
export const addContactToStateAction = redux.actions.createAction<Model.Contact>(
  "user.contacts.AddToState",
);
export const setContactsSearchAction =
  redux.actions.createAction<string>("user.contacts.SetSearch");
export const requestFilteredContactsAction = redux.actions.createAction<Redux.RequestPayload>(
  "user.contacts.RequestFiltered",
);
export const loadingFilteredContactsAction = redux.actions.createAction<boolean>(
  "user.contacts.LoadingFiltered",
);
export const responseFilteredContactsAction = redux.actions.createAction<
  Http.RenderedListResponse<Model.Contact>
>("user.contacts.ResponseFiltered");
export const responseSubAccountUnitsAction = redux.actions.createAction<
  Http.RenderedListResponse<Model.Tag>
>("budget.subaccountunits.Response");
export const responseFringeColorsAction = redux.actions.createAction<
  Http.RenderedListResponse<string>
>("budget.fringecolors.Response");
export const responseActualTypesAction = redux.actions.createAction<
  Http.RenderedListResponse<Model.Tag>
>("budget.actualstypes.Response");
