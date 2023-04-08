import { model } from "lib";

import * as api from "../api";

import * as types from "./types";

type ActionCreatorConfig = {
  readonly ctx?: Pick<types.ActionContext, "errorMessage">;
  readonly label?: string;
};

/**
 * Modified version of @redux.js/toolkit's `createAction` method that uses an action creator that
 * attaches custom context to the action object and an optionally provided label.
 */
export const createAction =
  <P, C extends types.ActionContext = types.ActionContext>(config?: ActionCreatorConfig) =>
  <T extends string>(type: T): types.ActionCreator<P, C, T> => {
    function actionCreator<Pi extends P = P, Ci extends C = C>(
      payload: Pi,
      dynamicContext: Omit<Ci, "publicTokenId">,
    ): types.Action<Pi, Ci, T> {
      /* Priority should always be given to context that is included when the action is dispatched,
         versus the context that is used to initialize the ActionCreator - which is provided as a
         configuration. */
      return {
        type,
        payload,
        context: { ...config?.ctx, ...dynamicContext } as Ci,
      } as types.Action<Pi, Ci, T>;
    }
    actionCreator.toString = () => type;
    actionCreator.type = type;
    return actionCreator as types.ActionCreator<P, C, T>;
  };

export const setApplicationLoadingAction = createAction<boolean>()("SetApplicationLoading");
export const setApplicationDrawerAction = createAction<boolean | "TOGGLE">()(
  "SetApplicationDrawer",
);
export const setProductPermissionModalOpenAction = createAction<boolean>()(
  "SetProductPermissionModalOpen",
);

export const requestContactsAction = createAction<types.RequestActionPayload>()("contacts.Request");

export const loadingContactsAction = createAction<boolean>()("contacts.Loading");

export const responseContactsAction =
  createAction<api.ClientResponse<api.ApiListResponse<model.Contact>>>()("contacts.Response");

export const removeContactFromStateAction = createAction<number>()("user.contacts.RemoveFromState");

export const updateContactInStateAction = createAction<types.UpdateModelPayload<model.Contact>>()(
  "user.contacts.UpdateInState",
);
export const addContactToStateAction = createAction<model.Contact>()("user.contacts.AddToState");

export const setContactsSearchAction = createAction<string>()("user.contacts.SetSearch");

export const requestFilteredContactsAction = createAction<types.RequestActionPayload>()(
  "user.contacts.RequestFiltered",
);
export const loadingFilteredContactsAction = createAction<boolean>()(
  "user.contacts.LoadingFiltered",
);

export const responseFilteredContactsAction = createAction<
  api.ClientResponse<api.ApiListResponse<model.Contact>>
>()("user.contacts.ResponseFiltered");

export const responseSubAccountUnitsAction = createAction<
  api.ClientResponse<api.ApiListResponse<model.SubAccountUnit>>
>()("budget.subaccountunits.Response");

export const responseFringeColorsAction = createAction<
  api.ClientResponse<api.ApiListResponse<string>>
>()("budget.fringecolors.Response");

export const responseActualTypesAction = createAction<
  api.ClientResponse<api.ApiListResponse<model.ActualType>>
>()("budget.actualstypes.Response");

export type UserMetricsIncrementByPayload = {
  readonly incrementBy: number;
  readonly metric: keyof model.User["metrics"];
};

export type UserMetricsDecrementByPayload = {
  readonly decrementBy: number;
  readonly metric: keyof model.User["metrics"];
};

export type UserMetricsChangePayload = {
  readonly change: "increment" | "decrement";
  readonly metric: keyof model.User["metrics"];
};

export type UserMetricsValuePayload = {
  readonly value: number;
  readonly metric: keyof model.User["metrics"];
};

export type UserMetricsActionPayload =
  | UserMetricsIncrementByPayload
  | UserMetricsDecrementByPayload
  | UserMetricsChangePayload
  | UserMetricsValuePayload;

export type UserMetricsAction =
  | types.Action<UserMetricsIncrementByPayload>
  | types.Action<UserMetricsDecrementByPayload>
  | types.Action<UserMetricsChangePayload>
  | types.Action<UserMetricsValuePayload>;

export type UpdateUserAction = types.Action<model.User>;
export type ClearUserAction = types.Action<null>;
export type UserAction = UpdateUserAction | UserMetricsAction | ClearUserAction;

export const updateLoggedInUserMetricsAction =
  createAction<UserMetricsActionPayload>()("user.UpdateMetrics");

export const updateLoggedInUserAction = createAction<model.User>()("user.UpdateInState");

export const clearLoggedInUserAction = createAction<null>()("user.Clear");

export const isUserMetricsValueAction = (
  a: UserMetricsAction,
): a is types.Action<UserMetricsValuePayload> =>
  (a as types.Action<UserMetricsValuePayload>).payload.value !== undefined;

export const isUserMetricsChangeAction = (
  a: UserMetricsAction,
): a is types.Action<UserMetricsChangePayload> =>
  (a as types.Action<UserMetricsChangePayload>).payload.change !== undefined;

export const isUserMetricsIncrementByAction = (
  a: UserMetricsAction,
): a is types.Action<UserMetricsIncrementByPayload> =>
  (a as types.Action<UserMetricsIncrementByPayload>).payload.incrementBy !== undefined;

export const isUpdateUserAction = (a: UserAction): a is UpdateUserAction =>
  a.type === updateLoggedInUserAction.toString();

export const isUserMetricsAction = (a: UserAction): a is UserMetricsAction =>
  a.type === updateLoggedInUserMetricsAction.toString();

export const isUserClearAction = (a: UserAction): a is UserMetricsAction =>
  a.type === clearLoggedInUserAction.toString();
