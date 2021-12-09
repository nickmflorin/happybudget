import { isNil, filter } from "lodash";

import { tabling, redux, budgeting } from "lib";
import { createBudgetTableReducer, createAuthenticatedBudgetTableReducer, BudgetTableReducerConfig } from "./base";

type R = Tables.SubAccountRowData;
type M = Model.SubAccount;
type S = Tables.SubAccountTableStore;

/* eslint-disable indent */
const recalculateSubAccountRow = (
  st: S,
  action: Redux.Action,
  row: Table.DataRow<R>
): Pick<R, "nominal_value" | "fringe_contribution"> => {
  /*
  In the case that the SubAccount has SubAccount(s) itself, the estimated value
	is determined from the accumulation of the estimated values for those children
	SubAccount(s).  In this case,  we do not need to update the SubAccount estimated
	value in state because it only changes when the estimated values of it's
	SubAccount(s) on another page are altered.
  */
  const isValidToRecalculate =
    tabling.typeguards.isPlaceholderRow<R>(row) || (!isNil(row.children) && row.children.length === 0);

  if (isValidToRecalculate) {
    const fringes: Tables.FringeRow[] = redux.reducers.findModelsInData(
      action,
      filter(st.fringes.data, (r: Table.BodyRow<Tables.FringeRowData>) => tabling.typeguards.isModelRow(r)),
      row.data.fringes,
      { name: "Fringe" }
    );
    if (!isNil(row.data.quantity) && !isNil(row.data.rate)) {
      const multiplier = row.data.multiplier || 1.0;
      return {
        nominal_value: row.data.quantity * row.data.rate * multiplier,
        fringe_contribution: budgeting.businessLogic.contributionFromFringes(
          row.data.quantity * row.data.rate * multiplier,
          fringes
        )
      };
    } else {
      return {
        nominal_value: 0.0,
        fringe_contribution: budgeting.businessLogic.contributionFromFringes(0.0, fringes)
      };
    }
  }
  return {
    nominal_value: row.data.nominal_value,
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
  config: Omit<
    BudgetTableReducerConfig<R, M, S, AuthenticatedSubAccountTableActionMap> & {
      readonly fringes: Redux.Reducer<Tables.FringeTableStore>;
    },
    "defaultData"
  >
): Redux.Reducer<S> => {
  const generic = createAuthenticatedBudgetTableReducer<R, M, S>({
    ...config,
    defaultData: {
      markup_contribution: 0.0,
      fringe_contribution: 0.0,
      actual: 0.0,
      accumulated_markup_contribution: 0.0,
      accumulated_fringe_contribution: 0.0
    },
    recalculateRow: recalculateSubAccountRow
  });

  return (state: S | undefined = config.initialState, action: Redux.Action<any>): S => {
    let newState = generic(state, action);
    newState = { ...newState, fringes: config.fringes(newState.fringes, action) };

    if (action.type === config.actions.responseSubAccountUnits.toString()) {
      const payload: Http.ListResponse<Model.Tag> = action.payload;
      newState = { ...newState, subaccountUnits: payload.data };
    }
    return newState;
  };
};
