import { isNil } from "lodash";

import createChangeEventReducer from "./createChangeEventReducer";
import createControlEventReducer from "./createControlEventReducer";
import * as events from "../events";

const createEventReducer = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
  C extends Redux.ActionContext = Redux.ActionContext,
>(
  config: Table.AuthenticatedReducerConfig<R, M, S, C> & {
    readonly recalculateRow?: (state: S, row: Table.DataRow<R>) => Partial<R>;
  },
): Redux.BasicDynamicReducer<S, Redux.RecalculateRowReducerCallback<S, R>, Table.Event<R, M>> => {
  const changeEventReducer = createChangeEventReducer(config);
  const controlEventReducer = createControlEventReducer(config);

  return (
    state: S = config.initialState,
    e: Table.Event<R, M>,
    recalculateRow?: Redux.RecalculateRowReducerCallback<S, R>,
  ): S => {
    if (events.isChangeEvent(e)) {
      return changeEventReducer(state, e, recalculateRow);
    } else if (events.isControlEvent(e)) {
      return controlEventReducer(state, e);
    } else if (events.isMetaEvent(e)) {
      if (e.type === "forward") {
        const forwardEvent = events.getRedoEvent<R>(state);
        if (!isNil(forwardEvent)) {
          const newState = { ...state, eventIndex: state.eventIndex + 1 };
          return changeEventReducer(newState, forwardEvent);
        }
      } else {
        const undoEvent = events.getUndoEvent<R>(state);
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
