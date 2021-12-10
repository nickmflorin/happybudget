export const isAction = (obj: Redux.Action | any): obj is Redux.Action => {
  return (obj as Redux.Action).type !== undefined;
};

export const isClearOnDetail = <T>(obj: Redux.ClearOn<T>): obj is Redux.ClearOnDetail<T> =>
  (obj as Redux.ClearOnDetail<T>).payload !== undefined && (obj as Redux.ClearOnDetail<T>).action !== undefined;

export const isListRequestIdsPayload = (obj: Redux.TableRequestPayload): obj is { ids: number[] } =>
  typeof obj === "object" &&
  (obj as { ids: number[] }).ids !== undefined &&
  Array.isArray((obj as { ids: number[] }).ids);

export const isListRequestIdsAction = (obj: Redux.Action<any>): obj is Redux.Action<{ ids: number[] }> =>
  isListRequestIdsPayload(obj.payload);

export const isAuthenticatedStore = (obj: Application.Store): obj is Application.Authenticated.Store =>
  (obj as Application.Authenticated.Store).user !== undefined;

export const isUnauthenticatedModuleConfig = (
  config: Application.AnyModuleConfig
): config is Application.Unauthenticated.ModuleConfig =>
  (config as Application.Unauthenticated.ModuleConfig).isUnauthenticated === true;

export const isAuthenticatedAction = (action: Redux.Action<any>): action is Redux.AuthenticatedAction<any> =>
  (action as Redux.AuthenticatedAction<any>).isAuthenticated === true;
