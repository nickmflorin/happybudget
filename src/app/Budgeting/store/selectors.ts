import { createSelector } from "reselect";
import { filter, isNil } from "lodash";

import { tabling, model } from "lib";
import * as initialState from "./initialState";

type SelectBudgetStore = {
  <B extends Model.Budget | Model.Template, PUBLIC extends boolean = boolean>(
    s: Application.Store,
    ctx: Omit<BudgetActionContext<B, PUBLIC>, "budgetId">
  ): Modules.BudgetStoreLookup<B, PUBLIC>;
};

export const selectBudgetStore = createSelector(
  [(s: Application.Store) => s, (s: Application.Store, ctx: Omit<BudgetContext, "budgetId">) => ctx],
  (
    s: Application.Store,
    ctx: Omit<BudgetActionContext<Model.Budget | Model.Template, true | false>, "budgetId">
  ): Modules.PublicBudget.Store | Modules.Budget.Store | Modules.Template.Store =>
    ctx.public === true ? s.public.budget : s[ctx.domain]
) as SelectBudgetStore;

type SelectBudgetDetail = {
  <B extends Model.Budget | Model.Template, PUBLIC extends boolean = boolean>(
    s: Application.Store,
    ctx: Omit<BudgetActionContext<B, PUBLIC>, "budgetId">
  ): B;
};

export const selectBudgetDetail = createSelector(
  selectBudgetStore,
  (s: Modules.PublicBudget.Store | Modules.Budget.Store | Modules.Template.Store) => s.detail.data
) as SelectBudgetDetail;

export const selectBudgetLoading = createSelector(
  selectBudgetStore,
  (s: Modules.PublicBudget.Store | Modules.Budget.Store | Modules.Template.Store) => s.detail.loading
);

type SelectAccountsTableStore = {
  <B extends Model.Budget | Model.Template, PUBLIC extends boolean = boolean>(
    s: Application.Store,
    ctx: Omit<AccountsTableActionContext<B, PUBLIC>, "budgetId">
  ): Modules.BudgetStoreLookup<B, PUBLIC>["accounts"];
};

export const selectAccountsTableStore = createSelector(
  selectBudgetStore,
  (s: Modules.PublicBudget.Store | Modules.Budget.Store | Modules.Template.Store) => s.accounts
) as SelectAccountsTableStore;

export const createAccountsTableStoreSelector = <
  B extends Model.Budget | Model.Template,
  PUBLIC extends boolean = boolean
>(
  ctx: Omit<AccountsTableActionContext<B, PUBLIC>, "budgetId">
) =>
  createSelector(
    (s: Application.Store) => selectAccountsTableStore<B, PUBLIC>(s, ctx),
    (s: Tables.AccountTableStore) => s
  );

type SelectIndexedAccounts = {
  <B extends Model.Budget | Model.Template, PUBLIC extends boolean = boolean>(
    s: Application.Store,
    ctx: Omit<AccountActionContext<B, PUBLIC>, "budgetId">
  ): Modules.BudgetStoreLookup<B, PUBLIC>["account"];
};

export const selectIndexedAccounts = createSelector(
  [(s: Application.Store) => s, (s: Application.Store, ctx: Omit<AccountActionContext, "budgetId">) => ctx],
  (s: Application.Store, ctx: Omit<AccountActionContext, "budgetId">) => selectBudgetStore(s, ctx).account
) as SelectIndexedAccounts;

type SelectRawAccount = {
  <B extends Model.Budget | Model.Template, PUBLIC extends boolean = boolean>(
    s: Application.Store,
    ctx: Omit<AccountActionContext<B, PUBLIC>, "budgetId">
  ): Modules.BudgetStoreLookup<B, PUBLIC>["account"][number] | undefined;
};

export const selectRawAccount = createSelector(
  [(s: Application.Store) => s, (s: Application.Store, ctx: Omit<AccountActionContext, "budgetId">) => ctx],
  (s: Application.Store, ctx: Omit<AccountActionContext, "budgetId">) => selectBudgetStore(s, ctx).account[ctx.id]
) as SelectRawAccount;

