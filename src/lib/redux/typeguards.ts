export const isAction = (obj: Redux.Action | any): obj is Redux.Action => {
  return (obj as Redux.Action).type !== undefined;
};

export const isListRequestIdsAction = (obj: Redux.Action<any>): obj is Redux.Action<{ ids: number[] }> =>
  (obj as Redux.Action<Redux.TableRequestPayload>).payload !== null &&
  (obj as Redux.Action<Redux.TableRequestPayload>).payload?.ids !== undefined &&
  Array.isArray((obj as Redux.Action<Redux.TableRequestPayload>).payload?.ids);

export const isAuthenticatedStore = (obj: Application.Store): obj is Application.Authenticated.Store =>
  (obj as Application.Authenticated.Store).user !== undefined;

export const isUnauthenticatedModuleConfig = (
  config: Application.AnyModuleConfig
): config is Application.Unauthenticated.ModuleConfig =>
  (config as Application.Unauthenticated.ModuleConfig).isUnauthenticated === true;

export const isAuthenticatedAction = (action: Redux.Action<any>): action is Redux.AuthenticatedAction<any> =>
  (action as Redux.AuthenticatedAction<any>).isAuthenticated === true;
