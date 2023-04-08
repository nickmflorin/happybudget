import { model } from "lib";

import * as actions from "./actions";

export type BudgetContext<
  B extends model.Budget | model.Template = model.Budget | model.Template,
  PUBLIC extends boolean = boolean,
> = {
  readonly budgetId: B["id"];
  readonly domain: B["domain"];
  readonly public: PUBLIC;
};

export type BudgetActionContext<
  B extends model.Budget | model.Template = model.Budget | model.Template,
  PUBLIC extends boolean = boolean,
> = actions.WithActionContext<BudgetContext<B, PUBLIC>>;

export type WithBudgetContext<
  T,
  B extends model.Budget | model.Template = model.Budget | model.Template,
  PUBLIC extends boolean = boolean,
> = T & BudgetContext<B, PUBLIC>;

export type AccountOrSubAccountContext<
  B extends model.Budget | model.Template = model.Budget | model.Template,
  M extends model.Account | model.SubAccount = model.Account | model.SubAccount,
  PUBLIC extends boolean = boolean,
> = WithBudgetContext<{ readonly id: M["id"] }, B, PUBLIC>;

export type AccountOrSubAccountActionContext<
  B extends model.Budget | model.Template = model.Budget | model.Template,
  M extends model.Account | model.SubAccount = model.Account | model.SubAccount,
  PUBLIC extends boolean = boolean,
> = actions.WithActionContext<AccountOrSubAccountContext<B, M, PUBLIC>>;

export type AccountContext<
  B extends model.Budget | model.Template = model.Budget | model.Template,
  PUBLIC extends boolean = boolean,
> = AccountOrSubAccountContext<B, model.Account, PUBLIC>;

export type AccountActionContext<
  B extends model.Budget | model.Template = model.Budget | model.Template,
  PUBLIC extends boolean = boolean,
> = actions.WithActionContext<AccountContext<B, PUBLIC>>;

export type AccountsTableContext<
  B extends model.Budget | model.Template = model.Budget | model.Template,
  PUBLIC extends boolean = boolean,
> = BudgetContext<B, PUBLIC>;

export type AccountsTableActionContext<
  B extends model.Budget | model.Template = model.Budget | model.Template,
  PUBLIC extends boolean = boolean,
> = actions.WithActionContext<AccountsTableContext<B, PUBLIC>>;

export type SubAccountContext<
  B extends model.Budget | model.Template = model.Budget | model.Template,
  PUBLIC extends boolean = boolean,
> = AccountOrSubAccountContext<B, model.SubAccount, PUBLIC>;

export type SubAccountActionContext<
  B extends model.Budget | model.Template = model.Budget | model.Template,
  PUBLIC extends boolean = boolean,
> = actions.WithActionContext<SubAccountContext<B, PUBLIC>>;

export type SubAccountsTableContext<
  B extends model.UserBudget | model.Template = model.UserBudget | model.Template,
  P extends model.Account | model.SubAccount = model.Account | model.SubAccount,
  PUBLIC extends boolean = boolean,
> = BudgetContext<B, PUBLIC> & {
  readonly parentType: P["type"];
  readonly parentId: P["id"];
};

export type SubAccountsTableActionContext<
  B extends model.Budget | model.Template = model.Budget | model.Template,
  P extends model.Account | model.SubAccount = model.Account | model.SubAccount,
  PUBLIC extends boolean = boolean,
> = actions.WithActionContext<SubAccountsTableContext<B, P, PUBLIC>>;

// Actuals are only applicable for the budget domain and non-public cases.
export type ActualsTableContext = Omit<BudgetContext<model.Budget, false>, "public" | "domain">;
export type ActualsTableActionContext = actions.WithActionContext<ActualsTableContext>;

export type FringesTableContext<
  B extends model.Budget | model.Template = model.Budget | model.Template,
  P extends model.Account | model.SubAccount = model.Account | model.SubAccount,
  PUBLIC extends boolean = boolean,
> = WithBudgetContext<
  {
    readonly parentType: P["type"];
    readonly parentId: P["id"];
  },
  B,
  PUBLIC
>;

export type FringesTableActionContext<
  B extends model.Budget | model.Template = model.Budget | model.Template,
  P extends model.Account | model.SubAccount = model.Account | model.SubAccount,
  PUBLIC extends boolean = boolean,
> = actions.WithActionContext<FringesTableContext<B, P, PUBLIC>>;

export type ModelActionContextMap<
  B extends model.Budget | model.Template = model.Budget | model.Template,
  PUBLIC extends boolean = boolean,
> = {
  readonly account: AccountActionContext<B, PUBLIC>;
  readonly subaccount: SubAccountActionContext<B, PUBLIC>;
};

export type ModelActionContext<
  M,
  B extends model.Budget | model.Template = model.Budget | model.Template,
  PUBLIC extends boolean = boolean,
> = M extends model.Account | model.SubAccount
  ? ModelActionContextMap<B, PUBLIC>[M["type"]]
  : never;
