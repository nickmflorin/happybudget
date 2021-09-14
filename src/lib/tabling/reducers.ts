import { tabling } from "lib";
import { isNil, reduce, map, filter, includes, uniq } from "lodash";

import * as applicationEvents from "../events";
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
export const groupRowFromState = <
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group,
  S extends Redux.TableStore<R, M, G> = Redux.TableStore<R, M, G>
>(
  action: Redux.Action,
  st: S,
  id: Table.GroupRowId,
  rowId?: Table.DataRowID,
  options: Redux.FindModelOptions = { name: "Group", warnIfMissing: true }
): Table.GroupRow<R> | null => {
  let predicate = (g: Table.GroupRow<R>) => g.id === id;
  if (!isNil(rowId)) {
    predicate = (g: Table.GroupRow<R>) => g.id === id && includes(g.meta.children, rowId);
  }
  return redux.reducers.modelFromState<Table.GroupRow<R>>(
    action,
    filter(st.data, (r: Table.Row<R, M>) => tabling.typeguards.isGroupRow(r)) as Table.GroupRow<R>[],
    predicate,
    options
  );
};

/**
 * Returns (if present) the Group in state that belongs to a specific row.
 */
export const rowGroupRowFromState = <
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group,
  S extends Redux.TableStore<R, M, G> = Redux.TableStore<R, M, G>
>(
  action: Redux.Action,
  st: S,
  rowId: Table.DataRowID,
  options: Redux.FindModelOptions = { warnIfMissing: true }
): Table.GroupRow<R> | null => {
  const predicate = (g: Table.GroupRow<R>) => includes(g.meta.children, rowId);
  return redux.reducers.modelFromState<Table.GroupRow<R>>(
    action,
    filter(st.data, (r: Table.Row<R, M>) => tabling.typeguards.isGroupRow(r)) as Table.GroupRow<R>[],
    predicate,
    { ...options, name: "Group" }
  );
};

export const removeRowsFromAGroup = <
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group,
  S extends Redux.TableStore<R, M, G> = Redux.TableStore<R, M, G>
>(
  st: S,
  action: Redux.Action,
  rowIds: Table.DataRowID[],
  groupId: Table.GroupRowId,
  calculateGroup?: (rws: Table.DataRow<R, M>[]) => Partial<R>
): S => {
  const groupRow = groupRowFromState<R, M, G, S>(action, st, groupId);
  if (!isNil(groupRow)) {
    const newChildren: Table.DataRowID[] = filter(
      groupRow.meta.children,
      (child: Table.DataRowID) => !includes(rowIds, child)
    );
    const childrenRows: Table.DataRow<R, M>[] = redux.reducers.findModelsInData(
      action,
      filter(st.data, (r: Table.Row<R, M>) => tabling.typeguards.isDataRow(r)),
      newChildren
    );
    return {
      ...st,
      data: util.replaceInArray<Table.Row<R, M>>(
        st.data,
        { id: groupRow.id },
        { ...groupRow, ...calculateGroup?.(childrenRows), meta: { ...groupRow.meta, children: newChildren } }
      )
    };
  }
  return st;
};

export const removeRowsFromTheirGroupsIfTheyExist = <
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group,
  S extends Redux.TableStore<R, M, G> = Redux.TableStore<R, M, G>
