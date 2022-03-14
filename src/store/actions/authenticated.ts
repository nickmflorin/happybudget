import { redux } from "lib";

export const updateLoggedInUserAction = redux.actions.createAction<Model.User>("user.UpdateInState");
export const clearLoggedInUserAction = redux.actions.createAction<null>("user.Clear");
export const setProductPermissionModalOpenAction = redux.actions.createAction<boolean>("SetProductPermissionModalOpen");
