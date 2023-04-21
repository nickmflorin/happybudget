import * as actions from "./actions";

export type BudgetContext<
  B extends import("lib/model").Budget | import("lib/model").Template =
    | import("lib/model").Budget
    | import("lib/model").Template,
  PUBLIC extends boolean = boolean,
> = {
  readonly budgetId: B["id"];
  readonly domain: B["domain"];
  readonly public: PUBLIC;
};

export type BudgetActionContext<
  B extends import("lib/model").Budget | import("lib/model").Template =
    | import("lib/model").Budget
    | import("lib/model").Template,
  PUBLIC extends boolean = boolean,
> = actions.WithActionContext<BudgetContext<B, PUBLIC>>;

export type WithBudgetContext<
  T,
  B extends import("lib/model").Budget | import("lib/model").Template =
    | import("lib/model").Budget
    | import("lib/model").Template,
  PUBLIC extends boolean = boolean,
> = T & BudgetContext<B, PUBLIC>;

export type AccountOrSubAccountContext<
  B extends import("lib/model").Budget | import("lib/model").Template =
    | import("lib/model").Budget
    | import("lib/model").Template,
  M extends import("lib/model").Account | import("lib/model").SubAccount =
    | import("lib/model").Account
    | import("lib/model").SubAccount,
  PUBLIC extends boolean = boolean,
> = WithBudgetContext<{ readonly id: M["id"] }, B, PUBLIC>;

export type AccountOrSubAccountActionContext<
  B extends import("lib/model").Budget | import("lib/model").Template =
    | import("lib/model").Budget
    | import("lib/model").Template,
  M extends import("lib/model").Account | import("lib/model").SubAccount =
    | import("lib/model").Account
    | import("lib/model").SubAccount,
  PUBLIC extends boolean = boolean,
> = actions.WithActionContext<AccountOrSubAccountContext<B, M, PUBLIC>>;

export type AccountContext<
  B extends import("lib/model").Budget | import("lib/model").Template =
    | import("lib/model").Budget
    | import("lib/model").Template,
  PUBLIC extends boolean = boolean,
> = AccountOrSubAccountContext<B, import("lib/model").Account, PUBLIC>;

export type AccountActionContext<
  B extends import("lib/model").Budget | import("lib/model").Template =
    | import("lib/model").Budget
    | import("lib/model").Template,
  PUBLIC extends boolean = boolean,
> = actions.WithActionContext<AccountContext<B, PUBLIC>>;

export type AccountsTableContext<
  B extends import("lib/model").Budget | import("lib/model").Template =
    | import("lib/model").Budget
    | import("lib/model").Template,
  PUBLIC extends boolean = boolean,
> = BudgetContext<B, PUBLIC>;

export type AccountsTableActionContext<
  B extends import("lib/model").Budget | import("lib/model").Template =
    | import("lib/model").Budget
    | import("lib/model").Template,
  PUBLIC extends boolean = boolean,
> = actions.WithActionContext<AccountsTableContext<B, PUBLIC>>;

export type SubAccountContext<
  B extends import("lib/model").Budget | import("lib/model").Template =
    | import("lib/model").Budget
    | import("lib/model").Template,
  PUBLIC extends boolean = boolean,
> = AccountOrSubAccountContext<B, import("lib/model").SubAccount, PUBLIC>;

export type SubAccountActionContext<
  B extends import("lib/model").Budget | import("lib/model").Template =
    | import("lib/model").Budget
    | import("lib/model").Template,
  PUBLIC extends boolean = boolean,
> = actions.WithActionContext<SubAccountContext<B, PUBLIC>>;

export type SubAccountsTableContext<
  B extends import("lib/model").Budget | import("lib/model").Template =
    | import("lib/model").Budget
    | import("lib/model").Template,
  P extends import("lib/model").Account | import("lib/model").SubAccount =
    | import("lib/model").Account
    | import("lib/model").SubAccount,
  PUBLIC extends boolean = boolean,
> = BudgetContext<B, PUBLIC> & {
  readonly parentType: P["type"];
  readonly parentId: P["id"];
};

export type SubAccountsTableActionContext<
  B extends import("lib/model").Budget | import("lib/model").Template =
    | import("lib/model").Budget
    | import("lib/model").Template,
  P extends import("lib/model").Account | import("lib/model").SubAccount =
    | import("lib/model").Account
    | import("lib/model").SubAccount,
  PUBLIC extends boolean = boolean,
> = actions.WithActionContext<SubAccountsTableContext<B, P, PUBLIC>>;

// Actuals are only applicable for the budget domain and non-public cases.
export type ActualsTableContext = Omit<
  BudgetContext<import("lib/model").Budget, false>,
  "public" | "domain"
>;
export type ActualsTableActionContext = actions.WithActionContext<ActualsTableContext>;

export type FringesTableContext<
  B extends import("lib/model").Budget | import("lib/model").Template =
    | import("lib/model").Budget
    | import("lib/model").Template,
  P extends import("lib/model").Account | import("lib/model").SubAccount =
    | import("lib/model").Account
    | import("lib/model").SubAccount,
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
  B extends import("lib/model").Budget | import("lib/model").Template =
    | import("lib/model").Budget
    | import("lib/model").Template,
  P extends import("lib/model").Account | import("lib/model").SubAccount =
    | import("lib/model").Account
    | import("lib/model").SubAccount,
  PUBLIC extends boolean = boolean,
> = actions.WithActionContext<FringesTableContext<B, P, PUBLIC>>;

export type ModelActionContextMap<
  B extends import("lib/model").Budget | import("lib/model").Template =
    | import("lib/model").Budget
    | import("lib/model").Template,
  PUBLIC extends boolean = boolean,
> = {
  readonly account: AccountActionContext<B, PUBLIC>;
  readonly subaccount: SubAccountActionContext<B, PUBLIC>;
};

export type ModelActionContext<
  M,
  B extends import("lib/model").Budget | import("lib/model").Template =
    | import("lib/model").Budget
    | import("lib/model").Template,
  PUBLIC extends boolean = boolean,
> = M extends import("lib/model").Account | import("lib/model").SubAccount
  ? ModelActionContextMap<B, PUBLIC>[M["type"]]
  : never;
