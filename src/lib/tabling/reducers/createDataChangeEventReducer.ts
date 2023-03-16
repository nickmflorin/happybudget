import { isNil, reduce, filter } from "lodash";

import { tabling, redux, util } from "lib";

const createDataChangeEventReducer =
  <
    R extends Table.RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    S extends Redux.TableStore<R> = Redux.TableStore<R>,
    C extends Redux.ActionContext = Redux.ActionContext,
  >(
    config: Omit<Table.AuthenticatedReducerConfig<R, M, S, C>, "defaultDataOnCreate">,
  ): Redux.BasicDynamicReducer<
    S,
    Redux.RecalculateRowReducerCallback<S, R>,
    Table.DataChangeEvent<R>
  > =>
  (
    s: S = config.initialState,
    e: Table.DataChangeEvent<R>,
    recalculateRow?: Redux.RecalculateRowReducerCallback<S, R>,
  ): S => {
    const modelRowManager = new tabling.rows.ModelRowManager<R, M>({
      getRowChildren: config.getModelRowChildren,
      columns: config.columns,
    });
    const markupRowManager = new tabling.rows.MarkupRowManager<R, M>({ columns: config.columns });

    const consolidated = tabling.events.consolidateRowChanges(e.payload);

    /*
		Note: This grouping may be redundant in the case that the change is
		dispatched from the Table as the Table will already group the changes
		by Row, but it is not guaranteed to be the case if the event is dispatched
		from other locations.
		*/
    type ChangesPerRow = { [key: ID]: { data: Table.RowChangeData<R>; row: Table.EditableRow<R> } };

    const changesPerRow: ChangesPerRow = reduce(
      consolidated,
      (curr: ChangesPerRow, rowChange: Table.RowChange<R>) => {
        const r: Table.EditableRow<R> | null = redux.findModelInData<Table.EditableRow<R>>(
          filter(s.data, (ri: Table.BodyRow<R>) =>
            tabling.rows.isEditableRow(ri),
          ) as Table.EditableRow<R>[],
          rowChange.id,
        );
        /*
				A warning will be issued if the row associated with the change could
      	not be found.
				*/
        if (!isNil(r)) {
          if (!isNil(curr[r.id])) {
            return { ...curr, [r.id]: { row: r, data: { ...curr[r.id].data, ...rowChange.data } } };
          } else {
            return { ...curr, [r.id]: { data: rowChange.data, row: r } };
          }
        } else {
          return curr;
        }
      },
      {},
    );
    // Apply change to Row stored in state for each Row that was changed.
    return reduce(
      changesPerRow,
      (st: S, dt: { data: Table.RowChangeData<R>; row: Table.EditableRow<R> }) => {
        let r: Table.EditableRow<R> = tabling.rows.isMarkupRow(dt.row)
          ? markupRowManager.mergeChangesWithRow(
              dt.row,
              dt.data as Table.RowChangeData<R, Table.MarkupRow<R>>,
            )
          : modelRowManager.mergeChangesWithRow(
              dt.row,
              dt.data as Table.RowChangeData<R, Table.ModelRow<R>>,
            );

        // Add the default data before recalculations are performed.
        if (tabling.rows.isModelRow(r)) {
          r = tabling.rows.applyDefaultsOnUpdate(
            tabling.columns.filterModelColumns(config.columns),
            r,
            dt.data as Table.RowChangeData<R, Table.ModelRow<R>>,
            config.defaultDataOnUpdate,
          );
        }
        if (tabling.rows.isDataRow(r)) {
          r = { ...r, data: { ...r.data, ...recalculateRow?.(st, r) } };
        }
        return {
          ...st,
          data: util.replaceInArray<Table.BodyRow<R>>(st.data, { id: r.id }, r),
        };
      },
      s,
    );
  };

export default createDataChangeEventReducer;
