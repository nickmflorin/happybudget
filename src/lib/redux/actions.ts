export const createAction = <P = any>(type: string, payload: P, options?: Redux.ActionConfig): Redux.Action<P> => {
  return { type, payload, ...options };
};

export const simpleAction = <P = any, A extends Redux.Action<P> = Redux.Action<P>>(type: string) => {
  return (payload: P, options?: Redux.ActionConfig): A => {
    return { ...createAction<P>(type, payload, options) } as A;
  };
};
