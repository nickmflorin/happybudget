import { isNil, reduce, map, filter, includes, intersection, uniq } from "lodash";

import * as applicationEvents from "../events";
import * as redux from "../redux";
import * as util from "../util";
import * as data from "./data";
import * as events from "./events";
import * as typeguards from "./typeguards";
import * as managers from "./managers";

/* eslint-disable indent */
export const groupRowFromState = <R extends Table.RowData, S extends Redux.TableStore<R> = Redux.TableStore<R>>(
  action: Redux.Action,
  st: S,
  id: Table.GroupRowId,
  rowId?: Table.ModelRowId,
  options: Redux.FindModelOptions = { name: "Group", warnIfMissing: true }
): Table.GroupRow<R> | null => {
  let predicate: Redux.ModelLookup<Table.GroupRow<R>> = id;
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
  rowId: Table.ModelRowId,
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

const removeRowsFromTheirGroupsIfTheyExist = <
  R extends Table.RowData,
  S extends Redux.TableStore<R> = Redux.TableStore<R>
>(
  st: S,
  action: Redux.Action,
  rowIds: (Table.ModelRowId | Table.ModelRow<R>)[]
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
  return reduce(
    alteredGroupsWithChildren,
    (s: S, alteration: Alteration) => {
      return {
        ...s,
        data: util.replaceInArray<Table.BodyRow<R>>(
          st.data,
          { id: alteration.groupRow.id },
          {
            ...alteration.groupRow,
            children: alteration.children
          }
        )
      };
    },
    st
  );
};

const updateRowGroup = <R extends Table.RowData, S extends Redux.TableStore<R> = Redux.TableStore<R>>(
  st: S,
  action: Redux.Action,
  rowIds: SingleOrArray<Table.ModelRowId>,
  group: Table.GroupRowId
): S => {
  const ids: Table.ModelRowId[] = Array.isArray(rowIds) ? rowIds : [rowIds];

  const g: Table.GroupRow<R> | null = groupRowFromState<R, S>(action, st, group);
  if (!isNil(g)) {
    // If any of the ModelRow(s) already belong to Group(s), they must be disassociated from
    // those Group(s) since a ModelRow can only belong to one and only one Group.
    let newState = removeRowsFromTheirGroupsIfTheyExist(st, action, ids);
    // Find the rows associated with this Group including the rows that are being added to the
    // group.  Note that this is intentionally redundant (as we simply set the children propery
    // to these IDs afterwards anyways) - but is done so to make sure that the IDs are valid and
    // associated with ModelRow(s) in state.
    const rws = redux.reducers.findModelsInData<Table.ModelRow<R>>(
      action,
      filter(newState.data, (r: Table.BodyRow<R>) => typeguards.isModelRow(r)) as Table.ModelRow<R>[],
      uniq([...ids, ...g.children])
    );
    return {
      ...newState,
      data: util.replaceInArray<Table.BodyRow<R>>(
        newState.data,
        { id: g.id },
        {
          ...g,
          children: map(rws, (r: Table.ModelRow<R>) => r.id)
        }
      )
    };
  }
  return st;
};

const reorderRows = <R extends Table.RowData, S extends Redux.TableStore<R> = Redux.TableStore<R>>(st: S): S => {
  return {
    ...st,
    data: data.orderTableRows<R>(st.data)
  };
};

export const createTableChangeEventReducer = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
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
  const modelRowManager = new managers.ModelRowManager<R, M>({
    getRowChildren: config.getModelRowChildren,
    columns: config.columns
  });
  const groupRowManager = new managers.GroupRowManager<R, M>({ columns: config.columns });
  const placeholderRowManager = new managers.PlaceholderRowManager<R, M>({
    columns: config.columns,
    defaultData: config.defaultData
  });
  return (state: S = config.initialState, action: Redux.Action<Table.ChangeEvent<R, M>>): S => {
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
            filter(state.data, (ri: Table.BodyRow<R>) => typeguards.isEditableRow(ri)) as Table.EditableRow<R>[],
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
      return reduce(
        changesPerRow,
        (s: S, dt: { changes: Table.RowChange<R>[]; row: Table.EditableRow<R> }) => {
          let r: Table.EditableRow<R> = reduce(
            dt.changes,
            (ri: Table.EditableRow<R>, change: Table.RowChange<R>) => events.mergeChangesWithRow<R>(ri.id, ri, change),
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
        state
      );
    } else if (typeguards.isModelUpdatedEvent(e)) {
      const payloads: Table.ModelUpdatedPayload<M>[] = Array.isArray(e.payload) ? e.payload : [e.payload];
      return reduce(
        payloads,
        (st: S, payload: Table.ModelUpdatedPayload<M>) => {
          const modelRow: Table.ModelRow<R> | null = redux.reducers.modelFromState<Table.ModelRow<R>>(
            action,
            filter(st.data, (ri: Table.BodyRow<R>) => typeguards.isModelRow(ri)) as Table.ModelRow<R>[],
            payload.model.id
          );
          if (!isNil(modelRow)) {
            /*
            We do not want to reorder the rows unless we absolutely need to.  The `ordering` param
            is solely required for future events that require reordering the table (like group
            related events).  If just the ordering was updated for the model, or another non-group
            field was updated on the model, then we do not need to reorder the rows - as the ordering
            will already be consistent with the backend ordering.

            However, if the group changed, due to ordering or not due to ordering, then we do need to
            reorder the rows.  If we reorder the rows, then the rows need to have the updated values
            of the `order` attribute that might be included as a part of the updated model in this event
            payload - so, updating the ModelRow needs to be done before any manipulations of row order.
            */
            st = {
              ...st,
              data: util.replaceInArray<Table.BodyRow<R>>(
                st.data,
                { id: modelRow.id },
                modelRowManager.create({
                  model: payload.model
                })
              )
            };
            // If the `group` on the event payload is undefined, it means there was no change to the
            // model's group.  A `null` group means that the group was removed.
            if (payload.group !== undefined) {
              let previousGroupRow: Table.GroupRow<R> | null = rowGroupRowFromState<R, S>(
                action,
                st,
                payload.model.id,
                { warnIfMissing: false }
              );
              let newGroupRow: Table.GroupRow<R> | null = null;
              if (payload.group !== null) {
                newGroupRow = groupRowFromState<R, S>(action, st, managers.groupRowId(payload.group));
              }
              let previousGroupRowId = !isNil(previousGroupRow) ? previousGroupRow.id : null;
              let newGroupRowId = !isNil(newGroupRow) ? newGroupRow.id : null;
              // Make sure the Group actually changed before proceeding.
              if (previousGroupRowId !== newGroupRowId) {
                // In this case, the ModelRow's associated GroupRow was removed.
                if (!isNil(previousGroupRow) && isNil(newGroupRow)) {
                  // Apply the reordering here, since the model already has it's `order` parameter
                  // updated.
                  st = reorderRows({
                    ...st,
                    data: util.replaceInArray<Table.BodyRow<R>>(
                      st.data,
                      { id: previousGroupRow.id },
                      groupRowManager.removeChildren(previousGroupRow, [modelRow.id])
                    )
                  });
                  // In this case, the ModelRow's associated GroupRow was either added or changed.
                } else if (!isNil(newGroupRow)) {
                  st = reorderRows(updateRowGroup(st, action, [modelRow.id], newGroupRow.id));
                }
              }
            }
          }
          return st;
        },
        state
      );
    } else if (typeguards.isRowAddEvent(e)) {
      const payload: Table.RowAdd<R>[] = Array.isArray(e.payload) ? e.payload : [e.payload];
      let newState = {
        ...state,
        data: reduce(
          payload,
          (d: Table.BodyRow<R>[], addition: Table.RowAdd<R>) => {
            return [
              ...d,
              placeholderRowManager.create({
                id: addition.id,
                data: addition.data,
                originalIndex: filter(d, (r: Table.BodyRow<R>) => typeguards.isDataRow(r)).length
              })
            ];
          },
          state.data
        )
      };
      applicationEvents.dispatchRowsAddedEvent({ tableId: config.tableId, numRows: newState.data.length });
      return reorderRows(newState);
    } else if (typeguards.isRowDeleteEvent(e)) {
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
      const ids: Table.RowId[] = Array.isArray(e.payload.rows) ? e.payload.rows : [e.payload.rows];

      const modelRows: Table.ModelRow<R>[] = redux.reducers.findModelsInData<Table.ModelRow<R>>(
        action,
        filter(state.data, (r: Table.BodyRow<R>) => typeguards.isModelRow(r)) as Table.ModelRow<R>[],
        filter(ids, (id: Table.ModelRowId | Table.MarkupRowId) => typeguards.isModelRowId(id)) as Table.ModelRowId[]
      );
      let newState = removeRowsFromTheirGroupsIfTheyExist(state, action, modelRows);
      return reorderRows({
        ...newState,
        data: filter(newState.data, (ri: Table.BodyRow<R>) => !includes(ids, ri.id))
      });
    } else if (typeguards.isRowRemoveFromGroupEvent(e)) {
      const ids: Table.ModelRowId[] = Array.isArray(e.payload.rows) ? e.payload.rows : [e.payload.rows];

      const g: Table.GroupRow<R> | null = groupRowFromState<R, S>(action, state, e.payload.group);
      if (!isNil(g)) {
        return reorderRows({
          ...state,
          data: util.replaceInArray<Table.BodyRow<R>>(state.data, { id: g.id }, groupRowManager.removeChildren(g, ids))
        });
      }
    } else if (typeguards.isRowAddToGroupEvent(e)) {
      return reorderRows(updateRowGroup(state, action, e.payload.rows, e.payload.group));
    } else if (typeguards.isRowPositionChangedEvent(e)) {
      // const modelRow: Table.ModelRow<R> | null = redux.reducers.modelFromState<Table.ModelRow<R>>(
      //   action,
      //   filter(state.data, (ri: Table.BodyRow<R>) => typeguards.isModelRow(ri)) as Table.ModelRow<R>[],
      //   e.payload.id
      // );
      // let newState = { ...state };
      // if (!isNil(modelRow)) {
      //   // If the repositioning involved moving the ModelRow out of a GroupRow and/or moving the
      //   // ModelRow into a GroupRow, we need to update the state to reflect the new
      //   // GroupRow/ModelRow relationship.
      //   let previousGroupRow = rowGroupRowFromState<R, S>(action, state, e.payload.id, { warnIfMissing: false });
      //   if (!isNil(previousGroupRow) && isNil(e.payload.newGroup) && e.payload.newGroup !== previousGroupRow.id) {
      //     console.log("REORDERING");
      //     newState = {
      //       ...state,
      //       data: util.replaceInArray<Table.BodyRow<R>>(
      //         state.data,
      //         { id: previousGroupRow.id },
      //         groupRowManager.removeChildren(previousGroupRow, [modelRow.id])
      //       )
      //     };
      //   } else if (!isNil(e.payload.newGroup)) {
      //     console.log("REORDERING");
      //     newState = updateRowGroup(state, action, [modelRow.id], e.payload.newGroup);
      //   }
      //   newState = reorderRows(newState);
      // }
      return state;
      // } else if (typeguards.isTableOrderChangedEvent(e)) {
      //   /*
      //   This event is not responsible for actually reordering the rows in the store.
      //   In fact, we actually do not want to do that - we want to let AG Grid handle
      //   the ordering when the rows are moved.

      //   This event is responsible for simply updating the `originalIndex` of the ModelRow(s)
      //   after the API response is received from a request to reorder the ModelRow.  The
      //   `originalIndex` does not actually factor in until the rows are reordered after
      //   another event occurs - so it is necessary to update the `originalIndex` of the ModelRow(s)
      //   so that subsequent reordering (either due to a Group removal, Row removal from Group, etc.)
      //   is accurate.
      //   */
      //   // const newOrdering: number[] = e.payload;
      //   // let newState = reduce(
      //   //   newOrdering,
      //   //   (st: S, id: number, index: number) => {
      //   //     const modelRow: Table.ModelRow<R> | null = redux.reducers.modelFromState<Table.ModelRow<R>>(
      //   //       action,
      //   //       filter(state.data, (ri: Table.BodyRow<R>) => typeguards.isModelRow(ri)) as Table.ModelRow<R>[],
      //   //       id
      //   //     );
      //   //     if (!isNil(modelRow)) {
      //   //       return {
      //   //         ...st,
      //   //         data: util.replaceInArray<Table.BodyRow<R>>(st.data, { id }, { ...modelRow, originalIndex: index })
      //   //       };
      //   //     }
      //   //     return st;
      //   //   },
      //   //   state
      //   // );
      //   // /* @ts-ignore */
      //   // console.log(map(newState.data, (r: Table.Row<R>) => r.data.identifier));
      //   // return reorderRows(newState);
      //   return state;
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
      const newGroupRow: Table.GroupRow<R> = groupRowManager.create({ model: e.payload });
      const groupsWithChild: Table.GroupRow<R>[] = filter(
        state.data,
        (r: Table.Row<R>) => typeguards.isGroupRow(r) && intersection(r.children, newGroupRow.children).length !== 0
      ) as Table.GroupRow<R>[];
      let newState = reduce(
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
        state
      );
      return reorderRows({
        ...newState,
        data: [...newState.data, newGroupRow]
      });
    } else if (typeguards.isGroupUpdateEvent(e)) {
      /*
      When a Group is updated, it may be updated with children that already belong to another
      Group.  In this case, the backend will automatically remove those children from the previous
      Group they belonged to - but we also need to apply that change in the reducer here.
      */
      const groupRow: Table.GroupRow<R> | null = groupRowFromState<R, S>(
        action,
        state,
        managers.groupRowId(e.payload.id)
      );
      if (!isNil(groupRow)) {
        const newGroupRow: Table.GroupRow<R> = groupRowManager.create({ model: e.payload });
        const groupsWithChild: Table.GroupRow<R>[] = filter(
          state.data,
          (r: Table.Row<R>) => typeguards.isGroupRow(r) && intersection(r.children, newGroupRow.children).length !== 0
        ) as Table.GroupRow<R>[];
        let newState = reduce(
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
          state
        );
        return reorderRows({
          ...newState,
          data: util.replaceInArray<Table.BodyRow<R>>(newState.data, { id: groupRow.id }, newGroupRow)
        });
      }
    }
    return state;
  };
};

export const createTableReducer = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
  A extends Redux.TableActionMap<M> = Redux.TableActionMap<M>
>(
  config: Table.ReducerConfig<R, M, S, A>
): Redux.Reducer<S> => {
  return (state: S | undefined = config.initialState, action: Redux.Action<any>): S => {
    if (
      (!isNil(config.actions.request) && action.type === config.actions.request.toString()) ||
      action.type === config.actions.clear.toString()
    ) {
      return { ...state, data: [], models: [], groups: [] };
    } else if (action.type === config.actions.response.toString()) {
      const response: Http.TableResponse<M> = action.payload;
      if (!isNil(config.createTableRows)) {
        return {
          ...state,
          data: config.createTableRows({
            ...config,
            response
          })
        };
      } else {
        return {
          ...state,
          data: data.createTableRows<R, M>({
            ...config,
            response
          })
        };
      }
    } else if (action.type === config.actions.setSearch.toString()) {
      const search: string = action.payload;
      return { ...state, search };
    }
    return state;
  };
};

export const createUnauthenticatedTableReducer = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>
>(
  config: Table.ReducerConfig<R, M, S, Redux.TableActionMap<M>>
): Redux.Reducer<S> => {
  return createTableReducer<R, M, S, Redux.TableActionMap<M>>(config);
};

export const createAuthenticatedTableReducer = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
  A extends Redux.AuthenticatedTableActionMap<R, M> = Redux.AuthenticatedTableActionMap<R, M>
>(
  config: Table.ReducerConfig<R, M, S, A> & {
    readonly getModelRowChildren?: (m: M) => number[];
    readonly eventReducer?: Redux.Reducer<S>;
    readonly recalculateRow?: (state: S, action: Redux.Action, row: Table.DataRow<R>) => Partial<R>;
  }
): Redux.Reducer<S> => {
  const tableEventReducer = config.eventReducer || createTableChangeEventReducer<R, M, S, A>(config);
  const generic = createTableReducer<R, M, S, A>(config);

  return (state: S | undefined = config.initialState, action: Redux.Action<any>): S => {
    let newState = generic(state, action);
    if (action.type === config.actions.tableChanged.toString()) {
      return tableEventReducer(newState, action);
    } else if (action.type === config.actions.saving.toString()) {
      return { ...newState, saving: action.payload };
    } else if (action.type === config.actions.addModelsToState.toString()) {
      const payload: Redux.AddModelsToTablePayload<M> = action.payload;
      return reduce(
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
              data: util.replaceInArray<Table.BodyRow<R>>(s.data, { id: r.id }, {
                ...r,
                rowType: "model",
                id: payload.models[index].id,
                order: payload.models[index].order
              } as Table.ModelRow<R>)
            };
          }
          return s;
        },
        newState
      );
    } else if (
      !isNil(config.actions.updateRowsInState) &&
      action.type === config.actions.updateRowsInState.toString()
    ) {
      const updates: Redux.UpdateRowPayload<R>[] = Array.isArray(action.payload) ? action.payload : [action.payload];
      return reduce(
        updates,
        (s: S, update: Redux.UpdateRowPayload<R>) => {
          const r: Table.ModelRow<R> | null = redux.reducers.findModelInData(
            action,
            filter(newState.data, (ri: Table.BodyRow<R>) => typeguards.isModelRow(ri)),
            update.id
          );
          if (!isNil(r)) {
            return reorderRows({
              ...s,
              data: util.replaceInArray<Table.BodyRow<R>>(
                s.data,
                { id: r.id },
                { ...r, data: { ...r.data, ...update.data } }
              )
            });
          }
          return s;
        },
        newState
      );
    }
    return newState;
  };
};
