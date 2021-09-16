import { PayloadActionCreator } from "@reduxjs/toolkit";
import { isNil, reduce, map, includes, filter, flatten, uniqBy } from "lodash";

import { tabling, util, redux } from "lib";
import { createBudgetTableReducer, createAuthenticatedBudgetTableReducer, BudgetTableReducerConfig } from "./base";

type R = Tables.SubAccountRowData;
type M = Model.SubAccount;
type S = Tables.SubAccountTableStore;

/* eslint-disable indent */
const recalculateSubAccountRow = (
  st: S,
  action: Redux.Action,
  row: Table.DataRow<R, M>
): Pick<R, "estimated" | "fringe_contribution"> => {
  /*
  In the case that the SubAccount has SubAccount(s) itself, the estimated value is determined
  from the accumulation of the estimated values for those children SubAccount(s).  In this
  case,  we do not need to update the SubAccount estimated value in state because it only
  changes when the estimated values of it's SubAccount(s) on another page are altered.
  */
  const isValidToRecalculate =
    tabling.typeguards.isPlaceholderRow<R>(row) || (!isNil(row.children) && row.children.length === 0);

  if (isValidToRecalculate && !isNil(row.data.quantity) && !isNil(row.data.rate)) {
    const multiplier = row.data.multiplier || 1.0;
    const fringes: Table.Row<Tables.FringeRowData, Model.Fringe>[] = redux.reducers.findModelsInData(
      action,
      st.fringes.data,
      row.data.fringes,
      { name: "Fringe" }
    );
    return {
      estimated: row.data.quantity * row.data.rate * multiplier,
      fringe_contribution: tabling.businessLogic.contributionFromFringes(
        row.data.quantity * row.data.rate * multiplier,
        fringes
      )
    };
  }
  return {
    estimated: row.data.estimated,
    fringe_contribution: row.data.fringe_contribution
  };
};

export type SubAccountTableActionMap = Redux.TableActionMap<M> & {
  readonly responseSubAccountUnits: Http.ListResponse<Model.Tag>;
};

/* eslint-disable indent */
export const createUnauthenticatedSubAccountsTableReducer = (
  config: BudgetTableReducerConfig<R, M, S, SubAccountTableActionMap> & {
    readonly fringes: Redux.Reducer<Tables.FringeTableStore>;
  }
): Redux.Reducer<S> => {
  const generic = createBudgetTableReducer<R, M, S, SubAccountTableActionMap>(config);

  return (state: S | undefined = config.initialState, action: Redux.Action<any>): S => {
    let newState = generic(state, action);
    newState = { ...newState, fringes: config.fringes(newState.fringes, action) };

    if (action.type === config.actions.responseSubAccountUnits.toString()) {
      const payload: Http.ListResponse<Model.Tag> = action.payload;
      newState = { ...newState, subaccountUnits: payload.data };
    }
    newState = { ...newState, fringes: config.fringes(newState.fringes, action) };
    return newState;
  };
};

export type AuthenticatedSubAccountTableActionMap = Redux.AuthenticatedTableActionMap<R, M> & {
  readonly responseSubAccountUnits: Http.ListResponse<Model.Tag>;
};

