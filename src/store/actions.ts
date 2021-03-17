export const ApplicationActionTypes = {
  SetDrawerVisibility: "SetDrawerVisibility",
  SetApplicationLoading: "SetApplicationLoading",
  SetOverallApplicationLoading: "SetOverallApplicationLoading",
  User: {
    UpdateInState: "user.UpdateInState"
  }
};

/* eslint-disable indent */
export const createAction = <P = any>(type: string, payload?: P, options?: Redux.IActionConfig): Redux.IAction<P> => {
  return { type, payload, ...options };
};

export const simpleAction = <P = any, A extends Redux.IAction<P> = Redux.IAction<P>>(type: string) => {
  return (payload?: P | undefined, options?: Redux.IActionConfig): A => {
    return { ...createAction<P>(type, payload, options) } as A;
  };
};

export const updateLoggedInUserAction = (user: Partial<IUser>) => {
  return createAction<Partial<IUser>>(ApplicationActionTypes.User.UpdateInState, user);
};

export const setDrawerVisibilityAction = simpleAction<boolean>(ApplicationActionTypes.SetDrawerVisibility);
export const setApplicationLoadingAction = simpleAction<{ id: string; value: boolean }>(
  ApplicationActionTypes.SetApplicationLoading
);
export const setOverallApplicationLoadingAction = simpleAction<boolean>(
  ApplicationActionTypes.SetOverallApplicationLoading
);
