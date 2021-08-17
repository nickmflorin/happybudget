import { redux } from "lib";

export * as authenticated from "./authenticated";
export * as unauthenticated from "./unauthenticated";

export { default as UnauthenticatedActionTypes } from "./unauthenticated";
export { default as AuthenticatedActionTypes } from "./authenticated";

export const GlobalActionTypes = {
  SetDrawerVisibility: "SetDrawerVisibility",
  SetApplicationLoading: "SetApplicationLoading"
};

export const setDrawerVisibilityAction = redux.actions.simpleAction<boolean>(GlobalActionTypes.SetDrawerVisibility);
export const setApplicationLoadingAction = redux.actions.simpleAction<boolean>(GlobalActionTypes.SetApplicationLoading);
