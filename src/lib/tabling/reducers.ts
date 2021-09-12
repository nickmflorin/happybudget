import { isNil, reduce, map, filter, includes, uniq } from "lodash";
import * as redux from "../redux";
import * as util from "../util";
import * as data from "./data";
import * as events from "./events";
import * as rows from "./rows";
import * as typeguards from "./typeguards";

/* eslint-disable indent */
/**
 * Returns (if present) the Group in state with a provided ID.  If the rowId is also
 * provided, it will only return the Group if that Group also pertains to the specific
 * rowId.
 */
export const groupFromState = <
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group,
  S extends Redux.TableStore<R, M, G> = Redux.TableStore<R, M, G>
>(
  action: Redux.Action,
  st: S,
  id: G | ID,
  rowId?: Table.RowID,
  options: Redux.FindModelOptions = { name: "Group", warnIfMissing: true }
): G | null => {
  if (typeof id === "number" || typeof id === "string") {
    let predicate = (g: G) => g.id === id;
    if (!isNil(rowId)) {
      predicate = (g: G) => g.id === id && includes(g.children, rowId);
    }
    return redux.reducers.modelFromState<G>(action, st.groups, predicate, options);
  }
  return id;
};

/**
 * Returns (if present) the Group in state that belongs to a specific row.
 */
export const rowGroupFromState = <
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group,
  S extends Redux.TableStore<R, M, G> = Redux.TableStore<R, M, G>
>(
  action: Redux.Action,
  st: S,
  rowId: Table.RowID,
  options: Redux.FindModelOptions = { warnIfMissing: true }
): G | null => {
  const predicate = (g: G) => includes(g.children, rowId);
  return redux.reducers.modelFromState<G>(action, st.groups, predicate, {
    ...options,
    name: "Group"
  });
};

export const removeRowFromGroup = <
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group,
  S extends Redux.TableStore<R, M, G> = Redux.TableStore<R, M, G>
>(
  action: Redux.Action,
  st: S,
  id: Table.RowID,
  group?: ID,
  options: Redux.FindModelOptions = { warnIfMissing: true }
): [S, ID | null] => {
  let newGroup: G | null = null;
  const r = redux.reducers.modelFromState<Table.DataRow<R, M>>(
    action,
    filter(st.data, (ri: Table.Row<R, M>) => typeguards.isDataRow(ri)) as Table.DataRow<R, M>[],
    id
  );
  if (!isNil(r)) {
    newGroup = !isNil(group)
      ? groupFromState<R, M, G, S>(action, st, group, id)
      : rowGroupFromState<R, M, G, S>(action, st, r.id, options);
    if (!isNil(newGroup)) {
      newGroup = {
        ...newGroup,
        children: filter(newGroup.children, (child: number) => child !== r.id)
      };
      st = {
        ...st,
        groups: {
          ...st.groups,
          data: util.replaceInArray<G>(st.groups, { id: newGroup.id }, newGroup)
        }
      };
    }
  }
  return [st, !isNil(newGroup) ? newGroup.id : null];
};

export const removeRowsFromGroup = <
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group,
  S extends Redux.TableStore<R, M, G> = Redux.TableStore<R, M, G>
>(
  st: S,
  action: Redux.Action,
  rws: Table.DataRowID[],
  group?: ID,
  options: Redux.FindModelOptions = { warnIfMissing: true }
): [S, ID[]] => {
  let groups: ID[] = [];
  st = reduce(
    rws,
    (s: S, row: Table.DataRowID) => {
      const [newState, updatedGroup] = removeRowFromGroup<R, M, G, S>(action, st, row, group, options);
      groups = !isNil(updatedGroup) ? [...groups, updatedGroup] : groups;
      return newState;
    },
    st
  );
  return [st, uniq(groups)];
};

export const createTableChangeEventReducer = <
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group,
  S extends Redux.TableStore<R, M, G> = Redux.TableStore<R, M, G>
