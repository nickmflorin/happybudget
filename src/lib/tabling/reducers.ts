import { isNil, reduce, map, filter, includes, intersection, uniq } from "lodash";

import * as redux from "../redux";
import * as util from "../util";
import * as data from "./data";
import * as events from "./events";
import * as typeguards from "./typeguards";
import * as managers from "./managers";
import * as patterns from "./patterns";

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
  /* Keep track of which groups were altered and what their most recent children
		 were after all alterations, because it will be faster to recalculate the
		 groups in the state after so we can only recalculate each group once. */
  type Alteration = {
    groupRow: Table.GroupRow<R>;
    children: number[];
  };
  type AlteredGroups = { [key: Table.GroupRowId]: Alteration };

  const alteredGroupsWithChildren: AlteredGroups = reduce(
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
        const groupRow = rowGroupRowFromState<R, S>(action, st, r.id, { warnIfMissing: false });
        if (!isNil(groupRow)) {
          /* This will be overwrittten if a group belongs to multiple rows
						 associated with the provided IDS - but that is what we want, because
						 we want the final values to have the most up to date children for
						 each group after all alterations. */
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
    /* If any of the ModelRow(s) already belong to Group(s), they must be
			 disassociated from those Group(s) since a ModelRow can only belong to one
			 and only one Group. */
    const newState = removeRowsFromTheirGroupsIfTheyExist(st, action, ids);
    /* Find the rows associated with this Group including the rows that are
			 being added to the group.  Note that this is intentionally redundant (as
			 we simply set the children propery to these IDs afterwards anyways) - but
			 is done so to make sure that the IDs are valid and associated with
			 ModelRow(s) in state. */
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
  C extends Table.Context = Table.Context,
  A extends Redux.AuthenticatedTableActionMap<R, M, C> = Redux.AuthenticatedTableActionMap<R, M, C>
>(
  config: Table.ReducerConfig<R, M, S, C, A> & {
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
      const changesPerRow: {
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
      /* For each Row that was changed, apply that change to the Row stored in
         state. */
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
          return {
            ...s,
            data: util.replaceInArray<Table.BodyRow<R>>(s.data, { id: r.id }, r)
          };
        },
        state
      );
    } else if (typeguards.isModelAddedEvent(e)) {
      const payloads: Table.ModelAddedPayload<M>[] = Array.isArray(e.payload) ? e.payload : [e.payload];
      return reorderRows(
        reduce(
          payloads,
          (st: S, payload: Table.ModelAddedPayload<M>) => {
            const modelRow: Table.ModelRow<R> = modelRowManager.create({ model: payload.model });
            st = { ...st, data: [...st.data, modelRow] };
            /*
						The payload's group will only be defined and non-null if the newly
						created row belongs to a group.  If the newly created row does not
						belong to a group, the group will not be included in the payload.

						Unlike the modelUpdatedEvent, we do not need to be concerned with
						null values for group, since null values here are not used to indicate
						that the group was removed - as the group cannot "change" for a
						newly created model.
						*/
            if (!isNil(payload.group)) {
              st = updateRowGroup(st, action, [modelRow.id], managers.groupRowId(payload.group));
            }
            return st;
          },
          state
        )
      );
    } else if (typeguards.isModelUpdatedEvent(e)) {
      const payloads: Table.ModelUpdatedPayload<M>[] = Array.isArray(e.payload) ? e.payload : [e.payload];
      /*
			Note: Even though the rows are already reordered via AG Grid, if we do not
			apply the reordering redundantly to the state, the rows will revert back
			to their previous ordering when the model is updated in the state.

			The ordering is applied in AG Grid and subsequently, after the API request
			succeeds, here, because it provides a much smoother experience to do it
			immediately via AG Grid and then do it in the background here.  However,
			even though it is in the background here, we need to keep the state
			ordering consistent.
			*/
      return reorderRows(
        reduce(
          payloads,
          (st: S, payload: Table.ModelUpdatedPayload<M>) => {
            const modelRow: Table.ModelRow<R> | null = redux.reducers.modelFromState<Table.ModelRow<R>>(
              action,
              filter(st.data, (ri: Table.BodyRow<R>) => typeguards.isModelRow(ri)) as Table.ModelRow<R>[],
              payload.model.id
            );
            if (!isNil(modelRow)) {
              st = {
                ...st,
                data: util.replaceInArray<Table.BodyRow<R>>(
                  st.data,
                  { id: modelRow.id },
                  modelRowManager.create({ model: payload.model })
                )
              };
              /* If the `group` on the event payload is undefined, it means
								 there was no change to the
                 model's group.  A `null` group means that the group was
								 removed. */
              if (payload.group !== undefined) {
                const groupRowId = payload.group !== null ? managers.groupRowId(payload.group) : null;
                const previousGroupRow: Table.GroupRow<R> | null = rowGroupRowFromState<R, S>(
                  action,
                  st,
                  payload.model.id,
                  { warnIfMissing: false }
                );
                const previousGroupRowId = !isNil(previousGroupRow) ? previousGroupRow.id : null;
                // Make sure the Group actually changed before proceeding.
                if (previousGroupRowId !== groupRowId) {
                  if (groupRowId !== null) {
                    /* If the Group ID of the Model is non-null, this means that
											 the GroupRow associated with the ModelRow was either added
											 or changed. */
                    st = updateRowGroup(st, action, [modelRow.id], groupRowId);
                  } else if (previousGroupRow !== null) {
                    /* If the previous GroupRow associated with the ModelRow is
											 not null but the new Group ID of the Model is null, this
											 means that the GroupRow was removed from the ModelRow. */
                    st = {
                      ...st,
                      data: util.replaceInArray<Table.BodyRow<R>>(
                        st.data,
                        { id: previousGroupRow.id },
                        groupRowManager.removeChildren(previousGroupRow, [modelRow.id])
                      )
                    };
                  }
                }
              }
            }
            return st;
          },
          state
        )
      );
    } else if (typeguards.isRowAddEvent(e)) {
      const p: Partial<R>[] | Table.RowAddIndexPayload | Table.RowAddCountPayload = e.payload;
      let d: Partial<R>[];
      if (typeguards.isRowAddCountPayload(p) || typeguards.isRowAddIndexPayload(p)) {
        d = patterns.generateNewRowData(
          { store: state.data, ...p },
          filter(config.columns, (c: Table.DataColumn<R, M>) => typeguards.isBodyColumn(c)) as Table.BodyColumn<R, M>[]
        );
      } else {
        d = p;
      }
      if (e.placeholderIds.length !== d.length) {
        throw new Error(
          `Only ${e.placeholderIds.length} placeholder IDs were provided, but ${d.length}
            new rows are being created.`
        );
      }
      return reorderRows({
        ...state,
        data: reduce(
          d,
          (current: Table.BodyRow<R>[], di: Partial<R>, index: number) => {
            return [
              ...current,
              placeholderRowManager.create({
                id: e.placeholderIds[index],
                data: di
              })
            ];
          },
          state.data
        )
      });
    } else if (typeguards.isRowDeleteEvent(e)) {
      /*
			When a Row is deleted, we first have to create a dichotomy of the rows we
			are deleting.

			(1) Group Rows
			(2) Markup Rows
			(3) Model Rows
			(4) Placeholder Rows

			For Markup and Model Rows, we first have to remove the rows that we are
			going to delete from their respective groups (if they exist).  When this
			is done, the row data for the groups will also be calculated based on the
			new set of rows belonging to each group.

			Then, we need to actually remove the rows, whether they are group rows or
			non-group rows from the state.
			*/
      const ids: Table.RowId[] = Array.isArray(e.payload.rows) ? e.payload.rows : [e.payload.rows];

      const modelRows: Table.ModelRow<R>[] = redux.reducers.findModelsInData<Table.ModelRow<R>>(
        action,
        filter(state.data, (r: Table.BodyRow<R>) => typeguards.isModelRow(r)) as Table.ModelRow<R>[],
        filter(ids, (id: Table.ModelRowId | Table.MarkupRowId) => typeguards.isModelRowId(id)) as Table.ModelRowId[]
      );
      const newState = removeRowsFromTheirGroupsIfTheyExist(state, action, modelRows);
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
    } else if (typeguards.isGroupAddedEvent(e)) {
      /*
			When a Group is added to the table, we must first convert that Group model
			to a GroupRow - then, we need to insert the GroupRow into the set of table
			data and reapply the ordering scheme on the overall set of table data so
			the GroupRow aappears in the correct location.

			When a Group is created, it may be created with children that already
			belong to another Group.  In this case, the backend will automatically
			remove those children from the previous Group they belonged to - but we
			also need to apply that change in the reducer here.
			*/
      const newGroupRow: Table.GroupRow<R> = groupRowManager.create({ model: e.payload });
      const groupsWithChild: Table.GroupRow<R>[] = filter(
        state.data,
        (r: Table.Row<R>) => typeguards.isGroupRow(r) && intersection(r.children, newGroupRow.children).length !== 0
      ) as Table.GroupRow<R>[];
      const newState = reduce(
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
			When a Group is updated, it may be updated with children that already
			belong to another Group.  In this case, the backend will automatically
			remove those children from the previous Group they belonged to - but we
			also need to apply that change in the reducer here.
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
        const newState = reduce(
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
  C extends Table.Context = Table.Context,
  A extends Redux.TableActionMap<M, C> = Redux.TableActionMap<M, C>
>(
  config: Table.ReducerConfig<R, M, S, C, A>
): Redux.Reducer<S> => {
  return (state: S | undefined = config.initialState, action: Redux.Action): S => {
    let newState = { ...state };

    if (redux.reducers.isClearOnAction(config.clearOn, action)) {
      newState = { ...state, data: [] };
    }

    if (action.type === config.actions.response.toString()) {
      const response: Http.TableResponse<M> = action.payload;
      return {
        ...newState,
        data: data.createTableRows<R, M>({
          ...config,
          response
        })
      };
    } else if (action.type === config.actions.setSearch.toString()) {
      const search: string = action.payload;
      return { ...newState, search };
    }
    return newState;
  };
};

export const createUnauthenticatedTableReducer = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
  C extends Table.Context = Table.Context
>(
  config: Table.ReducerConfig<R, M, S, C, Redux.TableActionMap<M, C>>
): Redux.Reducer<S> => {
  return createTableReducer<R, M, S, C, Redux.TableActionMap<M, C>>(config);
};

export const createAuthenticatedTableReducer = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
  C extends Table.Context = Table.Context,
  A extends Redux.AuthenticatedTableActionMap<R, M, C> = Redux.AuthenticatedTableActionMap<R, M, C>
>(
  config: Table.ReducerConfig<R, M, S, C, A> & {
    readonly getModelRowChildren?: (m: M) => number[];
    readonly eventReducer?: Redux.Reducer<S>;
    readonly recalculateRow?: (state: S, action: Redux.Action, row: Table.DataRow<R>) => Partial<R>;
  }
): Redux.Reducer<S> => {
  const tableEventReducer = config.eventReducer || createTableChangeEventReducer<R, M, S, C, A>(config);
  const generic = createTableReducer<R, M, S, C, A>(config);

  return (state: S | undefined = config.initialState, action: Redux.Action): S => {
    const newState = generic(state, action);
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
          ) as Table.ModelRow<R> | null;
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
