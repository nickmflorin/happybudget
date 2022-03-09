import { isNil } from "lodash";

import { tabling } from "lib";

import createControlEventReducer from "./createControlEventReducer";
import createChangeEventReducer from "./createChangeEventReducer";

const createEventReducer = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
  C extends Table.Context = Table.Context,
  A extends Redux.AuthenticatedTableActionMap<R, M, C> = Redux.AuthenticatedTableActionMap<R, M, C>
>(
  config: Table.ReducerConfig<R, M, S, C, A> & {
    readonly recalculateRow?: (state: S, row: Table.DataRow<R>) => Partial<R>;
  }
): Redux.Reducer<S, Table.Event<R, M>> => {
  const changeEventReducer = createChangeEventReducer(config);
  const controlEventReducer = createControlEventReducer(config);

  return (state: S = config.initialState, e: Table.Event<R, M>): S => {
    if (tabling.typeguards.isChangeEvent(e)) {
      return changeEventReducer(state, e);
    } else if (tabling.typeguards.isControlEvent(e)) {
      return controlEventReducer(state, e);
    } else if (tabling.typeguards.isMetaEvent(e)) {
      if (e.type === "forward") {
        const forwardEvent = tabling.meta.getRedoEvent<R>(state);
        if (!isNil(forwardEvent)) {
          const newState = { ...state, eventIndex: state.eventIndex + 1 };
          return changeEventReducer(newState, forwardEvent);
        }
      } else {
        const undoEvent = tabling.meta.getUndoEvent<R>(state);
        if (!isNil(undoEvent)) {
          const newState = { ...state, eventIndex: Math.max(state.eventIndex - 1, -1) };
          return changeEventReducer(newState, undoEvent);
        }
      }
    }
    return state;
  };
};

export default createEventReducer;