>(
  config: Table.ReducerConfig<R, M, G, S, Redux.AuthenticatedTableActionMap<R, M, G>> & {
    readonly recalculateRow?: (state: S, action: Redux.Action, row: Table.DataRow<R, M>) => Table.DataRow<R, M>;
    readonly recalculateGroup?: (state: S, action: Redux.Action, group: G) => G;
  },
  options?: Pick<Redux.FindModelOptions, "name">
): Redux.Reducer<S, Redux.Action<Table.ChangeEvent<R, M>>> => {
  type EventWarrantingGroupRecalculation =
    | Table.DataChangeEvent<R, M>
    | Table.RowAddEvent<R, M>
    | Table.RowDeleteEvent<R, M>
    | Table.RowRemoveFromGroupEvent<R, M>
    | Table.RowAddToGroupEvent<R, M>;

  const recalculateGroupMetricsIfApplicable = (
    s: S,
    action: Redux.Action<EventWarrantingGroupRecalculation>,
    group: G | ID
  ): S => {
    const e: EventWarrantingGroupRecalculation = action.payload;
    if (events.eventWarrantsGroupRecalculation(e) && !isNil(config.recalculateGroup)) {
      if (typeof group === "number" || typeof group === "string") {
        const g: G | null = groupFromState<R, M, G, S>(action, s, group);
        if (!isNil(g)) {
          const newG = config.recalculateGroup(s, action, g);
          return {
            ...s,
            groups: util.replaceInArray<G>(s.groups, { id: g.id }, newG)
          };
        }
        return s;
      }
      const newG = config.recalculateGroup(s, action, group);
      return {
        ...s,
        groups: util.replaceInArray<G>(s.groups, { id: group.id }, newG)
      };
    }
    return s;
  };

  return (state: S = config.initialState, action: Redux.Action<Table.ChangeEvent<R, M>>): S => {
    let newState: S = { ...state };

    const e: Table.ChangeEvent<R, M> = action.payload;

    if (typeguards.isDataChangeEvent<R, M>(e)) {
      const consolidated = events.consolidateTableChange(e.payload);

      // Note: This grouping may be redundant - we should investigate.
      let changesPerRow: {
        [key: ID]: { changes: Table.RowChange<R, M>[]; row: Table.DataRow<R, M> };
      } = {};
      for (let i = 0; i < consolidated.length; i++) {
        if (isNil(changesPerRow[consolidated[i].id])) {
          /* eslint-disable no-loop-func */
          const r: Table.DataRow<R, M> | null = redux.reducers.findModelInData<Table.DataRow<R, M>>(
            action,
            filter(newState.data, (ri: Table.Row<R, M>) => typeguards.isDataRow(ri)) as Table.DataRow<R, M>[],
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
      newState = reduce(
        changesPerRow,
        (s: S, dt: { changes: Table.RowChange<R, M>[]; row: Table.DataRow<R, M> }) => {
          let r: Table.DataRow<R, M> = reduce(
            dt.changes,
            (ri: Table.DataRow<R, M>, change: Table.RowChange<R, M>) =>
              rows.mergeChangesWithRow<R, M>(ri.id, ri, change),
            dt.row
          );
          /*
          If there were changes to the Row that are associated with columns designated "isCalculating",
          a recalculation of Row metrics is triggered.  This is pertinent for SubAccount rows in particular,
          where a change in one Row field might mean another Row field needs to be recalculated.
          */
          if (!isNil(config.recalculateRow) && events.changeOrAddWarrantsRecalculation(dt.changes)) {
            r = config.recalculateRow(s, action, r);
          }
          s = {
            ...s,
            data: util.replaceInArray<Table.Row<R, M>>(s.data, { id: r.id }, r)
          };
          /*
          If there were changes to the Row that are associated with columns designated "isCalculating",
          a recalculation of Group metrics for the Group that the Row may or may not belong to is
          triggered.  This is pertinent for SubAccount rows in particular, where a change in one Row
          field might mean the Row's Group might need to be updated.
          */
          if (events.eventWarrantsGroupRecalculation(e) && !isNil(config.recalculateGroup)) {
            const rowGroup = rowGroupFromState<R, M, G, S>(action, s, r.id, {
              name: "Group",
              warnIfMissing: false
            });
            // The Group may not necessarily exist for the Row.
            if (!isNil(rowGroup)) {
              s = recalculateGroupMetricsIfApplicable(s, action as Redux.Action<Table.DataChangeEvent<R, M>>, rowGroup);
            }
          }
          return s;
        },
        newState
      );
    } else if (typeguards.isRowAddEvent(e)) {
      // ToDo: This is where we need to scroll to the bottom of the table.
      const payload: Table.RowAdd<R, M>[] = Array.isArray(e.payload) ? e.payload : [e.payload];
      newState = {
        ...newState,
        data: [
          ...newState.data,
          // ToDo: We might want to account for potential group edge cases.
          ...map(payload, (addition: Table.RowAdd<R, M>) =>
            rows.createPlaceholderRow<R, M, G>({
              id: addition.id,
              data: events.rowAddToRowData<R, M>(addition),
              columns: config.columns,
              group: null,
              getRowColorDef: config.getPlaceholderRowColorDef,
              getRowName: config.getPlaceholderRowName,
              getRowLabel: config.getPlaceholderRowLabel
            })
          )
        ]
      };
    } else if (typeguards.isRowDeleteEvent(e)) {
      const ids = Array.isArray(e.payload.rows)
        ? map(e.payload.rows, (row: Table.DataRow<R, M>) => row.id)
        : [e.payload.rows.id];
      const [updatedState, groups] = removeRowsFromGroup(newState, action as Redux.Action, ids, undefined, {
        warnIfMissing: false
      });
      newState = { ...updatedState };
      newState = reduce(
        ids,
        (s: S, id: ID) => {
          const r = redux.reducers.modelFromState<Table.DataRow<R, M>>(
            action,
            filter(s.data, (ri: Table.Row<R, M>) => typeguards.isDataRow(ri)) as Table.DataRow<R, M>[],
            id
          );
          if (!isNil(r)) {
            if (typeguards.isGroupRow(r)) {
              /* eslint-disable no-console */
              console.error("Suspicious behavior!  User dispatched event to delete group row.");
              return s;
            }
            return {
              ...s,
              data: filter(s.data, (mi: Table.DataRow<R, M>) => mi.id !== r.id)
            };
          }
          return s;
        },
        newState
      );
      if (events.eventWarrantsGroupRecalculation(e) && !isNil(config.recalculateGroup)) {
        newState = reduce(
          groups,
          (s: S, id: ID) =>
            recalculateGroupMetricsIfApplicable(s, action as Redux.Action<Table.RowDeleteEvent<R, M>>, id),
          newState
        );
      }
    } else if (typeguards.isRowRemoveFromGroupEvent(e)) {
      /*
      When a Row is removed from a Group, we first have to update the Row(s) in state so that they
      do not reference that Group.  Then, we must recalculate the Group metrics (if applicable)
      to reflect the new Row(s) it contains.
      */
      const ids = Array.isArray(e.payload.rows)
        ? map(e.payload.rows, (row: Table.DataRow<R, M>) => row.id)
        : [e.payload.rows.id];
      const [updatedState, groups] = removeRowsFromGroup<R, M, G, S>(
        newState,
        action as Redux.Action,
        ids,
        e.payload.group
      );
      newState = reduce(
        groups,
        (s: S, id: ID) =>
          recalculateGroupMetricsIfApplicable(s, action as Redux.Action<EventWarrantingGroupRecalculation>, id),
        updatedState
      );
    } else if (typeguards.isRowAddToGroupEvent(e)) {
      /*
      When a Row is added to a Group, we first have to update the Row(s) in state so that they
      reference that new Group.  Then, we must recalculate the Group metrics (if applicable)
      to reflect the new Row(s) it contains.
      */
      const ids = Array.isArray(e.payload.rows)
        ? map(e.payload.rows, (row: Table.DataRow<R, M>) => row.id)
        : [e.payload.rows.id];
      newState = reduce(
        ids,
        (s: S, id: ID): S => {
          const row = redux.reducers.modelFromState<Table.DataRow<R, M>>(
            action,
            filter(s.data, (r: Table.Row<R, M>) => typeguards.isDataRow(r)) as Table.DataRow<R, M>[],
            id
          );
          if (!isNil(row)) {
            const g: G | null = groupFromState<R, M, G, S>(action, s, e.payload.group);
            if (!isNil(g)) {
              if (includes(g.children, row.id)) {
                redux.util.warnInconsistentState({
                  action,
                  reason: "Row already exists as a child for group.",
                  id: row.id,
                  group: g.id
                });
                return s;
              } else {
                return {
                  ...s,
                  groups: util.replaceInArray<G>(s.groups, { id: g.id }, { ...g, children: [...g.children, row.id] })
                };
              }
            }
          }
          return s;
        },
        newState
      ) as S;
      newState = recalculateGroupMetricsIfApplicable(
        newState,
        action as Redux.Action<EventWarrantingGroupRecalculation>,
        e.payload.group
      );
    } else if (typeguards.isGroupDeleteEvent(e)) {
      // When we are deleting a Group, we do not need to worry about any recalculations of that
      // Group because the Group itself is being removed.
      const group: G | null = groupFromState<R, M, G, S>(action, newState, e.payload);
      if (!isNil(group)) {
        newState = {
          ...newState,
          groups: filter(newState.groups, (g: G) => g.id !== e.payload)
        };
      }
    }
    return newState;
  };
};

export const createTableReducer = <
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group,
  S extends Redux.TableStore<R, M, G> = Redux.TableStore<R, M, G>,
  A extends Redux.TableActionMap<M, G> = Redux.TableActionMap<M, G>
>(
  config: Table.ReducerConfig<R, M, G, S, A>
): Redux.Reducer<S> => {
  return (state: S | undefined = config.initialState, action: Redux.Action<any>): S => {
    let newState: S = { ...state };

    if (action.type === config.actions.request.toString()) {
      newState = { ...newState, responseWasReceived: false, data: [] };
    } else if (action.type === config.actions.response.toString()) {
      // ToDo: It might make a lot more sense to dispatch all of the table data in one swoop after
      // it is all collected, to avoid unnecessary rerenders!
      const payload: Http.TableResponse<M, G> = action.payload;
      newState = {
        ...newState,
        responseWasReceived: true,
        models: !isNil(payload.models) ? payload.models.data : newState.models,
        groups: !isNil(payload.groups) ? payload.groups.data : newState.groups,
        data: data.createTableRows<R, M, G>({
          ...config,
          gridId: "data",
          models: !isNil(payload.models) ? payload.models.data : newState.models,
          groups: !isNil(payload.groups) ? payload.groups.data : newState.groups
        })
      };
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
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group,
  S extends Redux.TableStore<R, M, G> = Redux.TableStore<R, M, G>
>(
  config: Table.ReducerConfig<R, M, G, S>
): Redux.Reducer<S> => {
  return createTableReducer<R, M, G, S>(config);
};

export const createAuthenticatedTableReducer = <
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group,
  S extends Redux.TableStore<R, M, G> = Redux.TableStore<R, M, G>
>(
  config: Table.ReducerConfig<R, M, G, S, Redux.AuthenticatedTableActionMap<R, M, G>> & {
    readonly eventReducer?: Redux.Reducer<S>;
    readonly recalculateRow?: (state: S, action: Redux.Action, row: Table.DataRow<R, M>) => Table.DataRow<R, M>;
    readonly recalculateGroup?: (state: S, action: Redux.Action, group: G) => G;
  }
): Redux.Reducer<S> => {
  const tableEventReducer = config.eventReducer || createTableChangeEventReducer<R, M, G, S>(config);
  const generic = createTableReducer<R, M, G, S>(config);
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
            filter(newState.data, (ri: Table.Row<R, M>) =>
              typeguards.isPlaceholderRow(ri)
            ) as Table.PlaceholderRow<R>[],
            id
          );
          if (!isNil(r)) {
            const model: M = payload.models[index];
            return {
              ...newState,
              data: util.replaceInArray<Table.Row<R, M>>(
                s.data,
                { id: r.id },
                rows.createModelRow({
                  gridId: "data",
                  model: payload.models[index],
                  columns: config.columns,
                  getRowColorDef: config.getModelRowColorDef,
                  getRowName: config.getModelRowName,
                  getRowLabel: config.getModelRowLabel,
                  // This would be an edge case, but if the newly created model is somehow otherwise
                  // associated with a group, we need to provide that information to the row generator.
                  group: rowGroupFromState<R, M, G, S>(action, s, model.id, {
                    name: "Group",
                    warnIfMissing: false
                  })
                })
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
