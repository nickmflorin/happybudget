import { isNil, reduce, filter } from "lodash";

import { tabling, redux, util } from "lib";

const createDataChangeEventReducer =
  <
    R extends Table.RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    S extends Redux.TableStore<R> = Redux.TableStore<R>,
    C extends Table.Context = Table.Context,
    A extends Redux.AuthenticatedTableActionMap<R, M, C> = Redux.AuthenticatedTableActionMap<R, M, C>
  >(
    config: Omit<Table.ReducerConfig<R, M, S, C, A>, "defaultDataOnCreate"> & {
      readonly recalculateRow?: (state: S, row: Table.DataRow<R>) => Partial<R>;
    }
  ): Redux.Reducer<S, Table.DataChangeEvent<R>> =>
  (s: S = config.initialState, e: Table.DataChangeEvent<R>): S => {
    const modelRowManager = new tabling.rows.ModelRowManager<R, M>({
      getRowChildren: config.getModelRowChildren,
      columns: config.columns
    });
    const markupRowManager = new tabling.rows.MarkupRowManager<R, M>({ columns: config.columns });

    const consolidated = tabling.events.consolidateRowChanges(e.payload);

    /* Note: This grouping may be redundant in the case that the change is
       dispatched from the Table as the Table will already group the changes
       by Row, but it is not guaranteed to be the case if the event is dispatched
       from other locations. */
    const changesPerRow: {
      [key: ID]: { changes: Table.RowChange<R>[]; row: Table.EditableRow<R> };
    } = {};
    for (let i = 0; i < consolidated.length; i++) {
      if (isNil(changesPerRow[consolidated[i].id])) {
        const r: Table.EditableRow<R> | null = redux.reducers.findModelInData<Table.EditableRow<R>>(
          filter(s.data, (ri: Table.BodyRow<R>) => tabling.rows.isEditableRow(ri)) as Table.EditableRow<R>[],
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
      (st: S, dt: { changes: Table.RowChange<R>[]; row: Table.EditableRow<R> }) => {
        let r: Table.EditableRow<R> = reduce(
          dt.changes,
          (ri: Table.EditableRow<R>, change: Table.RowChange<R>) => {
            if (tabling.rows.isMarkupRow(ri)) {
              return markupRowManager.mergeChangesWithRow(ri, change as Table.RowChange<R, Table.MarkupRow<R>>);
            } else {
              return modelRowManager.mergeChangesWithRow(ri, change as Table.RowChange<R, Table.ModelRow<R>>);
            }
          },
          dt.row
        );
        /* Make sure to add in the default data before any recalculations are
           performed. */
        if (tabling.rows.isModelRow(r)) {
          r = tabling.rows.applyDefaultsOnUpdate(
            tabling.columns.filterModelColumns(config.columns),
            r,
            config.defaultDataOnUpdate
          );
        }
        if (!isNil(config.recalculateRow) && tabling.rows.isDataRow(r)) {
          r = { ...r, data: { ...r.data, ...config.recalculateRow(st, r) } };
        }
        return {
          ...st,
          data: util.replaceInArray<Table.BodyRow<R>>(st.data, { id: r.id }, r)
        };
      },
      s
    );
  };

export default createDataChangeEventReducer;
