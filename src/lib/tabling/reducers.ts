import { isNil, reduce, map, filter, includes, intersection, uniq } from "lodash";

import * as applicationEvents from "../events";
import * as redux from "../redux";
import * as util from "../util";
import * as data from "./data";
import * as events from "./events";
import * as rows from "./rows";
import * as typeguards from "./typeguards";

/* eslint-disable indent */
export const groupRowFromState = <R extends Table.RowData, S extends Redux.TableStore<R> = Redux.TableStore<R>>(
  action: Redux.Action,
  st: S,
  id: Table.GroupRowId,
  rowId?: Table.ModelRowId | Table.MarkupRowId,
  options: Redux.FindModelOptions = { name: "Group", warnIfMissing: true }
): Table.GroupRow<R> | null => {
  let predicate = (g: Table.GroupRow<R>) => g.id === id;
  if (!isNil(rowId)) {
    predicate = (g: Table.GroupRow<R>) => g.id === id && includes(g.children, rowId);
  }
  return redux.reducers.modelFromState<Table.GroupRow<R>>(
    action,
    filter(st.data, (r: Table.BodyRow<R>) => typeguards.isGroupRow(r)) as Table.GroupRow<R>[],
    predicate,
    options
  );
};

export const rowGroupRowFromState = <R extends Table.RowData, S extends Redux.TableStore<R> = Redux.TableStore<R>>(
  action: Redux.Action,
  st: S,
  rowId: Table.ModelRowId | Table.MarkupRowId,
  options: Redux.FindModelOptions = { warnIfMissing: true }
): Table.GroupRow<R> | null => {
  const predicate = (g: Table.GroupRow<R>) => includes(g.children, rowId);
  return redux.reducers.modelFromState<Table.GroupRow<R>>(
    action,
    filter(st.data, (r: Table.BodyRow<R>) => typeguards.isGroupRow(r)) as Table.GroupRow<R>[],
    predicate,
    { ...options, name: "Group" }
  );
};

const rowRemoveFromGroupReducer = <
  R extends Table.RowData,
  M extends Model.TypedHttpModel = Model.TypedHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>
>(
  st: S,
  action: Redux.Action<Table.RowRemoveFromGroupEvent>,
  columns: Table.Column<R, M>[]
): S => {
  /*
  When a Row is removed from a Group, we first have to update the Row(s) in state so that they
  do not reference that Group, and also update the Group in state so it no longer references the
  row.  Then, we must recalculate the Group metrics (if applicable) to reflect the new Row(s) it
  contains.
  */
  const e: Table.RowRemoveFromGroupEvent = action.payload;

  const ids: Table.ModelRowId[] = Array.isArray(e.payload.rows) ? e.payload.rows : [e.payload.rows];

  const g: Table.GroupRow<R> | null = groupRowFromState<R, S>(action, st, e.payload.group);
  if (!isNil(g)) {
    return {
      ...st,
      data: data.orderTableRows<R, M>(
        util.replaceInArray<Table.BodyRow<R>>(
          st.data,
          { id: g.id },
          {
            ...g,
            children: filter(g.children, (child: number) => !includes(ids, child)),
            data: rows.updateGroupRowData<R, M>({
              columns,
              data: g.data
            })
          }
        )
      )
    };
  }
  return st;
};

const rowAddToGroupReducer = <
  R extends Table.RowData,
  M extends Model.TypedHttpModel = Model.TypedHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>
>(
  st: S,
  action: Redux.Action<Table.RowAddToGroupEvent>,
  columns: Table.Column<R, M>[]
): S => {
  /*
  When a Row is added to a Group, we first have to update the Group in state so that it
  includes the new row.  Then, we must recalculate the Group metrics (if applicable)
  to reflect the new Row(s) it contains.
  */
  const e: Table.RowAddToGroupEvent = action.payload;

  const ids: Table.ModelRowId[] = Array.isArray(e.payload.rows) ? e.payload.rows : [e.payload.rows];

  const g: Table.GroupRow<R> | null = groupRowFromState<R, S>(action, st, e.payload.group);
  if (!isNil(g)) {
    const rws = redux.reducers.findModelsInData<Table.ModelRow<R>>(
      action,
      filter(st.data, (r: Table.BodyRow<R>) => typeguards.isModelRow(r)) as Table.ModelRow<R>[],
      uniq([...ids, ...g.children])
    );
    return {
      ...st,
      data: data.orderTableRows<R, M>(
        util.replaceInArray<Table.BodyRow<R>>(
          st.data,
          { id: g.id },
          {
            ...g,
            children: map(rws, (r: Table.ModelRow<R>) => r.id),
            data: rows.updateGroupRowData<R, M>({
              columns,
              data: g.data
            })
          }
        )
      )
    };
  }
  return st;
};

