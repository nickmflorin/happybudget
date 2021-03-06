import { AnyAction, Reducer } from "redux";

/**
 * Function to sequentially apply a series of simple reducers of form
 * (state, action) => newState into a larger reducer.
 *
 * This is useful in allowing users to cleanly write reducers for specific
 * action types without needing a giant switch statement.
 */
export const composeReducers = <A extends AnyAction = AnyAction>(initialState: any, ...args: any) => {
  const withIdentity: Reducer<any, A>[] = [(x: any) => x].concat(args);
  const composed = (prevState: any = initialState, action: A) =>
    withIdentity.reduce(
      (state: any, reducer: Reducer<any, A>) => Object.assign(initialState, state, reducer(prevState, action)),
      {}
    );
  return composed;
};
