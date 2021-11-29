import { isNil, includes, filter, reduce } from "lodash";

import { redux, tabling, util, budgeting } from "lib";

/**
 * Returns (if present) the MarkupRow in state with a provided ID.  If the rowId is also
 * provided, it will only return the MarkupRow if that MarkupRow also pertains to the
 * specific rowId.
 */
/* eslint-disable indent */
export const markupRowFromState = <R extends Table.RowData, S extends Redux.TableStore<R> = Redux.TableStore<R>>(
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
    filter(st.data, (r: Table.BodyRow<R>) => tabling.typeguards.isMarkupRow(r)) as Table.MarkupRow<R>[],
    predicate,
    options
  );
};

export type BudgetTableReducerConfig<
  R extends Tables.AccountRowData | Tables.SubAccountRowData,
  M extends Model.Account | Model.SubAccount,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
  A extends Redux.TableActionMap<M> = Redux.TableActionMap<M>
> = Table.ReducerConfig<R, M, S, A>;

export const createBudgetTableReducer = <
  R extends Tables.AccountRowData | Tables.SubAccountRowData,
  M extends Model.Account | Model.SubAccount,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
  A extends Redux.TableActionMap<M> = Redux.TableActionMap<M>
>(
  config: BudgetTableReducerConfig<R, M, S, A>
): Redux.Reducer<S> => {
  return tabling.reducers.createTableReducer<R, M, S, A>(config);
};

export const createBudgetTableChangeEventReducer = <
  R extends Tables.AccountRowData | Tables.SubAccountRowData,
  M extends Model.Account | Model.SubAccount,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
  A extends Redux.AuthenticatedTableActionMap<R, M> = Redux.AuthenticatedTableActionMap<R, M>
>(
  config: BudgetTableReducerConfig<R, M, S, A>
): Redux.Reducer<S, Redux.Action<Table.ChangeEvent<R, M>>> => {
  const isSubAccountRowData = (
    data: Tables.AccountRowData | Tables.SubAccountRowData
  ): data is Tables.SubAccountRowData => (data as Tables.SubAccountRowData).fringe_contribution !== undefined;

  const generic = tabling.reducers.createTableChangeEventReducer<R, M, S, A>(config);

  return (state: S = config.initialState, action: Redux.Action<Table.ChangeEvent<R, M>>): S => {
    let newState: S = generic(state, action);

    const markupRowManager = new tabling.managers.MarkupRowManager({ columns: config.columns });

    const e: Table.ChangeEvent<R, M> = action.payload;
    if (tabling.typeguards.isMarkupAddedEvent(e)) {
      const markup: Model.Markup = e.payload;

      const markupRow = markupRowManager.create({ model: markup });

      // Insert the new MarkupRow(s) into the table and reorder the rows of the table so that the
      // MarkupRow(s) are in the appropriate location.
      return {
        ...newState,
        data: tabling.data.orderTableRows<R>([...newState.data, markupRow])
      };
    } else if (tabling.typeguards.isMarkupUpdatedEvent(e)) {
      /*
      Note: This event occurs when Markup is updated via a Modal and the response
      is received - so we have access to the complete updated Markup and do not
      need to perform any recalculations or manipulations of the Markup itself,
      just the children that belong to the Markup.
      */
      const markupRow: Table.MarkupRow<R> | null = markupRowFromState<R, S>(
        action,
        newState,
        tabling.managers.markupRowId(e.payload.id)
      );
      if (!isNil(markupRow)) {
        /*
        We first have to update the MarkupRow with the new Markup model - which
        will cause the MarkupRow to include updated values for the unit and rate
        properties.  Once that is done, we need to update the children rows of
        the MarkupRow to reflect these new values, and then finally update the
        MarkupRow again to reflect the new children.
        */
        let updatedMarkupRow = markupRowManager.create({ model: e.payload });
        const childrenRows = filter(
          newState.data,
          (r: Table.BodyRow<R>) => tabling.typeguards.isModelRow(r) && includes(updatedMarkupRow.children, r.id)
        ) as Table.ModelRow<R>[];
        // Update the Markup Row itself in state.
        newState = {
          ...state,
          data: util.replaceInArray<Table.BodyRow<R>>(state.data, { id: updatedMarkupRow.id }, updatedMarkupRow)
        };
        // Update the children rows of the MarkupRow to reflect the new MarkupRow data.
        return reduce(
          childrenRows,
          (st: S, r: Table.ModelRow<R>) => {
            const otherMarkupRows = filter(
              newState.data,
              (ri: Table.BodyRow<R>) =>
                tabling.typeguards.isMarkupRow(ri) && includes(ri.children, r.id) && ri.id !== updatedMarkupRow.id
            ) as Table.MarkupRow<R>[];
            return {
              ...st,
              data: util.replaceInArray<Table.BodyRow<R>>(
                st.data,
                { id: r.id },
                {
                  ...r,
                  data: {
                    ...r.data,
                    // Markup contributions get applied to the value after fringes are applied.
                    markup_contribution: budgeting.businessLogic.contributionFromMarkups(
                      isSubAccountRowData(r.data)
                        ? r.data.nominal_value +
                            r.data.accumulated_fringe_contribution +
                            r.data.accumulated_markup_contribution +
                            r.data.fringe_contribution
                        : r.data.nominal_value +
                            r.data.accumulated_fringe_contribution +
                            r.data.accumulated_markup_contribution,
                      [...otherMarkupRows, updatedMarkupRow]
                    )
                  }
                }
              )
            };
          },
          newState
        );
      }
    } else if (tabling.typeguards.isRowRemoveFromMarkupEvent(e)) {
      const ids: Table.ModelRowId[] = Array.isArray(e.payload.rows) ? e.payload.rows : [e.payload.rows];
      const mk = markupRowFromState<R, S>(action, newState, e.payload.markup);
      if (!isNil(mk)) {
        return {
          ...newState,
          data: tabling.data.orderTableRows<R>(
            util.replaceInArray<Table.BodyRow<R>>(
              newState.data,
              { id: mk.id },
              markupRowManager.removeChildren(mk, ids)
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
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
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