type SelectAccount = {
  <B extends Model.Budget | Model.Template, PUBLIC extends boolean = boolean>(
    s: Application.Store,
    ctx: Omit<AccountActionContext<B, PUBLIC>, "budgetId">
  ): Modules.BudgetStoreLookup<B, PUBLIC>["account"][number];
};

export const selectAccount = createSelector(
  selectRawAccount,
  (s: Modules.BudgetStoreLookup["account"][number] | undefined) =>
    s === undefined ? initialState.initialAccountState : s
) as SelectAccount;

type SelectAccountDetail = {
  <B extends Model.Budget | Model.Template, PUBLIC extends boolean = boolean>(
    s: Application.Store,
    ctx: Omit<AccountActionContext<B, PUBLIC>, "budgetId">
  ): Modules.BudgetStoreLookup<B, PUBLIC>["account"][number]["detail"]["data"];
};

export const selectAccountDetail = createSelector(
  selectAccount,
  (s: Modules.AccountStore) => s.detail.data
) as SelectAccountDetail;

type SelectRawSubAccount = {
  <B extends Model.Budget | Model.Template, PUBLIC extends boolean = boolean>(
    s: Application.Store,
    ctx: Omit<AccountActionContext<B, PUBLIC>, "budgetId">
  ): Modules.BudgetStoreLookup<B, PUBLIC>["subaccount"][number] | undefined;
};

type SelectIndexedSubAccounts = {
  <B extends Model.Budget | Model.Template, PUBLIC extends boolean = boolean>(
    s: Application.Store,
    ctx: Omit<SubAccountActionContext<B, PUBLIC>, "budgetId">
  ): Modules.BudgetStoreLookup<B, PUBLIC>["subaccount"];
};

export const selectIndexedSubAccounts = createSelector(
  [(s: Application.Store) => s, (s: Application.Store, ctx: Omit<SubAccountActionContext, "budgetId">) => ctx],
  (s: Application.Store, ctx: Omit<SubAccountActionContext, "budgetId">) => selectBudgetStore(s, ctx).subaccount
) as SelectIndexedSubAccounts;

export const selectRawSubAccount = createSelector(
  [(s: Application.Store) => s, (s: Application.Store, ctx: Omit<AccountActionContext, "budgetId">) => ctx],
  (s: Application.Store, ctx: Omit<AccountActionContext, "budgetId">) => selectBudgetStore(s, ctx).subaccount[ctx.id]
) as SelectRawSubAccount;

type SelectSubAccount = {
  <B extends Model.Budget | Model.Template, PUBLIC extends boolean = boolean>(
    s: Application.Store,
    ctx: Omit<SubAccountActionContext<B, PUBLIC>, "budgetId">
  ): Modules.BudgetStoreLookup<B, PUBLIC>["subaccount"][number];
};

export const selectSubAccount = createSelector(
  selectRawSubAccount,
  (s: Modules.BudgetStoreLookup["subaccount"][number] | undefined) =>
    s === undefined ? initialState.initialSubAccountState : s
) as SelectSubAccount;

type SelectSubAccountDetail = {
  <B extends Model.Budget | Model.Template, PUBLIC extends boolean = boolean>(
    s: Application.Store,
    ctx: Omit<SubAccountActionContext<B, PUBLIC>, "budgetId">
  ): Modules.BudgetStoreLookup<B, PUBLIC>["subaccount"][number]["detail"]["data"];
};

export const selectSubAccountDetail = createSelector(
  selectSubAccount,
  (s: Modules.SubAccountStore) => s.detail.data
) as SelectSubAccountDetail;

type SubAccountsTableParentLookup<
  B extends Model.Budget | Model.Template,
  P extends Model.SubAccount | Model.Account,
  PUBLIC extends boolean = boolean
> = P extends Model.Account
  ? Modules.BudgetStoreLookup<B, PUBLIC>["account"][number]["table"]
  : Modules.BudgetStoreLookup<B, PUBLIC>["subaccount"][number]["table"];

type SelectSubAccountsTableStore = {
  <
    B extends Model.Budget | Model.Template,
    P extends Model.SubAccount | Model.Account,
    PUBLIC extends boolean = boolean
  >(
    s: Application.Store,
    ctx: Omit<SubAccountsTableActionContext<B, P, PUBLIC>, "budgetId">
  ): SubAccountsTableParentLookup<B, P, PUBLIC>;
};

