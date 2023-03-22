import { isNil, filter } from "lodash";

import { tabling, redux, model } from "lib";

type R = Tables.SubAccountRowData;
type M = Model.SubAccount;
type S = Tables.SubAccountTableStore;

const recalculateSubAccountRow = (
  row: Table.DataRow<R>,
  fringesStore: Tables.FringeTableStore,
): Pick<R, "nominal_value" | "fringe_contribution"> => {
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
      filter(fringesStore.data, (r: Table.BodyRow<Tables.FringeRowData>) =>
        tabling.rows.isModelRow(r),
      ),
      row.data.fringes,
    ) as Table.ModelRow<Tables.FringeRowData>[];
    if (!isNil(row.data.rate) && !isNil(row.data.quantity)) {
      const multiplier = row.data.multiplier === null ? 1.0 : row.data.multiplier;
      return {
        nominal_value: row.data.quantity * row.data.rate * multiplier,
        fringe_contribution: model.budgeting.contributionFromFringes(
          row.data.quantity * row.data.rate * multiplier,
          fringes,
        ),
      };
    } else {
      return {
        nominal_value: 0.0,
        fringe_contribution: model.budgeting.contributionFromFringes(0.0, fringes),
      };
    }
  }
  return {
    nominal_value: row.data.nominal_value,
    fringe_contribution: row.data.fringe_contribution,
  };
};

export const createPublicSubAccountsTableReducer = <
  B extends Model.Budget | Model.Template,
  P extends Model.Account | Model.SubAccount,
>(
  config: Omit<
    Table.ReducerConfig<R, M, S, SubAccountsTableActionContext<B, P, true>>,
    "getModelRowChildren"
  >,
): Redux.Reducer<S, SubAccountsTableActionContext<B, P, true>> =>
  tabling.reducers.createPublicTableReducer<R, M, S, SubAccountsTableActionContext<B, P, true>>({
    ...config,
    getModelRowChildren: (m: Model.SubAccount) => m.children,
  });

export const createAuthenticatedSubAccountsTableReducer = <
  B extends Model.Budget | Model.Template,
  P extends Model.Account | Model.SubAccount,
>(
  config: Omit<
    Table.AuthenticatedReducerConfig<R, M, S, SubAccountsTableActionContext<B, P, false>>,
    "defaultDateOnCreate" | "defaultDataOnUpdate" | "getModelRowChildren"
  >,
): Redux.DynamicRequiredReducer<
  S,
  Tables.FringeTableStore,
  SubAccountsTableActionContext<B, P, false>
> => {
  const generic = tabling.reducers.createAuthenticatedTableReducer<
    R,
    M,
    S,
    SubAccountsTableActionContext<B, P, false>
  >({
    ...config,
    getModelRowChildren: (m: Model.SubAccount) => m.children,
    defaultDataOnCreate: (r: Partial<R>): Partial<R> => {
      if (!isNil(r.rate) && isNil(r.quantity)) {
        return { ...r, quantity: 1.0 };
      }
      return r;
    },
    defaultDataOnUpdate: (
      r: Table.ModelRow<R>,
      changes: Table.RowChangeData<R, Table.ModelRow<R>>,
    ): R => {
      if (!isNil(r.data.rate) && isNil(r.data.quantity) && isNil(changes.quantity)) {
        return { ...r.data, quantity: 1.0 };
      }
      return r.data;
    },
  });

  return (
    state: S | undefined = config.initialState,
    action: Redux.AnyPayloadAction<SubAccountsTableActionContext<B, P, false>>,
    fringesStore: Tables.FringeTableStore,
  ): S =>
    generic(state, action, (s: Tables.SubAccountTableStore, row: Table.DataRow<R>) =>
      recalculateSubAccountRow(row, fringesStore),
    );
};
