import { isNil } from "lodash";

import { redux } from "lib";

type ActionCreatorConfig<
  P extends Redux.ActionPayload,
  C extends Redux.ActionContext = Redux.ActionContext,
> = {
  readonly ctx?: Pick<C, "errorMessage">;
  readonly label?: string;
  readonly prefix?: string;
  readonly prepareAction?: (p: P) => Omit<Redux.Action<P>, "type">;
};

/**
 * Modified version of @redux.js/toolkit's `createAction` method that uses an
 * action creator that attaches custom context to the action object and an
 * optionally provided label.
 */
export const createAction = <
  P extends Redux.ActionPayload,
  C extends Redux.ActionContext = Redux.ActionContext,
>(
  type: string,
  config?: ActionCreatorConfig<P, C>,
): Redux.ActionCreator<P, C> => {
  const actionType = !isNil(config?.prefix)
    ? `${config?.prefix as string}.${type}`
    : !isNil(config?.label)
    ? `${config?.label as string}.${type}`
    : type;

  function actionCreator(payload: P, dynamicContext: Omit<C, "publicTokenId">): Redux.Action<P> {
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
  <C extends Redux.ActionContext = Redux.ActionContext>(
    config?: ActionCreatorConfig<Redux.ActionPayload, C>,
  ): {
    <PR extends Redux.ActionPayload, CR extends Redux.ActionContext = Redux.ActionContext>(
      type: string,
      config?: ActionCreatorConfig<PR, CR>,
    ): Redux.ActionCreator<PR, CR>;
  } =>
  <PR extends Redux.ActionPayload, CR extends Redux.ActionContext = Redux.ActionContext>(
    type: string,
    c?: ActionCreatorConfig<PR, CR>,
  ) =>
    // Dynamic configuration should override static configuration.
    createAction<PR, CR>(type, { ...config, ...c });

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
