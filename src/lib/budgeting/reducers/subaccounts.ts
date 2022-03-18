import { isNil, filter } from "lodash";

import { tabling, redux, model } from "lib";

type R = Tables.SubAccountRowData;
type M = Model.SubAccount;
type S = Tables.SubAccountTableStore;
type CTX = Tables.SubAccountTableContext;
type ACTION = Redux.TableAction<Redux.ActionPayload, CTX>;

const recalculateSubAccountRow = (st: S, row: Table.DataRow<R>): Pick<R, "nominal_value" | "fringe_contribution"> => {
  /*
  In the case that the SubAccount has SubAccount(s) itself, the estimated value
	is determined from the accumulation of the estimated values for those children
	SubAccount(s).  In this case,  we do not need to update the SubAccount estimated
	value in state because it only changes when the estimated values of it's
	SubAccount(s) on another page are altered.
  */
  const isValidToRecalculate =
    tabling.rows.isPlaceholderRow<R>(row) || (!isNil(row.children) && row.children.length === 0);

  if (isValidToRecalculate) {
    const fringes: Table.ModelRow<Tables.FringeRowData>[] = redux.findModelsInData(
      filter(st.fringes.data, (r: Table.BodyRow<Tables.FringeRowData>) => tabling.rows.isModelRow(r)),
      row.data.fringes
    ) as Table.ModelRow<Tables.FringeRowData>[];
    if (!isNil(row.data.rate)) {
      const multiplier = row.data.multiplier || 1.0;
      const quantity = row.data.quantity === null ? 1.0 : row.data.quantity;
      return {
        nominal_value: quantity * row.data.rate * multiplier,
        fringe_contribution: model.budgeting.contributionFromFringes(quantity * row.data.rate * multiplier, fringes)
      };
    } else {
      return {
        nominal_value: 0.0,
        fringe_contribution: model.budgeting.contributionFromFringes(0.0, fringes)
      };
    }
  }
  return {
    nominal_value: row.data.nominal_value,
    fringe_contribution: row.data.fringe_contribution
  };
};

export type SubAccountTableActionMap = Redux.TableActionMap<M, CTX> & {
  readonly responseSubAccountUnits: Redux.ActionCreator<Http.ListResponse<Model.Tag>>;
};

export const createPublicSubAccountsTableReducer = (
  config: Table.ReducerConfig<R, M, S, CTX, SubAccountTableActionMap> & {
    readonly fringes: Redux.Reducer<
      Tables.FringeTableStore,
      Redux.TableAction<Redux.ActionPayload, Tables.FringeTableContext>
    >;
  }
): Redux.Reducer<S, ACTION> => {
  const generic = tabling.reducers.createPublicTableReducer<R, M, S, CTX, SubAccountTableActionMap, ACTION>(config);

  return (state: S | undefined = config.initialState, action: ACTION): S => {
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

export type AuthenticatedSubAccountTableActionMap = Redux.AuthenticatedTableActionMap<
  R,
  M,
  Tables.SubAccountTableContext
> & {
  readonly responseSubAccountUnits: Redux.ActionCreator<Http.ListResponse<Model.Tag>>;
};

export const createAuthenticatedSubAccountsTableReducer = (
  config: Omit<
    Table.ReducerConfig<R, M, S, Tables.SubAccountTableContext, AuthenticatedSubAccountTableActionMap> & {
      readonly fringes: Redux.Reducer<
        Tables.FringeTableStore,
        Redux.TableAction<Redux.ActionPayload, Tables.FringeTableContext>
      >;
    },
    "defaultDateOnCreate" | "defaultDataOnUpdate"
  >
): Redux.Reducer<S, ACTION> => {
  const generic = tabling.reducers.createAuthenticatedTableReducer<
    R,
    M,
    S,
    CTX,
    AuthenticatedSubAccountTableActionMap,
    ACTION
  >({
    ...config,
    defaultDataOnCreate: (r: Partial<R>): Partial<R> => {
      if (!isNil(r.rate) && isNil(r.quantity)) {
        return { ...r, quantity: 1.0 };
      }
      return r;
    },
    defaultDataOnUpdate: (r: Table.ModelRow<R>): R => {
      if (!isNil(r.data.rate) && isNil(r.data.quantity)) {
        return { ...r.data, quantity: 1.0 };
      }
      return r.data;
    },
    recalculateRow: recalculateSubAccountRow
  });

  return (state: S | undefined = config.initialState, action: ACTION): S => {
    let newState = generic(state, action);
    newState = { ...newState, fringes: config.fringes(newState.fringes, action) };

    if (action.type === config.actions.responseSubAccountUnits.toString()) {
      const payload: Http.ListResponse<Model.Tag> = action.payload;
      newState = { ...newState, subaccountUnits: payload.data };
    }
    return newState;
  };
};
