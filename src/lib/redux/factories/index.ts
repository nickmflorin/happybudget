import { Reducer } from "redux";
import { isNil, filter, find } from "lodash";
import { replaceInArray } from "lib/util";
import { warnInconsistentState } from "../util";

export * from "./counter";
export * from "./comments";
export * from "./list";
export * from "./detail";
export * from "./table";

export interface FactoryOptions<S, A extends Redux.IAction<any> = Redux.IAction<any>> {
  initialState: S;
  excludeActions: null | ((action: A, state: S) => boolean | undefined | void);
  extension: Reducer<S, A> | Reducer<S, A>[] | null;
  subReducers: { [Property in keyof Partial<S>]: Reducer<any, A> } | null | {};
  extensions: { [key: string]: Reducer<S, A> } | null;
  strictSelect: boolean;
  references: { [key: string]: any };
}

export type MappedReducers<O, S, A extends Redux.IAction<any> = Redux.IAction<any>> = Partial<
  Record<keyof O, Reducer<S, A>>
>;

export const createSimplePayloadReducer = <P, A extends Redux.IAction<P> = Redux.IAction<P>>(
  actionType: string,
  initialState: P
): Reducer<P, A> => {
  const reducer: Reducer<P, A> = (state: P = initialState, action: A): P => {
    if (action.type === actionType && action.payload !== undefined) {
      return action.payload;
    }
    return state;
  };
  return reducer;
};

export const createSimpleBooleanReducer = <A extends Redux.IAction<boolean>>(actionType: string): Reducer<boolean, A> =>
  createSimplePayloadReducer<boolean, A>(actionType, false);

export const createAgnosticModelListActionReducer = (references: { [key: string]: any }) => (
  st: Redux.ModelListActionStore = [],
  action: Redux.IAction<Redux.ModelListActionPayload>
): Redux.ModelListActionStore => {
  if (action.payload.value === true) {
    const instance: Redux.ModelListActionInstance | undefined = find(st, { id: action.payload.id });
    if (!isNil(instance)) {
      return replaceInArray<Redux.ModelListActionInstance>(
        st,
        { id: action.payload.id },
        { ...instance, count: instance.count + 1 }
      );
    } else {
      return [...st, { id: action.payload.id, count: 1 }];
    }
  } else {
    const instance: Redux.ModelListActionInstance | undefined = find(st, { id: action.payload.id });
    if (isNil(instance)) {
      warnInconsistentState({
        action: "Removing from model list action state.",
        reason: "The instance does not exist in state when it is expected to.",
        ...references
      });
      return st;
    } else {
      if (instance.count === 1) {
        return filter(st, (inst: Redux.ModelListActionInstance) => inst.id !== action.payload.id);
      } else {
        return replaceInArray<Redux.ModelListActionInstance>(
          st,
          { id: action.payload.id },
          { ...instance, count: instance.count - 1 }
        );
      }
    }
  }
};

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
export const createModelListActionReducer = (actionType: string, references: { [key: string]: any }) => (
  st: Redux.ModelListActionStore = [],
  action: Redux.IAction<Redux.ModelListActionPayload>
) => {
  const reducer = createAgnosticModelListActionReducer(references);
  if (action.type === actionType) {
    return reducer(st, action);
  }
  return st;
};