const removeRowsFromTheirGroupsIfTheyExist = <
  R extends Table.RowData,
  M extends Model.TypedHttpModel = Model.TypedHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>
>(
  st: S,
  action: Redux.Action,
  rowIds: (Table.ModelRowId | Table.ModelRow<R>)[],
  columns: Table.Column<R, M>[]
): S => {
  // Keep track of which groups were altered and what their most recent children were after all
  // alterations, because it will be faster to recalculate the groups in the state after so we can
  // only recalculate each group once.
  type Alteration = {
    groupRow: Table.GroupRow<R>;
    children: number[];
  };
  type AlteredGroups = { [key: Table.GroupRowId]: Alteration };
  let alteredGroupsWithChildren: AlteredGroups = reduce(
    rowIds,
    (alterations: AlteredGroups, rowId: Table.ModelRowId | Table.ModelRow<R>) => {
      let r: Table.ModelRow<R> | null = null;
      if (typeof rowId === "number" || typeof rowId === "string") {
        r = redux.reducers.modelFromState<Table.ModelRow<R>>(
          action,
          filter(st.data, (ri: Table.BodyRow<R>) => typeguards.isDataRow(ri)) as Table.ModelRow<R>[],
          rowId
        );
      } else {
        r = rowId;
      }
      if (!isNil(r)) {
        let groupRow = rowGroupRowFromState<R, S>(action, st, r.id, { warnIfMissing: false });
        if (!isNil(groupRow)) {
          // This will be overwrittten if a group belongs to multiple rows associated with the provided
          // IDS - but that is what we want, because we want the final values to have the most up to
          // date children for each group after all alterations.
          const modelId = r.id;
          return {
            ...alterations,
            [groupRow.id]: { groupRow, children: filter(groupRow.children, (id: number) => id !== modelId) }
          };
        }
      }
      return alterations;
    },
    {}
  );
  st = reduce(
    alteredGroupsWithChildren,
    (s: S, alteration: Alteration) => {
      return {
        ...s,
        data: util.replaceInArray<Table.BodyRow<R>>(
          st.data,
          { id: alteration.groupRow.id },
          {
            ...alteration.groupRow,
            children: alteration.children,
            data: rows.updateGroupRowData<R, M>({
              columns,
              data: alteration.groupRow.data
            })
          }
        )
      };
    },
    st
  );
  return st;
};

const rowDeleteReducer = <
  R extends Table.RowData,
  M extends Model.TypedHttpModel = Model.TypedHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>
>(
  st: S,
  action: Redux.Action<Table.RowDeleteEvent>,
  columns: Table.Column<R, M>[]
): S => {
  /*
  When a Row is deleted, we first have to create a dichotomy of the rows we are deleting.

  (1) Group Rows
  (2) Markup Rows
  (3) Model Rows
  (4) Placeholder Rows

  For Markup and Model Rows, we first have to remove the rows that we are going to delete
  from their respective groups (if they exist).  When this is done, the row data for the
  groups will also be calculated based on the new set of rows belonging to each group.

  Then, we need to actually remove the rows, whether they are group rows or non-group rows from
  the state.
  */
  const e: Table.RowDeleteEvent = action.payload;
  const ids: Table.RowId[] = Array.isArray(e.payload.rows) ? e.payload.rows : [e.payload.rows];

  const modelRows: Table.ModelRow<R>[] = redux.reducers.findModelsInData<Table.ModelRow<R>>(
    action,
    filter(st.data, (r: Table.BodyRow<R>) => typeguards.isModelRow(r)) as Table.ModelRow<R>[],
    filter(ids, (id: Table.ModelRowId | Table.MarkupRowId) => typeguards.isModelRowId(id)) as Table.ModelRowId[]
  );

  st = removeRowsFromTheirGroupsIfTheyExist(st, action, modelRows, columns);
  return {
    ...st,
    data: data.orderTableRows<R, M>(filter(st.data, (ri: Table.BodyRow<R>) => !includes(ids, ri.id)))
  };
};

export const createTableChangeEventReducer = <
  R extends Table.RowData,
  M extends Model.TypedHttpModel = Model.TypedHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
  A extends Redux.AuthenticatedTableActionMap<R, M> = Redux.AuthenticatedTableActionMap<R, M>
