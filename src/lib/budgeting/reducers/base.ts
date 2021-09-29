import { isNil, includes, filter, reduce } from "lodash";

import { redux, tabling, util } from "lib";

/**
 * Returns (if present) the MarkupRow in state with a provided ID.  If the rowId is also
 * provided, it will only return the MarkupRow if that MarkupRow also pertains to the
 * specific rowId.
 */
/* eslint-disable indent */
export const markupRowFromState = <
  R extends Table.RowData,
  M extends Model.TypedHttpModel = Model.TypedHttpModel,
  S extends Redux.TableStore<R, M> = Redux.TableStore<R, M>
>(
  action: Redux.Action,
  st: S,
  id: Table.MarkupRowId,
  rowId?: Table.ModelRowId,
  options: Redux.FindModelOptions = { name: "Group", warnIfMissing: true }
): Table.MarkupRow<R> | null => {
  let predicate = (mrk: Table.MarkupRow<R>) => mrk.id === id;
  if (!isNil(rowId)) {
    predicate = (mrk: Table.MarkupRow<R>) => mrk.id === id && includes(mrk.children, rowId);
  }
  return redux.reducers.modelFromState<Table.MarkupRow<R>>(
    action,
    filter(st.data, (r: Table.Row<R>) => tabling.typeguards.isMarkupRow(r)) as Table.MarkupRow<R>[],
    predicate,
    options
  );
};

export type BudgetTableReducerConfig<
  R extends Tables.AccountRowData | Tables.SubAccountRowData,
  M extends Model.Account | Model.SubAccount,
  S extends Redux.TableStore<R, M> = Redux.TableStore<R, M>,
  A extends Redux.TableActionMap<M> = Redux.TableActionMap<M>
> = Table.ReducerConfig<R, M, S, A>;

export const createBudgetTableReducer = <
  R extends Tables.AccountRowData | Tables.SubAccountRowData,
  M extends Model.Account | Model.SubAccount,
  S extends Redux.TableStore<R, M> = Redux.TableStore<R, M>,
  A extends Redux.TableActionMap<M> = Redux.TableActionMap<M>
>(
  config: BudgetTableReducerConfig<R, M, S, A>
): Redux.Reducer<S> => {
  return tabling.reducers.createTableReducer<R, M, S, A>(config);
};

export const createBudgetTableChangeEventReducer = <
  R extends Tables.AccountRowData | Tables.SubAccountRowData,
  M extends Model.Account | Model.SubAccount,
  S extends Redux.TableStore<R, M> = Redux.TableStore<R, M>,
  A extends Redux.AuthenticatedTableActionMap<R, M> = Redux.AuthenticatedTableActionMap<R, M>
