import { tabling } from "lib";
import { isNil, reduce, map, filter, includes, intersection } from "lodash";

import * as applicationEvents from "../events";
import * as redux from "../redux";
import * as util from "../util";
import * as data from "./data";
import * as events from "./events";
import * as rows from "./rows";
import * as typeguards from "./typeguards";

/* eslint-disable indent */
/**
 * Returns (if present) the GroupRow in state with a provided ID.  If the rowId is also
 * provided, it will only return the GroupRow if that GroupRow also pertains to the
 * specific rowId.
 */
export const groupRowFromState = <
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  S extends Redux.TableStore<R, M> = Redux.TableStore<R, M>
>(
  action: Redux.Action,
  st: S,
  id: Table.GroupRowId,
  rowId?: Table.ModelRowId | Table.MarkupRowId,
  options: Redux.FindModelOptions = { name: "Group", warnIfMissing: true }
): Table.GroupRow<R> | null => {
  let predicate = (g: Table.GroupRow<R>) => g.id === id;
  if (!isNil(rowId)) {
    if (tabling.typeguards.isMarkupRowId(rowId)) {
      predicate = (g: Table.GroupRow<R>) =>
        g.id === id && includes(g.children_markups, parseInt(rowId.split("markup-")[1]));
    } else {
      predicate = (g: Table.GroupRow<R>) => g.id === id && includes(g.children, rowId);
    }
  }
  return redux.reducers.modelFromState<Table.GroupRow<R>>(
    action,
    filter(st.data, (r: Table.Row<R, M>) => tabling.typeguards.isGroupRow(r)) as Table.GroupRow<R>[],
    predicate,
    options
  );
};

/**
 * Returns (if present) the Group in state that a specific row belongs to.
 */
export const rowGroupRowFromState = <
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  S extends Redux.TableStore<R, M> = Redux.TableStore<R, M>
>(
  action: Redux.Action,
  st: S,
  rowId: Table.ModelRowId | Table.MarkupRowId,
  options: Redux.FindModelOptions = { warnIfMissing: true }
): Table.GroupRow<R> | null => {
  const predicate = (g: Table.GroupRow<R>) => includes(g.children, rowId);
  return redux.reducers.modelFromState<Table.GroupRow<R>>(
    action,
    filter(st.data, (r: Table.Row<R, M>) => tabling.typeguards.isGroupRow(r)) as Table.GroupRow<R>[],
    predicate,
    { ...options, name: "Group" }
  );
};

