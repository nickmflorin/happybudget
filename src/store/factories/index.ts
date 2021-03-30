import { Reducer } from "redux";
import { isNil, filter, includes } from "lodash";
import { mergeWithDefaults } from "util/objects";

export * from "./counter";
export * from "./comments";
export * from "./list";
export * from "./detail";

export const createSimplePayloadReducer = <P, A extends Redux.IAction<P> = Redux.IAction<P>>(
  actionType: string,
  initialState: P,
  options: Partial<ReducerFactory.IOptions<P>> = { referenceEntity: "entity" }
): Reducer<P, A> => {
  const reducer: Reducer<P, A> = (state: P = initialState, action: A): P => {
    if (action.type === actionType && !isNil(action.payload)) {
      return action.payload;
    }
    return state;
  };
  return reducer;
};

export const createSimpleBooleanReducer = <A extends Redux.IAction<boolean>>(actionType: string): Reducer<boolean, A> =>
  createSimplePayloadReducer<boolean, A>(actionType, false);

/**
 * A reducer factory that creates a generic reducer to handle the state of a
 * list of primary keys that indicate that certain behavior is taking place for
 * the models corresponding to the primary keys of the list.  For instance, if
 * we wanted to keep track of the Accounts that are actively being updated, the
 * reducer would handle the state of a list of primary keys corresponding to the
 * Accounts that are being updated.
 *
 * The reducer has default behavior that is mapped to the action types via
 * the mappings parameter.
 *
 * @param mappings  Mappings of the standard actions to the specific actions that
 *                  the reducer should listen for.
 * @param options   Additional options supplied to the reducer factory.
 */
export const createModelListActionReducer = <A extends Redux.IAction<Redux.ModelListActionPayload>>(
  actionType: string,
  options: Partial<ReducerFactory.IOptions<Redux.ListStore<number>>> = { initialState: [], referenceEntity: "entity" }
): Reducer<Redux.ListStore<number>, A> => {
  const Options = mergeWithDefaults<ReducerFactory.IOptions<Redux.ListStore<number>>>(options, {
    referenceEntity: "entity",
    initialState: []
  });
  const reducer: Reducer<Redux.ListStore<number>, A> = (
    state: Redux.ListStore<number> = Options.initialState,
    action: A
  ): Redux.ListStore<number> => {
    let newState = [...state];
    if (action.type === actionType && !isNil(action.payload)) {
      const payload: Redux.ModelListActionPayload = action.payload;
      if (payload.value === true) {
        if (includes(newState, payload.id)) {
          /* eslint-disable no-console */
          console.warn(
            `Inconsistent State!  Inconsistent state noticed when adding ${Options.referenceEntity}
            to action list state... the ${Options.referenceEntity} with ID ${payload.id} already
            exists in the action list state when it is not expected to.`
          );
        } else {
          newState = [...newState, payload.id];
        }
      } else {
        if (!includes(newState, payload.id)) {
          /* eslint-disable no-console */
          console.warn(
            `Inconsistent State!  Inconsistent state noticed when removing ${Options.referenceEntity}
            from action list state... the ${Options.referenceEntity} with ID ${payload.id} does
            not exist in the action list state when it is expected to.`
          );
        } else {
          newState = filter(newState, (id: number) => id !== payload.id);
        }
      }
    }
    return newState;
  };
  return reducer;
};