>(
  config: BudgetTableReducerConfig<R, M, S, A>
): Redux.Reducer<S, Redux.Action<Table.ChangeEvent<R>>> => {
  const generic = tabling.reducers.createTableChangeEventReducer<R, M, S, A>(config);

  return (state: S = config.initialState, action: Redux.Action<Table.ChangeEvent<R>>): S => {
    let newState: S = generic(state, action);

    const e: Table.ChangeEvent<R> = action.payload;
    if (tabling.typeguards.isMarkupAddEvent(e)) {
      const markup: Model.Markup = e.payload;

      const markupRow = tabling.rows.createMarkupRow<R, M>({
        columns: config.columns,
        model: markup,
        childrenRows: redux.reducers.findModelsInData(
          action,
          filter(newState.data, (r: Table.Row<R>) => tabling.typeguards.isModelRow(r)),
          markup.children
        )
      });
      // Insert the new MarkupRow(s) into the table and reorder the rows of the table so that the
      // MarkupRow(s) are in the appropriate location.
      newState = {
        ...newState,
        data: tabling.data.orderTableRows<R, M>([...newState.data, markupRow])
      };
    } else if (tabling.typeguards.isMarkupUpdateEvent(e)) {
      /*
      Note: Eventually we are going to want to try to treat this the same as an
      update to a regular row.
      */
      const markupRow: Table.MarkupRow<R> | null = markupRowFromState<R, M, S>(
        action,
        newState,
        tabling.rows.markupRowId(e.payload.id)
      );
      if (!isNil(markupRow)) {
        /*
        We first have to update the MarkupRow with the new Markup model - which
        will cause the MarkupRow to include updated values for the unit and rate
        properties.  Once that is done, we need to update the children rows of
        the MarkupRow to reflect these new values, and then finally update the
        MarkupRow again to reflect the new children.
        */
        let updatedMarkupRow = tabling.rows.updateMarkupRow({
          row: markupRow,
          columns: config.columns,
          model: e.payload.data
        });

        const childrenRows = filter(newState.data, (r: Table.Row<R>) =>
          tabling.typeguards.isModelRow(r)
        ) as Table.ModelRow<R>[];

        // Update the children rows of the MarkupRow to reflect the new MarkupRow data.
        newState = reduce(
          childrenRows,
          (st: S, r: Table.ModelRow<R>) => {
            const otherMarkupRows = filter(
              newState.data,
              (ri: Table.Row<R>) =>
                tabling.typeguards.isMarkupRow(ri) && includes(ri.children, r.id) && ri.id !== updatedMarkupRow.id
            ) as Table.MarkupRow<R>[];
            return {
              ...st,
              data: util.replaceInArray<Table.Row<R>>(
                st.data,
                { id: r.id },
                {
                  ...r,
                  data: {
                    ...r.data,
                    // Markup contributions get applied to the value after fringes are applied.
                    markup_contribution: tabling.businessLogic.contributionFromMarkups(
                      r.data.estimated + r.data.fringe_contribution,
                      [...otherMarkupRows, updatedMarkupRow]
                    )
                  }
                }
              )
            };
          },
          newState
        );
        newState = {
          ...newState,
          data: util.replaceInArray<Table.Row<R>>(
            newState.data,
            { id: updatedMarkupRow.id },
            tabling.rows.updateMarkupRow({
              row: updatedMarkupRow,
              columns: config.columns,
              childrenRows: filter(newState.data, (r: Table.Row<R>) =>
                tabling.typeguards.isModelRow(r)
              ) as Table.ModelRow<R>[]
            })
          )
        };
      }
    } else if (tabling.typeguards.isRowRemoveFromMarkupEvent(e)) {
      /*
      When a Row is removed from a Group, we first have to update the Row(s) in state so that they
      do not reference that Group, and also update the Group in state so it no longer references the
      row.  Then, we must recalculate the Group metrics (if applicable) to reflect the new Row(s) it
      contains.
      */
      const ids: Table.ModelRowId[] = Array.isArray(e.payload.rows) ? e.payload.rows : [e.payload.rows];

      const mk = markupRowFromState<R, M, S>(action, newState, e.payload.markup);
      if (!isNil(mk)) {
        const newChildren: Table.ModelRowId[] = filter(mk.children, (child: number) => !includes(ids, child));
        // TODO: We will need to recalculate the children rows.
        const childrenRows: Table.ModelRow<R>[] = redux.reducers.findModelsInData(
          action,
          filter(newState.data, (r: Table.Row<R>) => tabling.typeguards.isModelRow(r)),
          newChildren
        );
        newState = {
          ...newState,
          data: tabling.data.orderTableRows<R, M>(
            util.replaceInArray<Table.Row<R>>(
              newState.data,
              { id: mk.id },
              {
                ...mk,
                children: filter(mk.children, (child: number) => !includes(ids, child)),
                data: tabling.rows.updateMarkupRowData({
                  columns: config.columns,
                  data: mk.data,
                  childrenRows
                })
              }
            )
          )
        };
      }
    }
    return newState;
  };
};

export const createAuthenticatedBudgetTableReducer = <
  R extends Tables.AccountRowData | Tables.SubAccountRowData,
  M extends Model.Account | Model.SubAccount,
  S extends Redux.TableStore<R, M> = Redux.TableStore<R, M>,
  A extends Redux.AuthenticatedTableActionMap<R, M> = Redux.AuthenticatedTableActionMap<R, M>
>(
  config: BudgetTableReducerConfig<R, M, S, A> & {
    readonly recalculateRow?: (state: S, action: Redux.Action, row: Table.DataRow<R>) => Partial<R>;
  }
): Redux.Reducer<S> => {
  const eventReducer = createBudgetTableChangeEventReducer(config);

  return tabling.reducers.createAuthenticatedTableReducer<R, M, S, A>({
    ...config,
    eventReducer
  });
};
