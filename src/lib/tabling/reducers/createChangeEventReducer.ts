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

  const modelRows: Table.ModelRow<R>[] = redux.reducers.findModelsInData<Table.ModelRow<R>>(
    filter(s.data, (r: Table.BodyRow<R>) => tabling.typeguards.isModelRow(r)) as Table.ModelRow<R>[],
    filter(ids, (id: Table.ModelRowId | Table.MarkupRowId) => tabling.typeguards.isModelRowId(id)) as Table.ModelRowId[]
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
  C extends Table.Context = Table.Context,
  A extends Redux.AuthenticatedTableActionMap<R, M, C> = Redux.AuthenticatedTableActionMap<R, M, C>
>(
  config: Table.ReducerConfig<R, M, S, C, A>
): Redux.Reducer<S, Table.RowRemoveFromGroupEvent> => {
  const groupRowManager = new tabling.managers.GroupRowManager<R, M>({ columns: config.columns });

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
  readonly [Property in keyof Table.ChangeEvents<R>]: Redux.ReducerWithDefinedState<S, Table.ChangeEvents<R>[Property]>;
};

const createChangeEventReducer = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
  C extends Table.Context = Table.Context,
  A extends Redux.AuthenticatedTableActionMap<R, M, C> = Redux.AuthenticatedTableActionMap<R, M, C>
>(
  config: Table.ReducerConfig<R, M, S, C, A> & {
    readonly recalculateRow?: (state: S, row: Table.DataRow<R>) => Partial<R>;
  }
): Redux.Reducer<S, Table.ChangeEvent<R>> => {
  const changeEventReducers: ChangeEventReducers<R, S> = {
    rowAdd: createRowAddEventReducer(config),
    dataChange: createDataChangeEventReducer(config),
    rowDelete: rowDeleteEventReducer,
    rowRemoveFromGroup: createRowRemoveFromGroupEventReducer(config),
    rowAddToGroup: rowAddToGroupEventReducer,
    rowInsert: rowInsertEventReducer,
    rowPositionChanged: rowPositionChangedEventReducer
  };

  return (state: S = config.initialState, e: Table.ChangeEvent<R>): S => {
    const reducer = changeEventReducers[e.type] as Redux.ReducerWithDefinedState<S, typeof e>;
    let newState = reducer(state, e);

    if (tabling.typeguards.isTraversibleEvent(e)) {
      newState = { ...newState, eventHistory: [...newState.eventHistory, e] };
    }
    return newState;
  };
};

export default createChangeEventReducer;
