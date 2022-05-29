import { isNil, filter, includes } from "lodash";

import { tabling, redux, util } from "lib";

import createRowAddEventReducer from "./createRowAddEventReducer";
import createDataChangeEventReducer from "./createDataChangeEventReducer";
import { reorderRows, groupRowFromState, removeRowsFromTheirGroupsIfTheyExist, updateRowGroup } from "./util";

/**
 * Reducer that removes rows from the current table state S and returns the
 * updated table state S with the rows removed.
 *
 * When a row is deleted, we first have to segment the rows being deleted based
 * on the type of row it refers to.  The type of rows that can be deleted are:
 *
 * (1) GroupRow
 * (2) MarkupRow
 * (3) ModelRow
 * (4) PlaceholderRow
 *
 * For MarkupRow(s) and ModelRow(s), we first have to remove the rows that are
 * going to be deleted from their respective groups (if they exist).  When this
 * is done, the row data for the groups will also be calculated based on the
 * new set of rows belonging to each group.
 *
 * Then, we need to actually remove the rows from the state S, regardless of
 * what type of row it refers to.
 *
 * @returns The updated table state S with the rows removed.
 */
const rowDeleteEventReducer = <R extends Table.RowData, S extends Redux.TableStore<R> = Redux.TableStore<R>>(
  s: S,
  e: Table.RowDeleteEvent
): S => {
  const ids: Table.RowId[] = Array.isArray(e.payload.rows) ? e.payload.rows : [e.payload.rows];

  const modelRows: Table.ModelRow<R>[] = redux.findModelsInData<Table.ModelRow<R>>(
    filter(s.data, (r: Table.BodyRow<R>) => tabling.rows.isModelRow(r)) as Table.ModelRow<R>[],
    filter(ids, (id: Table.ModelRowId | Table.MarkupRowId) => tabling.rows.isModelRowId(id)) as Table.ModelRowId[]
  );
  const newState = removeRowsFromTheirGroupsIfTheyExist(s, modelRows);
  return reorderRows({
    ...newState,
    data: filter(newState.data, (ri: Table.BodyRow<R>) => !includes(ids, ri.id))
  });
};

const createRowRemoveFromGroupEventReducer = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
  C extends Redux.ActionContext = Redux.ActionContext
>(
  config: Table.AuthenticatedReducerConfig<R, M, S, C>
): Redux.BasicReducer<S, Table.RowRemoveFromGroupEvent> => {
  const groupRowManager = new tabling.rows.GroupRowManager<R, M>({ columns: config.columns });

  return (s: S = config.initialState, e: Table.RowRemoveFromGroupEvent): S => {
    const ids: Table.ModelRowId[] = Array.isArray(e.payload.rows) ? e.payload.rows : [e.payload.rows];
    const g: Table.GroupRow<R> | null = groupRowFromState<R, S>(s, e.payload.group);
    if (!isNil(g)) {
      return reorderRows({
        ...s,
        data: util.replaceInArray<Table.BodyRow<R>>(s.data, { id: g.id }, groupRowManager.removeChildren(g, ids))
      });
    }
    return s;
  };
};

const rowAddToGroupEventReducer = <R extends Table.RowData, S extends Redux.TableStore<R> = Redux.TableStore<R>>(
  s: S,
  e: Table.RowAddToGroupEvent
): S => reorderRows(updateRowGroup(s, e.payload.rows, e.payload.group));

const rowInsertEventReducer = <R extends Table.RowData, S extends Redux.TableStore<R> = Redux.TableStore<R>>(
  s: S,
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  e: Table.RowInsertEvent<R>
): S => s;

const rowPositionChangedEventReducer = <R extends Table.RowData, S extends Redux.TableStore<R> = Redux.TableStore<R>>(
  s: S,
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  e: Table.RowPositionChangedEvent
): S => s;

type ChangeEventReducers<R extends Table.RowData, S extends Redux.TableStore<R> = Redux.TableStore<R>> = {
  readonly [Property in keyof Omit<Table.ChangeEvents<R>, "dataChange">]: Redux.BasicReducerWithDefinedState<
    S,
    Table.ChangeEvents<R>[Property]
  >;
};

const createChangeEventReducer = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
  C extends Redux.ActionContext = Redux.ActionContext
>(
  config: Table.AuthenticatedReducerConfig<R, M, S, C>
): Redux.BasicDynamicReducer<S, Redux.RecalculateRowReducerCallback<S, R>, Table.ChangeEvent<R>> => {
  const changeEventReducers: ChangeEventReducers<R, S> = {
    rowAdd: createRowAddEventReducer(config),
    rowDelete: rowDeleteEventReducer,
    rowRemoveFromGroup: createRowRemoveFromGroupEventReducer(config),
    rowAddToGroup: rowAddToGroupEventReducer,
    rowInsert: rowInsertEventReducer,
    rowPositionChanged: rowPositionChangedEventReducer,
    // These events are specific only to the sagas, so we just use the identity.
    groupAdd: redux.reducers.identityReducerWithDefinedState,
    groupUpdate: redux.reducers.identityReducerWithDefinedState,
    markupAdd: redux.reducers.identityReducerWithDefinedState,
    markupUpdate: redux.reducers.identityReducerWithDefinedState
  };
  const dataChangeReducer = createDataChangeEventReducer(config);

  return (
    state: S = config.initialState,
    e: Table.ChangeEvent<R>,
    recalculateRow?: Redux.RecalculateRowReducerCallback<S, R>
  ): S => {
    let newState = { ...state };
    if (e.type === "dataChange") {
      newState = dataChangeReducer(newState, e, recalculateRow);
    } else {
      const reducer = changeEventReducers[e.type] as Redux.BasicReducerWithDefinedState<S, typeof e>;
      newState = reducer(state, e);
    }

    // Do not alter the event history if the event is itself an undo/redo event.
    if (!includes(["forward", "reverse"], e.meta)) {
      if (tabling.events.eventCanTraverse(e)) {
        // Traversible events move the eventIndex to the front of the history.
        newState = {
          ...newState,
          eventHistory: [...newState.eventHistory, e],
          eventIndex: newState.eventHistory.length
        };
      } else {
        /*
				If the event is not traversible, it means it does not qualify for undo
				and/or redo.  This means that we have to clear the event history in
				memory because the current event can conflict with a previous
				traversible event.

				Example) If we alter a cell in a row, that event is traversible and
				will be in the event history.  But if we then delete the row, and we
				do not clear the event history, and undo action will lead to a 404
				response because the row we are undoing the change for no longer exists.
				 */
        newState = { ...newState, eventHistory: [], eventIndex: -1 };
      }
    }
    return newState;
  };
};

export default createChangeEventReducer;
