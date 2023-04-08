import { model, tabling } from "lib";

import * as types from "../../types";
import * as reducers from "../tabling";

type R = model.SubAccountRow;
type M = model.SubAccount;
type S = types.SubAccountTableStore;

type C = tabling.Row<"model", R> extends R ? true : false;

const recalculateSubAccountRow = (
  row: tabling.Row<tabling.DataRowType, R>,
  fringesStore: types.FringeTableStore,
): Pick<model.SubAccountRowData, "nominal_value" | "fringe_contribution"> => {
  /* In the case that the SubAccount has SubAccount(s) itself, the estimated value is determined
     from the accumulation of the estimated values for those children SubAccount(s).  In this case,
     we do not need to update the SubAccount estimated value in state because it only changes when
     the estimated values of it's SubAccount(s) on another page are altered. */
  const isValidToRecalculate =
    tabling.isPlaceholderRow(row) || (row.children !== undefined && row.children.length === 0);

  if (isValidToRecalculate) {
    const fringes: tabling.ModelRow<model.FringeRowData>[] = model.getModelsInState(
      fringesStore.data.filter((r: types.BodyRow<types.FringeRowData>) => tabling.isModelRow(r)),
      row.data.fringes,
    ) as types.ModelRow<types.FringeRowData>[];
    if (row.data.rate !== null && row.data.quantity !== null) {
      const multiplier = row.data.multiplier === null ? 1.0 : row.data.multiplier;
      return {
        nominal_value: row.data.quantity * row.data.rate * multiplier,
        fringe_contribution: model.contributionFromFringes(
          row.data.quantity * row.data.rate * multiplier,
          fringes,
        ),
      };
    } else {
      return {
        nominal_value: 0.0,
        fringe_contribution: model.contributionFromFringes(0.0, fringes),
      };
    }
  }
  return {
    nominal_value: row.data.nominal_value,
    fringe_contribution: row.data.fringe_contribution,
  };
};

export const createPublicSubAccountsTableReducer = <
  B extends model.Budget | model.Template,
  P extends model.Account | model.SubAccount,
>(
  config: Omit<
    types.TableReducerConfig<R, M, S, SubAccountsTableActionContext<B, P, true>>,
    "getModelRowChildren"
  >,
): types.Reducer<S, SubAccountsTableActionContext<B, P, true>> =>
  reducers.createPublicTableReducer<R, M, S, SubAccountsTableActionContext<B, P, true>>({
    ...config,
    getModelRowChildren: (m: model.SubAccount) => m.children,
  });

export const createAuthenticatedSubAccountsTableReducer = <
  B extends model.Budget | model.Template,
  P extends model.Account | model.SubAccount,
>(
  config: Omit<
    types.AuthenticatedTableReducerConfig<R, M, S, SubAccountsTableActionContext<B, P, false>>,
    "defaultDateOnCreate" | "defaultDataOnUpdate" | "getModelRowChildren"
  >,
): types.DynamicRequiredReducer<
  S,
  types.FringeTableStore,
  SubAccountsTableActionContext<B, P, false>
> => {
  const generic = reducers.createAuthenticatedTableReducer<
    R,
    M,
    S,
    SubAccountsTableActionContext<B, P, false>
  >({
    ...config,
    getModelRowChildren: (m: model.SubAccount) => m.children,
    defaultDataOnCreate: (r: Partial<R>): Partial<R> => {
      if (r.rate !== null && r.quantity === null) {
        return { ...r, quantity: 1.0 };
      }
      return r;
    },
    defaultDataOnUpdate: (
      r: tabling.ModelRow<R>,
      changes: tabling.RowChangeData<R, tabling.ModelRow<R>>,
    ): R => {
      if (r.data.rate !== null && r.data.quantity === null && changes.quantity === null) {
        return { ...r.data, quantity: 1.0 };
      }
      return r.data;
    },
  });

  return (
    state: S | undefined = config.initialState,
    action: types.AnyPayloadAction<SubAccountsTableActionContext<B, P, false>>,
    fringesStore: types.FringeTableStore,
  ): S =>
    generic(state, action, (s: types.SubAccountTableStore, row: tabling.DataRow<R>) =>
      recalculateSubAccountRow(row, fringesStore),
    );
};