export const createAuthenticatedSubAccountsTableReducer = (
  config: BudgetTableReducerConfig<R, M, S, AuthenticatedSubAccountTableActionMap> & {
    readonly fringes: Redux.Reducer<Tables.FringeTableStore>;
    readonly fringesTableChangedAction: PayloadActionCreator<Table.ChangeEvent<Tables.FringeRowData, Model.Fringe>>;
  }
): Redux.Reducer<S> => {
  const generic = createAuthenticatedBudgetTableReducer<R, M, S>({
    ...config,
    recalculateRow: recalculateSubAccountRow
  });

  return (state: S | undefined = config.initialState, action: Redux.Action<any>): S => {
    let newState = generic(state, action);
    newState = { ...newState, fringes: config.fringes(newState.fringes, action) };

    if (action.type === config.actions.responseSubAccountUnits.toString()) {
      const payload: Http.ListResponse<Model.Tag> = action.payload;
      newState = { ...newState, subaccountUnits: payload.data };
    } else if (action.type === config.fringesTableChangedAction.toString()) {
      /*
      Since the Fringes are displayed in a modal and not on a separate page, when a Fringe is
      changed we need to recalculate the SubAcccount(s) that have that Fringe so they display
      estimated values that are consistent with the change to the Fringe.
      */
      const e: Table.ChangeEvent<Tables.FringeRowData, Model.Fringe> = action.payload;

      // There are no group related events for the Fringe Table, but we have to assert this with
      // a typeguard to make TS happy.
      if (!tabling.typeguards.isGroupEvent(e)) {
        const recalculateSubAccountsWithFringes = (fringeIds: number[], removeFringes?: boolean): S => {
          /*
          For each Fringe that changed, we have to look at the SubAccount(s) that have that Fringe
          applied and recalculate the metrics for that SubAccount.

          Note that we have to recalculate the SubAccount metrics in entirety, instead of just
          refringing the SubAccount estimated value.  This is because the current estimated value
          on the SubAccount already has fringes applied, and we cannot refringe and already
          fringed value without knowing what the previous Fringe(s) were.
          */
          const rowsWithFringes: Table.DataRow<R, M>[] = flatten(
            map(
              fringeIds,
              (id: number) =>
                filter(
                  newState.data,
                  (row: Table.Row<R, M>) => tabling.typeguards.isDataRow(row) && includes(row.data.fringes, id)
                ) as Table.DataRow<R, M>[]
            )
          );
          return reduce(
            uniqBy(rowsWithFringes, (r: Table.DataRow<R, M>) => r.id),
            (s: S, r: Table.DataRow<R, M>): S => {
              let payload: Partial<R> = recalculateSubAccountRow(s, action, r);
              if (removeFringes === true) {
                payload = {
                  ...payload,
                  fringes: filter(r.data.fringes, (fringeId: number) => !includes(fringeIds, fringeId))
                };
              }
              return {
                ...s,
                data: util.replaceInArray<Table.Row<R, M>>(
                  s.data,
                  { id: r.id },
                  { ...r, data: { ...r.data, ...payload } }
                )
              };
            },
            newState
          );
        };
        // There are no group related events for the Fringe Table, but we have to assert this with
        // a typeguard to make TS happy.
        if (tabling.typeguards.isDataChangeEvent(e)) {
          /*
          For each Fringe change that occured, obtain the ID of the Fringe for only the changes
          that warrant recalculation of the SubAccount, and then recalculate the metrics for each
          SubAccount(s) that has that Fringe applied.

          We do not have to be concerned with the individual changes for each Fringe, since the
          actual changes will have already been applied to the Fringe(s) in the Fringe reducer.
          We only are concerned with the IDs of the Fringe(s) that changed, because we need those
          to determine what SubAccount(s) need to be updated (as a result of the change to the
          Fringe).
          */
          const consolidated = tabling.events.consolidateTableChange<Tables.FringeRowData, Model.Fringe>(e.payload);
          const ids: Table.DataRowId[] = map(
            filter(consolidated, (ch: Table.RowChange<Tables.FringeRowData, Model.Fringe>) =>
              tabling.typeguards.isDataRow(ch.row)
            ),
            (ch: Table.RowChange<Tables.FringeRowData, Model.Fringe>) => ch.id
          ) as Table.DataRowId[];
          newState = recalculateSubAccountsWithFringes(
            filter(ids, (id: Table.RowId) => tabling.typeguards.isModelRowId(id)) as number[]
          );
        } else if (tabling.typeguards.isRowAddEvent(e)) {
          // We do not need to worry about this right now, because when a Fringe is just added it
          // is not yet associated with a SubAccount.
        } else if (tabling.typeguards.isRowDeleteEvent(e)) {
          /*
          For each FringeRow that was removed, obtain the ID of the Fringe and then recalculate the
          metrics for each SubAccount(s) that previously had that Fringe applied, while simultaneously
          removing that Fringe from the SubAccount.
          */
          const ids: Table.RowId[] = Array.isArray(e.payload.rows) ? e.payload.rows : [e.payload.rows];
          newState = recalculateSubAccountsWithFringes(
            filter(ids, (id: Table.RowId) => tabling.typeguards.isModelRowId(id)) as number[],
            true
          );
        }
      }
    }
    return newState;
  };
};