>(
  config: Table.ReducerConfig<R, M, S, A> & {
    readonly recalculateRow?: (
      state: S,
      action: Redux.Action<Table.ChangeEvent<R, M>>,
      row: Table.DataRow<R>
    ) => Partial<R>;
  },
  options?: Pick<Redux.FindModelOptions, "name">
): Redux.Reducer<S, Redux.Action<Table.ChangeEvent<R, M>>> => {
  return (state: S = config.initialState, action: Redux.Action<Table.ChangeEvent<R, M>>): S => {
    let newState: S = { ...state };

    const e: Table.ChangeEvent<R, M> = action.payload;

    if (typeguards.isDataChangeEvent<R>(e)) {
      const consolidated = events.consolidateRowChanges(e.payload);

      // Note: This grouping may be redundant - we should investigate.
      let changesPerRow: {
        [key: ID]: { changes: Table.RowChange<R>[]; row: Table.EditableRow<R> };
      } = {};
      for (let i = 0; i < consolidated.length; i++) {
        if (isNil(changesPerRow[consolidated[i].id])) {
          /* eslint-disable no-loop-func */
          const r: Table.EditableRow<R> | null = redux.reducers.findModelInData<Table.EditableRow<R>>(
            action,
            filter(newState.data, (ri: Table.BodyRow<R>) => typeguards.isEditableRow(ri)) as Table.EditableRow<R>[],
            consolidated[i].id,
            options
          );
          // We do not apply manual updates via the reducer for Group row data.
          if (!isNil(r)) {
            changesPerRow[consolidated[i].id] = { changes: [], row: r };
          }
        }
        if (!isNil(changesPerRow[consolidated[i].id])) {
          changesPerRow[consolidated[i].id] = {
            ...changesPerRow[consolidated[i].id],
            changes: [...changesPerRow[consolidated[i].id].changes, consolidated[i]]
          };
        }
      }
      // For each Row that was changed, apply that change to the Row stored in state.
      let modifiedRows: Table.EditableRow<R>[] = [];
      newState = reduce(
        changesPerRow,
        (s: S, dt: { changes: Table.RowChange<R>[]; row: Table.EditableRow<R> }) => {
          let r: Table.EditableRow<R> = reduce(
            dt.changes,
            (ri: Table.EditableRow<R>, change: Table.RowChange<R>) => rows.mergeChangesWithRow<R>(ri.id, ri, change),
            dt.row
          );
          if (!isNil(config.recalculateRow) && typeguards.isDataRow(r)) {
            r = { ...r, data: { ...r.data, ...config.recalculateRow(s, action, r) } };
          }
          modifiedRows = [...modifiedRows, r];
          return {
            ...s,
            data: util.replaceInArray<Table.BodyRow<R>>(s.data, { id: r.id }, r)
          };
        },
        newState
      );
      const groupsWithRowsThatChanged: Table.GroupRow<R>[] = filter(
        filter(newState.data, (r: Table.BodyRow<R>) => typeguards.isGroupRow(r)) as Table.GroupRow<R>[],
        (row: Table.GroupRow<R>) => {
          return (
            intersection(
              row.children,
              map(
                filter(modifiedRows, (r: Table.EditableRow<R>) => typeguards.isModelRow(r)) as Table.ModelRow<R>[],
                (r: Table.ModelRow<R>) => r.id
              )
            ).length !== 0
          );
        }
      );
      newState = reduce(
        groupsWithRowsThatChanged,
        (s: S, groupRow: Table.GroupRow<R>) => {
          return {
            ...s,
            data: util.replaceInArray<Table.BodyRow<R>>(
              s.data,
              { id: groupRow.id },
              rows.updateGroupRow<R, M>({
                columns: config.columns,
                row: groupRow
              })
            )
          };
        },
        newState
      );
    } else if (typeguards.isModelUpdatedEvent(e)) {
      const modelRow: Table.ModelRow<R> | null = redux.reducers.modelFromState<Table.ModelRow<R>>(
        action,
        filter(newState.data, (ri: Table.BodyRow<R>) => typeguards.isModelRow(ri)) as Table.ModelRow<R>[],
        e.payload.id
      );
      if (!isNil(modelRow)) {
        newState = {
          ...newState,
          data: util.replaceInArray<Table.BodyRow<R>>(
            newState.data,
            { id: modelRow.id },
            rows.createModelRow<R, M>({
              originalIndex: modelRow.originalIndex,
              model: e.payload,
              columns: config.columns,
              getRowChildren: config.getModelRowChildren
            })
          )
        };
      }
    } else if (typeguards.isRowAddEvent(e)) {
      const payload: Table.RowAdd<R>[] = Array.isArray(e.payload) ? e.payload : [e.payload];
      newState = {
        ...newState,
        data: data.orderTableRows<R, M>(
          reduce(
            payload,
            (d: Table.BodyRow<R>[], addition: Table.RowAdd<R>) => {
              return [
                ...d,
                rows.createPlaceholderRow<R, M>({
                  id: addition.id,
                  data: addition.data,
                  columns: config.columns,
                  originalIndex: filter(data, (r: Table.BodyRow<R>) => typeguards.isDataRow(r)).length
                })
              ];
            },
            newState.data
          )
        )
      };
      applicationEvents.dispatchRowsAddedEvent({ tableId: config.tableId, numRows: newState.data.length });
    } else if (typeguards.isRowDeleteEvent(e)) {
      newState = rowDeleteReducer(newState, action as Redux.Action<Table.RowDeleteEvent>, config.columns);
    } else if (typeguards.isRowRemoveFromGroupEvent(e)) {
      newState = rowRemoveFromGroupReducer(
        newState,
        action as Redux.Action<Table.RowRemoveFromGroupEvent>,
        config.columns
      );
    } else if (typeguards.isRowAddToGroupEvent(e)) {
      newState = rowAddToGroupReducer(newState, action as Redux.Action<Table.RowAddToGroupEvent>, config.columns);
    } else if (typeguards.isGroupAddedEvent(e)) {
      /*
      When a Group is added to the table, we must first convert that Group model to a
      GroupRow - then, we need to insert the GroupRow into the set of table data and reapply
      the ordering scheme on the overall set of table data so the GroupRow aappears in the
      correct location.

      When a Group is created, it may be created with children that already belong to another
      Group.  In this case, the backend will automatically remove those children from the previous
      Group they belonged to - but we also need to apply that change in the reducer here.
      */
      const newGroupRow: Table.GroupRow<R> = rows.createGroupRow<R, M>({
        columns: config.columns,
        model: e.payload
      });
      const groupsWithChild: Table.GroupRow<R>[] = filter(
        newState.data,
        (r: Table.Row<R>) => typeguards.isGroupRow(r) && intersection(r.children, newGroupRow.children).length !== 0
      ) as Table.GroupRow<R>[];
      newState = reduce(
        groupsWithChild,
        (st: S, group: Table.GroupRow<R>) => {
          return {
            ...st,
            data: util.replaceInArray<Table.BodyRow<R>>(
              st.data,
              { id: group.id },
              {
                ...group,
                children: filter(group.children, (id: number) => !includes(newGroupRow.children, id))
              }
            )
          };
        },
        newState
      );
      newState = {
        ...newState,
        data: data.orderTableRows<R, M>([...newState.data, newGroupRow])
      };
    } else if (typeguards.isGroupUpdateEvent(e)) {
      /*
      When a Group is updated, it may be updated with children that already belong to another
      Group.  In this case, the backend will automatically remove those children from the previous
      Group they belonged to - but we also need to apply that change in the reducer here.
      */
      const groupRow: Table.GroupRow<R> | null = groupRowFromState<R, S>(
        action,
        newState,
        rows.groupRowId(e.payload.id)
      );
      if (!isNil(groupRow)) {
        const newGroupRow: Table.GroupRow<R> = rows.updateGroupRow<R, M>({
          model: e.payload.data,
          columns: config.columns,
          row: groupRow
        });
        const groupsWithChild: Table.GroupRow<R>[] = filter(
          newState.data,
          (r: Table.Row<R>) => typeguards.isGroupRow(r) && intersection(r.children, newGroupRow.children).length !== 0
        ) as Table.GroupRow<R>[];
        newState = reduce(
          groupsWithChild,
          (st: S, group: Table.GroupRow<R>) => {
            return {
              ...st,
              data: util.replaceInArray<Table.BodyRow<R>>(
                st.data,
                { id: group.id },
                {
                  ...group,
                  children: filter(group.children, (id: number) => !includes(newGroupRow.children, id))
                }
              )
            };
          },
          newState
        );
        newState = {
          ...newState,
          data: data.orderTableRows<R, M>(
            util.replaceInArray<Table.BodyRow<R>>(newState.data, { id: groupRow.id }, newGroupRow)
          )
        };
      }
    }
    return newState;
  };
};

