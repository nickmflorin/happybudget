import { isNil, reduce, filter, includes } from "lodash";

import { tabling, redux, util } from "lib";

import { reorderRows, groupRowFromState, removeRowsFromTheirGroupsIfTheyExist, updateRowGroup } from "./util";

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
  const groupRowManager = new tabling.managers.GroupRowManager<R, M>({ columns: config.columns });
  const placeholderRowManager = new tabling.managers.PlaceholderRowManager<R, M>({
    columns: config.columns,
    defaultData: config.defaultData
  });

  return (state: S = config.initialState, e: Table.ChangeEvent<R>): S => {
    if (tabling.typeguards.isDataChangeEvent<R>(e)) {
      const consolidated = tabling.events.consolidateRowChanges(e.payload);

      // Note: This grouping may be redundant - we should investigate.
      const changesPerRow: {
        [key: ID]: { changes: Table.RowChange<R>[]; row: Table.EditableRow<R> };
      } = {};
      for (let i = 0; i < consolidated.length; i++) {
        if (isNil(changesPerRow[consolidated[i].id])) {
          const r: Table.EditableRow<R> | null = redux.reducers.findModelInData<Table.EditableRow<R>>(
            filter(state.data, (ri: Table.BodyRow<R>) =>
              tabling.typeguards.isEditableRow(ri)
            ) as Table.EditableRow<R>[],
            consolidated[i].id
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
            (ri: Table.EditableRow<R>, change: Table.RowChange<R>) =>
              tabling.events.mergeChangesWithRow<R>(ri.id, ri, change),
            dt.row
          );
          if (!isNil(config.recalculateRow) && tabling.typeguards.isDataRow(r)) {
            r = { ...r, data: { ...r.data, ...config.recalculateRow(s, r) } };
          }
          return {
            ...s,
            data: util.replaceInArray<Table.BodyRow<R>>(s.data, { id: r.id }, r)
          };
        },
        state
      );
    } else if (tabling.typeguards.isRowAddEvent<R>(e)) {
      const p: Table.RowAddPayload<R> = e.payload;
      let d: Partial<R>[];
      if (tabling.typeguards.isRowAddCountPayload(p) || tabling.typeguards.isRowAddIndexPayload(p)) {
        d = tabling.patterns.generateNewRowData(
          { store: state.data, ...p },
          filter(config.columns, (c: Table.DataColumn<R, M>) => tabling.typeguards.isBodyColumn(c)) as Table.BodyColumn<
            R,
            M
          >[]
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
    } else if (tabling.typeguards.isRowDeleteEvent(e)) {
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
        filter(state.data, (r: Table.BodyRow<R>) => tabling.typeguards.isModelRow(r)) as Table.ModelRow<R>[],
        filter(ids, (id: Table.ModelRowId | Table.MarkupRowId) =>
          tabling.typeguards.isModelRowId(id)
        ) as Table.ModelRowId[]
      );
      const newState = removeRowsFromTheirGroupsIfTheyExist(state, modelRows);
      return reorderRows({
        ...newState,
        data: filter(newState.data, (ri: Table.BodyRow<R>) => !includes(ids, ri.id))
      });
    } else if (tabling.typeguards.isRowRemoveFromGroupEvent(e)) {
      const ids: Table.ModelRowId[] = Array.isArray(e.payload.rows) ? e.payload.rows : [e.payload.rows];
      const g: Table.GroupRow<R> | null = groupRowFromState<R, S>(state, e.payload.group);
      if (!isNil(g)) {
        return reorderRows({
          ...state,
          data: util.replaceInArray<Table.BodyRow<R>>(state.data, { id: g.id }, groupRowManager.removeChildren(g, ids))
        });
      }
    } else if (tabling.typeguards.isRowAddToGroupEvent(e)) {
      return reorderRows(updateRowGroup(state, e.payload.rows, e.payload.group));
    }
    return state;
  };
};

export default createChangeEventReducer;
