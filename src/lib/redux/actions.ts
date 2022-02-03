/**
 * Modified version of @redux.js/toolkit's `createAction` method that uses an
 * action creator that attaches custom context to the action object.
 */
export function createAction<P extends Redux.ActionPayload>(
  type: string,
  ctx?: Pick<Redux.ActionContext, "errorMessage">,
  prepareAction?: (p: P) => Omit<Redux.Action<P>, "type">
): Redux.ActionCreator<P> {
  function actionCreator(payload: P, dynamicContext?: Pick<Redux.ActionContext, "errorMessage">): Redux.Action<P> {
    if (prepareAction) {
      const prepared = prepareAction(payload);
      if (!prepared) {
        throw new Error("prepareAction did not return an object");
      }
      return {
        type,
        payload: prepared.payload,
        /* Priority should always be given to context included when the action
					 is dispatched.  Context provided to the action creator as a
					 configuration takes priority after that. */
        context: { ...ctx, ...dynamicContext }
      };
    }
    /* Priority should always be given to context included when the action
			 is dispatched.  Context provided to the action creator as a
			 configuration takes priority after that. */
    return { type, payload, context: { ...ctx, ...dynamicContext } };
  }
  actionCreator.toString = () => `${type}`;
  actionCreator.type = type;
  return actionCreator;
}

export function createTableAction<P extends Redux.ActionPayload, C extends Table.Context = Table.Context>(
  type: string,
  ctx?: Pick<Redux.WithActionContext<C>, "errorMessage">,
  prepareAction?: (p: P) => Omit<Redux.Action<P, Redux.WithActionContext<C>>, "type">
): Redux.TableActionCreator<P, C> {
  function actionCreator(payload: P, dynamicContext: Omit<C, "publicTokenId">): Redux.Action<P, C> {
    if (prepareAction) {
      const prepared = prepareAction(payload);
      if (!prepared) {
        throw new Error("prepareAction did not return an object");
      }
      return {
        type,
        payload: prepared.payload,
        /* Priority should always be given to context included when the action
					 is dispatched.  Context provided to the action creator as a
					 configuration takes priority after that. */
        context: { ...ctx, ...dynamicContext } as Redux.WithActionContext<C>
      };
    }
    /* Priority should always be given to context included when the action
			 is dispatched.  Context provided to the action creator as a
			 configuration takes priority after that. */
    return { type, payload, context: { ...ctx, ...dynamicContext } as Redux.WithActionContext<C> };
  }
  actionCreator.toString = () => `${type}`;
  actionCreator.type = type;
  return actionCreator;
}