>(
  st: S,
  action: Redux.Action,
  rowIds: (Table.DataRowID | Table.DataRow<R, M>)[],
  calculateGroup?: (rws: Table.DataRow<R, M>[]) => Partial<R>
): S => {
  // Keep track of which groups were altered and what their most recent children were after all
  // alterations, because it will be faster to recalculate the groups in the state after so we can
  // only recalculate each group once.
  type Alteration = { groupRow: Table.GroupRow<R>; children: Table.DataRowID[] };
  type AlteredGroups = { [key: Table.GroupRowId]: Alteration };
  let alteredGroupsWithChildren: AlteredGroups = reduce(
    rowIds,
    (alterations: AlteredGroups, rowId: Table.DataRowID | Table.DataRow<R, M>) => {
      let r: Table.DataRow<R, M> | null = null;
      if (typeof rowId === "number" || typeof rowId === "string") {
        r = redux.reducers.modelFromState<Table.DataRow<R, M>>(
          action,
          filter(st.data, (ri: Table.Row<R, M>) => typeguards.isDataRow(ri)) as Table.DataRow<R, M>[],
          rowId
        );
      } else {
        r = rowId;
      }
      if (!isNil(r)) {
        let groupRow = rowGroupRowFromState<R, M, G, S>(action, st, r.id);
        if (!isNil(groupRow)) {
          // This will be overwrittten if a group belongs to multiple rows associated with the provided
          // IDS - but that is what we want, because we want the final values to have the most up to
          // date children for each group after all alterations.
          return {
            ...alterations,
            [groupRow.id]: { groupRow, children: filter(groupRow.meta.children, (id: Table.DataRowID) => id !== rowId) }
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
      const childrenRows: Table.DataRow<R, M>[] = redux.reducers.findModelsInData(
        action,
        filter(s.data, (r: Table.Row<R, M>) => tabling.typeguards.isDataRow(r)) as Table.DataRow<R, M>[],
        alteration.children
      );
      const newGroupRow = {
        ...alteration.groupRow,
        meta: { ...alteration.groupRow.meta, children: alteration.children },
        ...calculateGroup?.(childrenRows)
      };
      return {
        ...s,
        data: util.replaceInArray<Table.Row<R, M>>(st.data, { id: newGroupRow.id }, newGroupRow)
      };
    },
    st
  );
  return st;
};

export const createTableChangeEventReducer = <
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group,
  S extends Redux.TableStore<R, M, G> = Redux.TableStore<R, M, G>
>(
  config: Table.ReducerConfig<R, M, G, S, Redux.AuthenticatedTableActionMap<R, M, G>> & {
    readonly recalculateRow?: (
      state: S,
      action: Redux.Action<Table.ChangeEvent<R, M, G>>,
      row: Table.DataRow<R, M>
    ) => Partial<R>;
    readonly calculateGroup?: (rws: Table.DataRow<R, M>[]) => Partial<R>;
  },
  options?: Pick<Redux.FindModelOptions, "name">
): Redux.Reducer<S, Redux.Action<Table.ChangeEvent<R, M, G>>> => {
  return (state: S = config.initialState, action: Redux.Action<Table.ChangeEvent<R, M, G>>): S => {
    let newState: S = { ...state };

    const e: Table.ChangeEvent<R, M, G> = action.payload;

    if (typeguards.isDataChangeEvent<R, M>(e)) {
      const consolidated = events.consolidateTableChange(e.payload);

      // Note: This grouping may be redundant - we should investigate.
      let changesPerRow: {
        [key: ID]: { changes: Table.RowChange<R, M>[]; row: Table.Row<R, M> };
      } = {};
      for (let i = 0; i < consolidated.length; i++) {
        if (isNil(changesPerRow[consolidated[i].id])) {
          /* eslint-disable no-loop-func */
          const r: Table.Row<R, M> | null = redux.reducers.findModelInData<Table.Row<R, M>>(
            action,
            newState.data,
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
      let newRows: Table.Row<R, M>[] = [];
      newState = reduce(
        changesPerRow,
        (s: S, dt: { changes: Table.RowChange<R, M>[]; row: Table.Row<R, M> }) => {
          let r: Table.Row<R, M> = reduce(
            dt.changes,
            (ri: Table.Row<R, M>, change: Table.RowChange<R, M>) => rows.mergeChangesWithRow<R, M>(ri.id, ri, change),
            dt.row
          );
          if (!isNil(config.recalculateRow) && tabling.typeguards.isDataRow(r)) {
            r = { ...r, ...config.recalculateRow(s, action, r) };
          }
          newRows = [...newRows, r];
          return {
            ...s,
            data: util.replaceInArray<Table.Row<R, M>>(s.data, { id: r.id }, r)
          };
        },
        newState
      );
      const recalculateGroup = config.calculateGroup;
      if (!isNil(recalculateGroup)) {
        const groupsWithRowsChanged: { group: Table.GroupRow<R>; rows: Table.DataRow<R, M>[] }[] =
          rows.findDistinctRowsForEachGroupRow(
            filter(newRows, (ri: Table.Row<R, M>) => tabling.typeguards.isDataRow(ri)) as Table.DataRow<R, M>[],
            filter(newState.data, (r: Table.Row<R, M>) => tabling.typeguards.isGroupRow(r)) as Table.GroupRow<R>[]
          );
        newState = reduce(
          groupsWithRowsChanged,
          (s: S, relationship: { group: Table.GroupRow<R>; rows: Table.DataRow<R, M>[] }) => {
            const newGroup = { ...relationship.group, ...recalculateGroup(relationship.rows) };
            return {
              ...s,
              data: util.replaceInArray<Table.Row<R, M>>(s.data, { id: relationship.group.id }, newGroup)
            };
          },
          newState
        );
      }
    } else if (typeguards.isRowAddEvent(e)) {
      const payload: Table.RowAdd<R, M>[] = Array.isArray(e.payload) ? e.payload : [e.payload];
      newState = {
        ...newState,
        data: [
          ...newState.data,
          ...map(payload, (addition: Table.RowAdd<R, M>) =>
            rows.createPlaceholderRow<R, M>({
              id: addition.id,
              data: events.rowAddToRowData<R, M>(addition),
              columns: config.columns,
              getRowName: config.getPlaceholderRowName,
              getRowLabel: config.getPlaceholderRowLabel
            })
          )
        ]
      };
      applicationEvents.dispatchRowsAddedEvent({ tableId: config.tableId, numRows: newState.data.length });
    } else if (typeguards.isRowDeleteEvent(e)) {
      const ids = Array.isArray(e.payload.rows) ? e.payload.rows : [e.payload.rows];
      /*
      When a Row is deleted, we first have to create a dichotomy of the rows we are deleting.

      For non-group rows, we first have to remove the rows we are going to delete from their
      associated groups (if they are associated with any).  When we remove the references of the
      rows from their potential groups, we need to also recalculate the metrics on the group such that
      it is consistent with the row having been removed.

      Then, we need to actually remove the rows, whether they are group rows or non-group rows from the state.
      */
      const rws = redux.reducers.findModelsInData<Table.Row<R, M>>(action, newState.data, ids);
      const nonGroupRws = filter(rws, (rw: Table.Row<R, M>) => tabling.typeguards.isDataRow(rw)) as Table.DataRow<
        R,
        M
      >[];
      newState = removeRowsFromTheirGroupsIfTheyExist(newState, action, nonGroupRws, config.calculateGroup);
      newState = {
        ...newState,
        data: filter(newState.data, (ri: Table.Row<R, M>) => !includes(ids, ri.id))
      };
    } else if (typeguards.isRowRemoveFromGroupEvent(e)) {
      /*
      When a Row is removed from a Group, we first have to update the Row(s) in state so that they
      do not reference that Group, and also update the Group in state so it no longer references the
      row.  Then, we must recalculate the Group metrics (if applicable) to reflect the new Row(s) it
      contains.
      */
      const ids = Array.isArray(e.payload.rows) ? e.payload.rows : [e.payload.rows];
      newState = removeRowsFromAGroup<R, M, G, S>(newState, action as Redux.Action, ids, e.payload.group);
    } else if (typeguards.isRowAddToGroupEvent(e)) {
      /*
      When a Row is added to a Group, we first have to update the Group in state so that it
      includes the new row.  Then, we must recalculate the Group metrics (if applicable)
      to reflect the new Row(s) it contains.
      */
      const ids = Array.isArray(e.payload.rows) ? e.payload.rows : [e.payload.rows];
      const rws = redux.reducers.findModelsInData<Table.DataRow<R, M>>(
        action,
        filter(newState.data, (r: Table.Row<R, M>) => tabling.typeguards.isDataRow(r)) as Table.DataRow<R, M>[],
        ids
      );
      const g: Table.GroupRow<R> | null = groupRowFromState<R, M, G, S>(action, newState, e.payload.group);
      if (!isNil(g)) {
        const newChildren = uniq([...g.meta.children, map(rws, (r: Table.DataRow<R, M>) => r.id)]);
        newState = {
          ...newState,
          data: util.replaceInArray<Table.Row<R, M>>(
            newState.data,
            { id: g.id },
            { ...g, meta: { ...g.meta, children: newChildren }, ...config.calculateGroup?.(rws) }
          )
        };
      }
    } else if (typeguards.isGroupAddEvent(e)) {
      // ToDo: We should figure out a way to do this without having to regenerate the entire table
      // state.
      newState = {
        ...newState,
        groups: [...newState.groups, e.payload],
        data: data.createTableRows<R, M, G>({
          ...config,
          gridId: "data",
          models: newState.models,
          groups: [...newState.groups, e.payload]
        })
      };
    } else if (typeguards.isGroupUpdateEvent(e)) {
      /*
      Note: Eventually we are going to want to try to treat this the same as an update to a regular row.

      Right now, we are only really concerned with changes to the color or names field of the
      group, as everything else that would trigger mechanical recalculations is handled by separate
      events.
      */
      const group: G | null = groupRowFromState<R, M, G, S>(action, newState, e.payload.id);
      if (!isNil(group)) {
        newState = {
          ...newState,
          groups: util.replaceInArray<G>(newState.groups, { id: e.payload.id }, { ...group, ...e.payload.data })
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

    if (
      (!isNil(config.actions.request) && action.type === config.actions.request.toString()) ||
      action.type === config.actions.clear.toString()
    ) {
      newState = { ...newState, data: [], models: [], groups: [] };
    } else if (action.type === config.actions.response.toString()) {
      const payload: Http.TableResponse<M, G> = action.payload;
      newState = {
        ...newState,
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
    readonly recalculateRow?: (state: S, action: Redux.Action, row: Table.DataRow<R, M>) => Partial<R>;
    readonly calculateGroup?: (rws: Table.DataRow<R, M>[]) => Partial<R>;
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
            return {
              ...newState,
              data: util.replaceInArray<Table.Row<R, M>>(
                s.data,
                { id: r.id },
                rows.createModelRow({
                  gridId: "data",
                  model: payload.models[index],
                  columns: config.columns,
                  getRowName: config.getModelRowName,
                  getRowLabel: config.getModelRowLabel
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
