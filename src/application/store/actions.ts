import { isNil } from "lodash";

import { model } from "lib";

import * as types from "./types";

type ActionCreatorConfig<
  P extends types.ActionPayload,
  C extends types.ActionContext = types.ActionContext,
> = {
  readonly ctx?: Pick<C, "errorMessage">;
  readonly label?: string;
  readonly prefix?: string;
  readonly prepareAction?: (p: P) => Omit<types.Action<P>, "type">;
};

/**
 * Modified version of @redux.js/toolkit's `createAction` method that uses an
 * action creator that attaches custom context to the action object and an
 * optionally provided label.
 */
export const createAction = <
  P extends types.ActionPayload,
  C extends types.ActionContext = types.ActionContext,
>(
  type: string,
  config?: ActionCreatorConfig<P, C>,
): types.ActionCreator<P, C> => {
  const actionType = !isNil(config?.prefix)
    ? `${config?.prefix as string}.${type}`
    : !isNil(config?.label)
    ? `${config?.label as string}.${type}`
    : type;

  function actionCreator(payload: P, dynamicContext: Omit<C, "publicTokenId">): types.Action<P> {
    let pyload = payload;
    if (config?.prepareAction) {
      const prepared = config?.prepareAction(payload);
      if (!prepared) {
        throw new Error("prepareAction did not return an object");
      }
      pyload = prepared.payload;
    }
    /*
		Priority should always be given to context that is included when the action
		is dispatched, versus the context that is used to initialize the
		ActionCreator - which is provided as a configuration.
		*/
    return {
      type: actionType,
      payload: pyload,
      label: config?.label || null,
      context: { ...config?.ctx, ...dynamicContext },
    };
  }
  actionCreator.label = config?.label || null;
  actionCreator.toString = () => `${actionType}`;
  actionCreator.type = actionType;
  return actionCreator;
};

/**
 * An ActionCreator factory that returns a function that creates actions with
 * the provided configuration.  This should be used when many actions are to
 * be created with the same configuration.
 */
export const createActionCreator =
  <C extends types.ActionContext = types.ActionContext>(
    config?: ActionCreatorConfig<types.ActionPayload, C>,
  ): {
    <PR extends types.ActionPayload, CR extends types.ActionContext = types.ActionContext>(
      type: string,
      config?: ActionCreatorConfig<PR, CR>,
    ): types.ActionCreator<PR, CR>;
  } =>
  <PR extends types.ActionPayload, CR extends types.ActionContext = types.ActionContext>(
    type: string,
    c?: ActionCreatorConfig<PR, CR>,
  ) =>
    // Dynamic configuration should override static configuration.
    createAction<PR, CR>(type, { ...config, ...c });

export const setApplicationLoadingAction = createAction<boolean>("SetApplicationLoading");
export const setApplicationDrawerAction = createAction<boolean | "TOGGLE">("SetApplicationDrawer");

export const updateLoggedInUserMetricsAction =
  createAction<types.UserMetricsActionPayload>("user.UpdateMetrics");
export const updateLoggedInUserAction = createAction<model.User>("user.UpdateInState");
export const clearLoggedInUserAction = createAction<null>("user.Clear");
export const setProductPermissionModalOpenAction = createAction<boolean>(
  "SetProductPermissionModalOpen",
);

export const requestContactsAction = createAction<types.RequestActionPayload>("contacts.Request");
export const loadingContactsAction = createAction<boolean>("contacts.Loading");
export const responseContactsAction =
  createAction<Http.RenderedListResponse<model.Contact>>("contacts.Response");
export const removeContactFromStateAction = createAction<number>("user.contacts.RemoveFromState");
export const updateContactInStateAction = createAction<types.UpdateModelPayload<model.Contact>>(
  "user.contacts.UpdateInState",
);
export const addContactToStateAction = createAction<model.Contact>("user.contacts.AddToState");
export const setContactsSearchAction = createAction<string>("user.contacts.SetSearch");
export const requestFilteredContactsAction = createAction<types.RequestActionPayload>(
  "user.contacts.RequestFiltered",
);
export const loadingFilteredContactsAction = createAction<boolean>("user.contacts.LoadingFiltered");
export const responseFilteredContactsAction = createAction<
  Http.RenderedListResponse<model.Contact>
>("user.contacts.ResponseFiltered");
export const responseSubAccountUnitsAction = createAction<Http.RenderedListResponse<model.Tag>>(
  "budget.subaccountunits.Response",
);
export const responseFringeColorsAction = createAction<Http.RenderedListResponse<string>>(
  "budget.fringecolors.Response",
);
export const responseActualTypesAction = createAction<Http.RenderedListResponse<model.Tag>>(
  "budget.actualstypes.Response",
);
