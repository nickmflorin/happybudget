export const isAction = (obj: Redux.Action | any): obj is Redux.Action => {
  return (obj as Redux.Action).type !== undefined;
};

export const isAuthenticatedStore = (obj: Modules.Store): obj is Modules.Authenticated.Store =>
  (obj as Modules.Authenticated.Store).user !== undefined;

export const isUnauthenticatedModuleConfig = (
  config: Modules.ModuleConfig
): config is Modules.Unauthenticated.ModuleConfig =>
  (config as Modules.Unauthenticated.ModuleConfig).isUnauthenticated === true;

export const isAuthenticatedAction = (action: Redux.Action<any>): action is Redux.AuthenticatedAction<any> =>
  (action as Redux.AuthenticatedAction<any>).isAuthenticated === true;