export const selectSubAccountsTableStore = createSelector(
  [(s: Application.Store) => s, (s: Application.Store, ctx: Omit<SubAccountsTableActionContext, "budgetId">) => ctx],
  (s: Application.Store, ctx: Omit<SubAccountsTableActionContext, "budgetId">) =>
    ctx.parentType === "account"
      ? selectAccount(s, { ...ctx, id: ctx.parentId }).table
      : selectSubAccount(s, { ...ctx, id: ctx.parentId }).table
) as SelectSubAccountsTableStore;

export const createSubAccountsTableStoreSelector = <
  B extends Model.Budget | Model.Template,
  P extends Model.SubAccount | Model.Account,
  PUBLIC extends boolean = boolean
>(
  ctx: Omit<SubAccountsTableActionContext<B, P, PUBLIC>, "budgetId">
) =>
  createSelector(
    (s: Application.Store) => selectSubAccountsTableStore<B, P, PUBLIC>(s, ctx),
    (s: Tables.SubAccountTableStore) => s
  );

export const createBudgetFooterSelector = <B extends Model.Budget | Model.Template, PUBLIC extends boolean = boolean>(
  ctx: Omit<BudgetActionContext<B, PUBLIC>, "budgetId">
) =>
  createSelector(
    (s: Application.Store) => selectBudgetDetail<B, PUBLIC>(s, ctx),
    (b: Model.Budget | Model.Template | null) => ({
      ...{
        identifier: !isNil(b) && !isNil(b.name) ? `${b.name} Total` : "Budget Total",
        estimated: !isNil(b) ? model.budgeting.estimatedValue(b) : 0.0
      },
      ...(ctx.domain === "budget"
        ? {
            variance: !isNil(b) ? model.budgeting.varianceValue(b) : 0.0,
            actual: b?.actual || 0.0
          }
        : {})
    })
  );

export const createAccountFooterSelector = <B extends Model.Budget | Model.Template, PUBLIC extends boolean = boolean>(
  ctx: Omit<AccountActionContext<B, PUBLIC>, "budgetId">
) =>
  createSelector(
    (s: Application.Store) => selectAccountDetail<B, PUBLIC>(s, ctx),
    (a: Model.Account | null) => ({
      ...{
        identifier: !isNil(a) && !isNil(a.description) ? `${a.description} Total` : "Account Total",
        estimated: !isNil(a) ? model.budgeting.estimatedValue(a) : 0.0
      },
      ...(ctx.domain === "budget"
        ? {
            variance: !isNil(a) ? model.budgeting.varianceValue(a) : 0.0,
            actual: !isNil(a) ? a.actual : 0.0
          }
        : {})
    })
  );

export const createSubAccountFooterSelector = <
  B extends Model.Budget | Model.Template,
  PUBLIC extends boolean = boolean
>(
  ctx: Omit<SubAccountActionContext<B, PUBLIC>, "budgetId">
) =>
  createSelector(
    (s: Application.Store) => selectSubAccountDetail<B, PUBLIC>(s, ctx),
    (a: Model.SubAccount | null) => ({
      ...{
        identifier: !isNil(a) && !isNil(a.description) ? `${a.description} Total` : "Account Total",
        estimated: !isNil(a) ? model.budgeting.estimatedValue(a) : 0.0
      },
      ...(ctx.domain === "budget"
        ? {
            variance: !isNil(a) ? model.budgeting.varianceValue(a) : 0.0,
            actual: !isNil(a) ? a.actual : 0.0
          }
        : {})
    })
  );

export const selectFringesStore = createSelector(
  selectBudgetStore,
  (s: Modules.PublicBudget.Store | Modules.Budget.Store | Modules.Template.Store) => s.fringes
);

export const selectFringes = createSelector(
  selectFringesStore,
  (s: Tables.FringeTableStore) =>
    filter(s.data, (f: Table.BodyRow<Tables.FringeRowData>) => tabling.rows.isModelRow(f)) as Tables.FringeRow[]
);