export const createTableReducer = <
  R extends Table.RowData,
  M extends Model.TypedHttpModel = Model.TypedHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
  A extends Redux.TableActionMap<M> = Redux.TableActionMap<M>
>(
  config: Table.ReducerConfig<R, M, S, A>
): Redux.Reducer<S> => {
  return (state: S | undefined = config.initialState, action: Redux.Action<any>): S => {
    let newState: S = { ...state };

    if (
      (!isNil(config.actions.request) && action.type === config.actions.request.toString()) ||
      action.type === config.actions.clear.toString()
    ) {
      newState = { ...newState, data: [], models: [], groups: [] };
    } else if (action.type === config.actions.response.toString()) {
      const response: Http.TableResponse<M> = action.payload;
      if (!isNil(config.createTableRows)) {
        newState = {
          ...newState,
          data: config.createTableRows({
            ...config,
            response
          })
        };
      } else {
        newState = {
          ...newState,
          data: data.createTableRows<R, M>({
            ...config,
            response
          })
        };
      }
    } else if (action.type === config.actions.loading.toString()) {
      newState = { ...newState, loading: action.payload };
    } else if (action.type === config.actions.setSearch.toString()) {
      const search: string = action.payload;
      newState = { ...newState, search };
    }
    return newState;
  };
};

