export const ApplicationActionTypes = {
  User: {
    UpdateInState: "user.UpdateInState"
  }
};

/* eslint-disable indent */
export const createAction = <P = any>(type: string, payload?: P, options?: Redux.IActionConfig): Redux.IAction<P> => {
  return { type, payload, ...options };
};

export const simpleAction = <P = any>(type: string) => {
  return (payload: P, options?: Redux.IActionConfig): Redux.IAction<P> => {
    return createAction<P>(type, payload, options);
  };
};

export const updateLoggedInUserAction = (user: Partial<IUser>) => {
  return createAction<Partial<IUser>>(ApplicationActionTypes.User.UpdateInState, user);
};
