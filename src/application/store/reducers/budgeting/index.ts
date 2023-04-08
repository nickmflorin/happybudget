import { Optional } from "utility-types";

import { model, tabling } from "lib";

import * as initialState from "../../initialState";
import * as types from "../../types";
import * as factories from "../factories";

import {
  createAuthenticatedSubAccountsTableReducer,
  createPublicSubAccountsTableReducer,
} from "./subaccounts";

export * from "./actuals";
export * from "./subaccounts";
export * from "./accounts";
export * from "./fringes";

type R = model.SubAccountRow;

type ReducerConfig<
  B extends model.Budget | model.Template,
  M extends model.Account | model.SubAccount,
  PUBLIC extends boolean = false,
> = types.ReducerConfig<
  types.AccountOrSubAccountStore<M>,
  Optional<
    types.ActionCreatorMap<types.ModelDetailActionPayloadMap<M>, ModelActionContext<M, B, PUBLIC>>,
    "updateInState"
  >,
  ModelActionContext<M, B, PUBLIC>
> & {
  readonly columns: tabling.ModelColumn<R, model.SubAccount>[];
};

export const createPublicAccountSubAccountStoreReducer = <
  B extends model.Budget | model.Template,
  M extends model.Account | model.SubAccount,
>(
  config: ReducerConfig<B, M, true> & {
    readonly tableActions: types.TableActionCreatorMap<
      model.SubAccount,
      SubAccountsTableActionContext<B, M, true>
    >;
  },
): types.Reducer<
  types.AccountOrSubAccountStore<M>,
  ModelActionContext<M, B, true> | SubAccountsTableActionContext<B, M, true>
> => {
  const tableReducer = createPublicSubAccountsTableReducer<B, M>({
    actions: config.tableActions,
    columns: config.columns,
    initialState: config.initialState.table,
  });
  const detailReducer = factories.createDetailReducer<M, ModelActionContext<M, B, true>>({
    initialState: initialState.initialDetailResponseState,
    actions: config.actions,
  });
  return <P extends types.ActionPayload>(
    s: types.AccountOrSubAccountStore<M> | undefined = config.initialState,
    a: types.Action<P, ModelActionContext<M, B, true> | SubAccountsTableActionContext<B, M, true>>,
  ) => ({
    table: tableReducer(s.table, a as types.Action<P, SubAccountsTableActionContext<B, M, true>>),
    detail: detailReducer(s.detail, a as types.Action<P, ModelActionContext<M, B, true>>),
  });
};

export const createAuthenticatedAccountSubAccountStoreReducer = <
  B extends model.Budget | model.Template,
  M extends model.Account | model.SubAccount,
>(
  config: ReducerConfig<B, M> & {
    readonly tableActions: types.AuthenticatedTableActionCreatorMap<
      R,
      model.SubAccount,
      SubAccountsTableActionContext<B, M, false>
    >;
  },
): types.DynamicRequiredReducer<
  types.AccountOrSubAccountStore<M>,
  types.FringeTableStore,
  ModelActionContext<M, B, false> | SubAccountsTableActionContext<B, M, false>
> => {
  const tableReducer = createAuthenticatedSubAccountsTableReducer<B, M>({
    actions: config.tableActions,
    columns: config.columns,
    initialState: config.initialState.table,
  });
  const detailReducer = factories.createDetailReducer<M, ModelActionContext<M, B, false>>({
    initialState: initialState.initialDetailResponseState,
    actions: config.actions,
  });
  return <P extends types.ActionPayload>(
    s: types.AccountOrSubAccountStore<M> | undefined = config.initialState,
    a: types.Action<
      P,
      ModelActionContext<M, B, false> | SubAccountsTableActionContext<B, M, false>
    >,
    fringesStore: types.FringeTableStore,
  ) => ({
    table: tableReducer(
      s.table,
      a as types.Action<P, SubAccountsTableActionContext<B, M, false>>,
      fringesStore,
    ),
    detail: detailReducer(s.detail, a as types.Action<P, ModelActionContext<M, B, false>>),
  });
};