export const createUnauthenticatedTableReducer = <
  R extends Table.RowData,
  M extends Model.TypedHttpModel = Model.TypedHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>
>(
  config: Table.ReducerConfig<R, M, S, Redux.TableActionMap<M>>
): Redux.Reducer<S> => {
  return createTableReducer<R, M, S, Redux.TableActionMap<M>>(config);
};

export const createAuthenticatedTableReducer = <
  R extends Table.RowData,
  M extends Model.TypedHttpModel = Model.TypedHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
  A extends Redux.AuthenticatedTableActionMap<R, M> = Redux.AuthenticatedTableActionMap<R, M>
>(
  config: Table.ReducerConfig<R, M, S, A> & {
    readonly eventReducer?: Redux.Reducer<S>;
    readonly recalculateRow?: (state: S, action: Redux.Action, row: Table.DataRow<R>) => Partial<R>;
  }
): Redux.Reducer<S> => {
  const tableEventReducer = config.eventReducer || createTableChangeEventReducer<R, M, S, A>(config);
  const generic = createTableReducer<R, M, S, A>(config);
  return (state: S | undefined = config.initialState, action: Redux.Action<any>): S => {
    let newState = generic(state, action);

    if (action.type === config.actions.tableChanged.toString()) {
      newState = tableEventReducer(newState, action);
    } else if (action.type === config.actions.saving.toString()) {
      newState = { ...newState, saving: action.payload };
    } else if (action.type === config.actions.addModelsToState.toString()) {
      const payload: Redux.AddModelsToTablePayload<M> = action.payload;
      newState = reduce(
        payload.placeholderIds,
        (s: S, id: Table.PlaceholderRowId, index: number) => {
          const r: Table.PlaceholderRow<R> | null = redux.reducers.findModelInData<Table.PlaceholderRow<R>>(
            action,
            filter(newState.data, (ri: Table.BodyRow<R>) =>
              typeguards.isPlaceholderRow(ri)
            ) as Table.PlaceholderRow<R>[],
            id
          );
          if (!isNil(r)) {
            return {
              ...newState,
              data: util.replaceInArray<Table.BodyRow<R>>(
                s.data,
                { id: r.id },
                rows.createModelRow({
                  model: payload.models[index],
                  columns: config.columns,
                  originalIndex: r.originalIndex
                })
              )
            };
          }
          return s;
        },
        newState
      );
    } else if (
      !isNil(config.actions.updateModelsInState) &&
      action.type === config.actions.updateModelsInState.toString()
    ) {
      const models: M[] = Array.isArray(action.payload) ? action.payload : [action.payload];
      newState = reduce(
        models,
        (s: S, m: M) => {
          const r: Table.ModelRow<R> | null = redux.reducers.findModelInData(
            action,
            filter(newState.data, (ri: Table.BodyRow<R>) => typeguards.isModelRow(ri)),
            m.id
          );
          if (!isNil(r)) {
            return {
              ...s,
              data: data.orderTableRows<R, M>(
                util.replaceInArray<Table.BodyRow<R>>(
                  s.data,
                  { id: r.id },
                  rows.createModelRow({
                    model: m,
                    columns: config.columns,
                    originalIndex: r.originalIndex
                  })
                )
              )
            };
          }
          return s;
        },
        newState
      );
    }
    return newState;
  };
};
