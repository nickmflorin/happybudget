import { Optional } from "utility-types";

import { redux } from "lib";

import {
  createAuthenticatedSubAccountsTableReducer,
  createPublicSubAccountsTableReducer,
} from "./subaccounts";

export * from "./actuals";
export * from "./subaccounts";
export * from "./accounts";
export * from "./fringes";

type R = Tables.SubAccountRowData;

type ReducerConfig<
  B extends Model.Budget | Model.Template,
  M extends Model.Account | Model.SubAccount,
  PUBLIC extends boolean = false,
> = Redux.ReducerConfig<
  Modules.AccountOrSubAccountStore<M>,
  Optional<
    Redux.ActionCreatorMap<Redux.ModelDetailActionPayloadMap<M>, ModelActionContext<M, B, PUBLIC>>,
    "updateInState"
  >,
  ModelActionContext<M, B, PUBLIC>
> & {
  readonly columns: Table.ModelColumn<R, Model.SubAccount>[];
};

export const createPublicAccountSubAccountStoreReducer = <
  B extends Model.Budget | Model.Template,
  M extends Model.Account | Model.SubAccount,
>(
  config: ReducerConfig<B, M, true> & {
    readonly tableActions: Redux.TableActionCreatorMap<
      Model.SubAccount,
      SubAccountsTableActionContext<B, M, true>
    >;
  },
): Redux.Reducer<
  Modules.AccountOrSubAccountStore<M>,
  ModelActionContext<M, B, true> | SubAccountsTableActionContext<B, M, true>
> => {
  const tableReducer = createPublicSubAccountsTableReducer<B, M>({
    actions: config.tableActions,
    columns: config.columns,
    initialState: config.initialState.table,
  });
  const detailReducer = redux.reducers.createDetailReducer<M, ModelActionContext<M, B, true>>({
    initialState: redux.initialDetailResponseState,
    actions: config.actions,
  });
  return (
    s: Modules.AccountOrSubAccountStore<M> | undefined = config.initialState,
    a: Redux.AnyPayloadAction<
      ModelActionContext<M, B, true> | SubAccountsTableActionContext<B, M, true>
    >,
  ) => ({
    table: tableReducer(
      s.table,
      a as Redux.AnyPayloadAction<SubAccountsTableActionContext<B, M, true>>,
    ),
    detail: detailReducer(s.detail, a as Redux.AnyPayloadAction<ModelActionContext<M, B, true>>),
  });
};

export const createAuthenticatedAccountSubAccountStoreReducer = <
  B extends Model.Budget | Model.Template,
  M extends Model.Account | Model.SubAccount,
>(
  config: ReducerConfig<B, M> & {
    readonly tableActions: Redux.AuthenticatedTableActionCreatorMap<
      R,
      Model.SubAccount,
      SubAccountsTableActionContext<B, M, false>
    >;
  },
): Redux.DynamicRequiredReducer<
  Modules.AccountOrSubAccountStore<M>,
  Tables.FringeTableStore,
  ModelActionContext<M, B, false> | SubAccountsTableActionContext<B, M, false>
> => {
  const tableReducer = createAuthenticatedSubAccountsTableReducer<B, M>({
    actions: config.tableActions,
    columns: config.columns,
    initialState: config.initialState.table,
  });
  const detailReducer = redux.reducers.createDetailReducer<M, ModelActionContext<M, B, false>>({
    initialState: redux.initialDetailResponseState,
    actions: config.actions,
  });
  return (
    s: Modules.AccountOrSubAccountStore<M> | undefined = config.initialState,
    a: Redux.AnyPayloadAction<
      ModelActionContext<M, B, false> | SubAccountsTableActionContext<B, M, false>
    >,
    fringesStore: Tables.FringeTableStore,
  ) => ({
    table: tableReducer(
      s.table,
      a as Redux.AnyPayloadAction<SubAccountsTableActionContext<B, M, false>>,
      fringesStore,
    ),
    detail: detailReducer(s.detail, a as Redux.AnyPayloadAction<ModelActionContext<M, B, false>>),
  });
};