const rowRemoveFromGroupReducer = <
  R extends Table.RowData,
  M extends Model.TypedHttpModel = Model.TypedHttpModel,
  S extends Redux.TableStore<R, M> = Redux.TableStore<R, M>
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

  const ids: (Table.ModelRowId | Table.MarkupRowId)[] = Array.isArray(e.payload.rows)
    ? e.payload.rows
    : [e.payload.rows];

  const modelRows: Table.ModelRow<R, M>[] = redux.reducers.findModelsInData<Table.ModelRow<R, M>>(
    action,
    filter(st.data, (r: Table.Row<R, M>) => tabling.typeguards.isModelRow(r)) as Table.ModelRow<R, M>[],
    filter(ids, (id: Table.ModelRowId | Table.MarkupRowId) => tabling.typeguards.isModelRowId(id)) as Table.ModelRowId[]
  );
  // IDs of the Model Rows that are actually in the current state.
  const modelRowIds = map(modelRows, (r: Table.ModelRow<R, M>) => r.id);

  const markupRows: Table.MarkupRow<R>[] = redux.reducers.findModelsInData<Table.MarkupRow<R>>(
    action,
    filter(st.data, (r: Table.Row<R, M>) => tabling.typeguards.isMarkupRow(r)) as Table.MarkupRow<R>[],
    filter(ids, (id: Table.ModelRowId | Table.MarkupRowId) =>
      tabling.typeguards.isMarkupRowId(id)
    ) as Table.MarkupRowId[]
  );
  // IDs of the Markup Rows that are actually in the current state.
  const markupRowIds = map(markupRows, (r: Table.MarkupRow<R>) => r.markup);

  const g: Table.GroupRow<R> | null = groupRowFromState<R, M, S>(action, st, e.payload.group);
  if (!isNil(g)) {
    const newModelRows = redux.reducers.findModelsInData<Table.ModelRow<R, M>>(
      action,
      filter(st.data, (r: Table.Row<R, M>) => tabling.typeguards.isModelRow(r)) as Table.ModelRow<R, M>[],
      filter(g.children, (child: number) => !includes(modelRowIds, child))
    );
    return {
      ...st,
      data: data.orderTableRows<R, M>(
        util.replaceInArray<Table.Row<R, M>>(
          st.data,
          { id: g.id },
          {
            ...g,
            children: filter(g.children, (child: number) => !includes(modelRowIds, child)),
            children_markups: filter(g.children_markups, (child: number) => !includes(markupRowIds, child)),
            data: tabling.rows.updateGroupRowData({
              columns,
              data: g.data,
              // At least right now, the children rows used to determine the properties of
              // a GroupRow do not include the MarkupRow(s).
              childrenRows: newModelRows
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
  S extends Redux.TableStore<R, M> = Redux.TableStore<R, M>
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

  const ids: (Table.ModelRowId | Table.MarkupRowId)[] = Array.isArray(e.payload.rows)
    ? e.payload.rows
    : [e.payload.rows];

  const modelRows: Table.ModelRow<R, M>[] = redux.reducers.findModelsInData<Table.ModelRow<R, M>>(
    action,
    filter(st.data, (r: Table.Row<R, M>) => tabling.typeguards.isModelRow(r)) as Table.ModelRow<R, M>[],
    filter(ids, (id: Table.ModelRowId | Table.MarkupRowId) => tabling.typeguards.isModelRowId(id)) as Table.ModelRowId[]
  );
  // IDs of the Model Rows that are actually in the current state.
  const modelRowIds = map(modelRows, (r: Table.ModelRow<R, M>) => r.id);

  const markupRows: Table.MarkupRow<R>[] = redux.reducers.findModelsInData<Table.MarkupRow<R>>(
    action,
    filter(st.data, (r: Table.Row<R, M>) => tabling.typeguards.isMarkupRow(r)) as Table.MarkupRow<R>[],
    filter(ids, (id: Table.ModelRowId | Table.MarkupRowId) =>
      tabling.typeguards.isMarkupRowId(id)
    ) as Table.MarkupRowId[]
  );
  // IDs of the Markup Rows that are actually in the current state.
  const markupRowIds = map(markupRows, (r: Table.MarkupRow<R>) => r.markup);

  const g: Table.GroupRow<R> | null = groupRowFromState<R, M, S>(action, st, e.payload.group);
  if (!isNil(g)) {
    const newModelRows = redux.reducers.findModelsInData<Table.ModelRow<R, M>>(
      action,
      filter(st.data, (r: Table.Row<R, M>) => tabling.typeguards.isModelRow(r)) as Table.ModelRow<R, M>[],
      [...modelRowIds, ...g.children]
    );
    return {
      ...st,
      data: data.orderTableRows<R, M>(
        util.replaceInArray<Table.Row<R, M>>(
          st.data,
          { id: g.id },
          {
            ...g,
            children: [...g.children, ...modelRowIds],
            children_markups: [...g.children_markups, ...markupRowIds],
            data: tabling.rows.updateGroupRowData({
              columns,
              data: g.data,
              // At least right now, the children rows used to determine the properties of
              // a GroupRow do not include the MarkupRow(s).
              childrenRows: newModelRows
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
  S extends Redux.TableStore<R, M> = Redux.TableStore<R, M>
>(
  st: S,
  action: Redux.Action,
  rowIds: (Table.ModelRowId | Table.ModelRow<R, M> | Table.MarkupRowId | Table.MarkupRow<R>)[],
  columns: Table.Column<R, M>[]
): S => {
  // Keep track of which groups were altered and what their most recent children were after all
  // alterations, because it will be faster to recalculate the groups in the state after so we can
  // only recalculate each group once.
  type Alteration = {
    groupRow: Table.GroupRow<R>;
    children: number[];
    children_markups: number[];
  };
  type AlteredGroups = { [key: Table.GroupRowId]: Alteration };
  let alteredGroupsWithChildren: AlteredGroups = reduce(
    rowIds,
    (
      alterations: AlteredGroups,
      rowId: Table.ModelRowId | Table.ModelRow<R, M> | Table.MarkupRowId | Table.MarkupRow<R>
    ) => {
      let r: Table.ModelRow<R, M> | Table.MarkupRow<R> | null = null;
      if (typeof rowId === "number" || typeof rowId === "string") {
        if (tabling.typeguards.isMarkupRowId(rowId)) {
          r = redux.reducers.modelFromState<Table.MarkupRow<R>>(
            action,
            filter(st.data, (ri: Table.Row<R, M>) => typeguards.isMarkupRow(ri)) as Table.MarkupRow<R>[],
            rowId
          );
        } else {
          r = redux.reducers.modelFromState<Table.ModelRow<R, M>>(
            action,
            filter(st.data, (ri: Table.Row<R, M>) => typeguards.isDataRow(ri)) as Table.ModelRow<R, M>[],
            rowId
          );
        }
      } else {
        r = rowId;
      }
      if (!isNil(r)) {
        let groupRow = rowGroupRowFromState<R, M, S>(action, st, r.id, { warnIfMissing: false });
        if (!isNil(groupRow)) {
          // This will be overwrittten if a group belongs to multiple rows associated with the provided
          // IDS - but that is what we want, because we want the final values to have the most up to
          // date children for each group after all alterations.
          if (tabling.typeguards.isMarkupRow(r)) {
            const markupId = r.markup;
            return {
              ...alterations,
              [groupRow.id]: {
                groupRow,
                children_markups: filter(groupRow.children_markups, (id: number) => id !== markupId)
              }
            };
          }
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
      const childrenRows: Table.ModelRow<R, M>[] = redux.reducers.findModelsInData(
        action,
        filter(s.data, (r: Table.Row<R, M>) => tabling.typeguards.isDataRow(r)) as Table.ModelRow<R, M>[],
        filter(alteration.children, (id: Table.ModelRowId | Table.MarkupRowId) =>
          tabling.typeguards.isModelRowId(id)
        ) as Table.ModelRowId[]
      );
      return {
        ...s,
        data: util.replaceInArray<Table.Row<R, M>>(
          st.data,
          { id: alteration.groupRow.id },
          {
            ...alteration.groupRow,
            children: alteration.children,
            children_markups: alteration.children_markups,
            data: tabling.rows.updateGroupRowData({
              columns,
              data: alteration.groupRow.data,
              // At least right now, the children rows used to determine the properties of
              // a GroupRow do not include the MarkupRow(s).
              childrenRows
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
  S extends Redux.TableStore<R, M> = Redux.TableStore<R, M>
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

  const modelRows: Table.ModelRow<R, M>[] = redux.reducers.findModelsInData<Table.ModelRow<R, M>>(
    action,
    filter(st.data, (r: Table.Row<R, M>) => tabling.typeguards.isModelRow(r)) as Table.ModelRow<R, M>[],
    filter(ids, (id: Table.ModelRowId | Table.MarkupRowId) => tabling.typeguards.isModelRowId(id)) as Table.ModelRowId[]
  );

  const markupRows: Table.MarkupRow<R>[] = redux.reducers.findModelsInData<Table.MarkupRow<R>>(
    action,
    filter(st.data, (r: Table.Row<R, M>) => tabling.typeguards.isMarkupRow(r)) as Table.MarkupRow<R>[],
    filter(ids, (id: Table.ModelRowId | Table.MarkupRowId) =>
      tabling.typeguards.isMarkupRowId(id)
    ) as Table.MarkupRowId[]
  );

  st = removeRowsFromTheirGroupsIfTheyExist(st, action, [...markupRows, ...modelRows], columns);
  return {
    ...st,
    data: filter(st.data, (ri: Table.Row<R, M>) => !includes(ids, ri.id))
  };
};

export const createTableChangeEventReducer = <
  R extends Table.RowData,
  M extends Model.TypedHttpModel = Model.TypedHttpModel,
  S extends Redux.TableStore<R, M> = Redux.TableStore<R, M>,
  A extends Redux.AuthenticatedTableActionMap<R, M> = Redux.AuthenticatedTableActionMap<R, M>
>(
  config: Table.ReducerConfig<R, M, S, A> & {
    readonly recalculateRow?: (
      state: S,
      action: Redux.Action<Table.ChangeEvent<R, M>>,
      row: Table.DataRow<R, M>
    ) => Partial<R>;
  },
  options?: Pick<Redux.FindModelOptions, "name">
): Redux.Reducer<S, Redux.Action<Table.ChangeEvent<R, M>>> => {
  return (state: S = config.initialState, action: Redux.Action<Table.ChangeEvent<R, M>>): S => {
    let newState: S = { ...state };

    const e: Table.ChangeEvent<R, M> = action.payload;

    if (typeguards.isDataChangeEvent<R, M>(e)) {
      const consolidated = events.consolidateTableChange(e.payload);

      // Note: This grouping may be redundant - we should investigate.
      let changesPerRow: {
        [key: ID]: { changes: Table.RowChange<R, M>[]; row: Table.EditableRow<R, M> };
      } = {};
      for (let i = 0; i < consolidated.length; i++) {
        if (isNil(changesPerRow[consolidated[i].id])) {
          /* eslint-disable no-loop-func */
          const r: Table.EditableRow<R, M> | null = redux.reducers.findModelInData<Table.EditableRow<R, M>>(
            action,
            filter(newState.data, (ri: Table.Row<R, M>) => tabling.typeguards.isEditableRow(ri)) as Table.EditableRow<
              R,
              M
            >[],
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
      let modifiedRows: Table.EditableRow<R, M>[] = [];
      newState = reduce(
        changesPerRow,
        (s: S, dt: { changes: Table.RowChange<R, M>[]; row: Table.EditableRow<R, M> }) => {
          let r: Table.EditableRow<R, M> = reduce(
            dt.changes,
            (ri: Table.EditableRow<R, M>, change: Table.RowChange<R, M>) =>
              rows.mergeChangesWithRow<R, M>(ri.id, ri, change),
            dt.row
          );
          if (!isNil(config.recalculateRow) && tabling.typeguards.isDataRow(r)) {
            r = { ...r, data: { ...r.data, ...config.recalculateRow(s, action, r) } };
          }
          modifiedRows = [...modifiedRows, r];
          return {
            ...s,
            data: util.replaceInArray<Table.Row<R, M>>(s.data, { id: r.id }, r)
          };
        },
        newState
      );
      const groupsWithRowsThatChanged: Table.GroupRow<R>[] = filter(
        filter(newState.data, (r: Table.Row<R, M>) => tabling.typeguards.isGroupRow(r)) as Table.GroupRow<R>[],
        (row: Table.GroupRow<R>) => {
          return (
            intersection(
              row.children,
              map(modifiedRows, (r: Table.EditableRow<R, M>) => r.id)
            ).length !== 0
          );
        }
      );
      newState = reduce(
        groupsWithRowsThatChanged,
        (s: S, groupRow: Table.GroupRow<R>) => {
          const childrenRows: Table.DataRow<R, M>[] = redux.reducers.findModelsInData(
            action,
            filter(s.data, (r: Table.Row<R, M>) => tabling.typeguards.isDataRow(r)) as Table.DataRow<R, M>[],
            groupRow.children
          );
          return {
            ...s,
            data: util.replaceInArray<Table.Row<R, M>>(
              s.data,
              { id: groupRow.id },
              {
                ...groupRow,
                data: tabling.rows.updateGroupRowData({
                  columns: config.columns,
                  data: groupRow.data,
                  childrenRows
                })
              }
            )
          };
        },
        newState
      );
    } else if (typeguards.isRowAddEvent(e)) {
      const payload: Table.RowAdd<R>[] = Array.isArray(e.payload) ? e.payload : [e.payload];
      newState = {
        ...newState,
        data: [
          ...newState.data,
          ...map(payload, (addition: Table.RowAdd<R>) =>
            rows.createPlaceholderRow<R, M>({
              id: addition.id,
              data: events.rowAddToRowData<R>(addition),
              columns: config.columns
            })
          )
        ]
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
    } else if (typeguards.isGroupAddEvent(e)) {
      /*
      When a Group is added to the table, we must first convert that Group model to a GroupRow.  Then,
      before we insert that row into the table, we must update the rows that are children of that Group
      such that they reference that Group.  Then, we insert the GroupRow into the table and reorder
      the table so that the GroupRow is in the appropriate location.
      */
      const groupRow = rows.createGroupRow<R, M>({
        columns: config.columns,
        group: e.payload,
        childrenRows: filter(
          newState.data,
          (r: Table.Row<R, M>) => !tabling.typeguards.isGroupRow(r) && includes(e.payload.children, r.id)
        ) as Table.NonGroupRow<R, M>[]
      });
      // Insert the new GroupRow(s) into the table and reorder the rows of the table so that the
      // GroupRow(s) are in the appropriate location.
      newState = {
        ...newState,
        data: data.orderTableRows<R, M>([...newState.data, groupRow])
      };
    } else if (typeguards.isGroupUpdateEvent(e)) {
      /*
      Note: Eventually we are going to want to try to treat this the same as an update to a regular row.

      Right now, we are only really concerned with changes to the color or names field of the
      group, as everything else that would trigger mechanical recalculations is handled by separate
      events.
      */
      const groupRow: Table.GroupRow<R> | null = groupRowFromState<R, M, S>(action, newState, `group-${e.payload.id}`);
      if (!isNil(groupRow)) {
        newState = {
          ...newState,
          data: util.replaceInArray<Table.Row<R>>(
            newState.data,
            { id: groupRow.id },
            {
              ...groupRow,
              groupData: {
                ...groupRow.groupData,
                name: e.payload.data.name || groupRow.groupData.name,
                color: e.payload.data.color || groupRow.groupData.color
              }
            }
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
  S extends Redux.TableStore<R, M> = Redux.TableStore<R, M>,
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
          models: response.models,
          groups: response.groups || [],
          data: config.createTableRows({
            ...config,
            gridId: "data",
            response
          })
        };
      } else {
        newState = {
          ...newState,
          models: response.models,
          groups: response.groups || [],
          data: data.createTableRows<R, M>({
            ...config,
            gridId: "data",
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
  S extends Redux.TableStore<R, M> = Redux.TableStore<R, M>
>(
  config: Table.ReducerConfig<R, M, S, Redux.TableActionMap<M>>
): Redux.Reducer<S> => {
  return createTableReducer<R, M, S, Redux.TableActionMap<M>>(config);
};

export const createAuthenticatedTableReducer = <
  R extends Table.RowData,
  M extends Model.TypedHttpModel = Model.TypedHttpModel,
  S extends Redux.TableStore<R, M> = Redux.TableStore<R, M>,
  A extends Redux.AuthenticatedTableActionMap<R, M> = Redux.AuthenticatedTableActionMap<R, M>
>(
  config: Table.ReducerConfig<R, M, S, A> & {
    readonly eventReducer?: Redux.Reducer<S>;
    readonly recalculateRow?: (state: S, action: Redux.Action, row: Table.DataRow<R, M>) => Partial<R>;
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
                  columns: config.columns
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
