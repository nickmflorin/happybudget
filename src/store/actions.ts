export const ApplicationActionTypes = {
  SetDrawerVisibility: "SetDrawerVisibility",
  SetApplicationLoading: "SetApplicationLoading",
  User: {
    UpdateInState: "user.UpdateInState"
  }
};

export const createAction = <P = any>(type: string, payload: P, options?: Redux.ActionConfig): Redux.Action<P> => {
  return { type, payload, ...options };
};

export const simpleAction = <P = any, A extends Redux.Action<P> = Redux.Action<P>>(type: string) => {
  return (payload: P, options?: Redux.ActionConfig): A => {
    return { ...createAction<P>(type, payload, options) } as A;
  };
};

export const updateLoggedInUserAction = (user: Partial<Model.User>) => {
  return createAction<Partial<Model.User>>(ApplicationActionTypes.User.UpdateInState, user);
};
export const setDrawerVisibilityAction = simpleAction<boolean>(ApplicationActionTypes.SetDrawerVisibility);
export const setApplicationLoadingAction = simpleAction<boolean>(ApplicationActionTypes.SetApplicationLoading);
