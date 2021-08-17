import { Reducer } from "redux";
import { isNil, filter, find } from "lodash";
import { util } from "lib";
import { warnInconsistentState } from "../../util";

export * from "./util";
export * from "./comments";
export * from "./detail";
export * from "./table";

export const createSimplePayloadReducer = <P, A extends Redux.Action<P> = Redux.Action<P>>(
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

export const createSimpleBooleanReducer = <A extends Redux.Action<boolean>>(actionType: string): Reducer<boolean, A> =>
  createSimplePayloadReducer<boolean, A>(actionType, false);

/* prettier-ignore */
export const createAgnosticModelListActionReducer =
  () =>
    (
      st: Redux.ModelListActionStore = [],
      action: Redux.Action<Redux.ModelListActionPayload>
    ): Redux.ModelListActionStore => {
      if (action.payload.value === true) {
        const instance: Redux.ModelListActionInstance | undefined = find(st, { id: action.payload.id });
        if (!isNil(instance)) {
          return util.replaceInArray<Redux.ModelListActionInstance>(
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
            reason: "The instance does not exist in state when it is expected to."
          });
          return st;
        } else {
          if (instance.count === 1) {
            return filter(st, (inst: Redux.ModelListActionInstance) => inst.id !== action.payload.id);
          } else {
            return util.replaceInArray<Redux.ModelListActionInstance>(
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
/* prettier-ignore */
export const createModelListActionReducer =
  (actionType: string) =>
    (st: Redux.ModelListActionStore = [], action: Redux.Action<Redux.ModelListActionPayload>) => {
      const reducer = createAgnosticModelListActionReducer();
      if (action.type === actionType) {
        return reducer(st, action);
      }
      return st;
    };
