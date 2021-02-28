export const ApplicationActionTypes = {
  User: {
    UpdateInState: "user.UpdateInState"
  }
};

export const createAction = <P = any>(type: string, payload?: P, options?: Redux.IActionConfig): Redux.IAction<P> => {
  return { type, payload, ...options };
};

export const updateLoggedInUserAction = (user: Partial<IUser>) => {
  return createAction<Partial<IUser>>(ApplicationActionTypes.User.UpdateInState, user);
};
