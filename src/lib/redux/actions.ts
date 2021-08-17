import { isAuthenticatedAction } from "./typeguards";

export const createAction = <P = any>(type: string, payload: P, options?: Redux.ActionConfig): Redux.Action<P> => {
  return { type, payload, ...options };
};

export const simpleAction = <P = any>(type: string) => {
  return (payload: P, options?: Redux.ActionConfig): Redux.Action<P> => {
    return { ...createAction<P>(type, payload, options) } as Redux.Action<P>;
  };
};

export const toggleActionOnAuthentication = (
  authAction: Redux.Action,
  nonauthAction: Redux.Action,
  root: Redux.Action
): Redux.Action => (isAuthenticatedAction(root) ? authAction : nonauthAction);
