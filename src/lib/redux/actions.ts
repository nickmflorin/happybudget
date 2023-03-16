import { isNil } from "lodash";

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
