declare type BudgetContext<
  B extends Model.Budget | Model.Template = Model.Budget | Model.Template,
  PUBLIC extends boolean = boolean
> = {
  readonly budgetId: B["id"];
  readonly domain: B["domain"];
  readonly public: PUBLIC;
};

declare type BudgetActionContext<
  B extends Model.Budget | Model.Template = Model.Budget | Model.Template,
  PUBLIC extends boolean = boolean
> = Redux.WithActionContext<BudgetContext<B, PUBLIC>>;

declare type WithBudgetContext<
  T,
  B extends Model.Budget | Model.Template = Model.Budget | Model.Template,
  PUBLIC extends boolean = boolean
> = T & BudgetContext<B, PUBLIC>;

declare type AccountOrSubAccountContext<
  B extends Model.Budget | Model.Template = Model.Budget | Model.Template,
  M extends Model.Account | Model.SubAccount = Model.Account | Model.SubAccount,
  PUBLIC extends boolean = boolean
> = WithBudgetContext<{ readonly id: M["id"] }, B, PUBLIC>;

declare type AccountOrSubAccountActionContext<
  B extends Model.Budget | Model.Template = Model.Budget | Model.Template,
  M extends Model.Account | Model.SubAccount = Model.Account | Model.SubAccount,
  PUBLIC extends boolean = boolean
> = Redux.WithActionContext<AccountOrSubAccountContext<B, M, PUBLIC>>;

declare type AccountContext<
  B extends Model.Budget | Model.Template = Model.Budget | Model.Template,
  PUBLIC extends boolean = boolean
> = AccountOrSubAccountContext<B, Model.Account, PUBLIC>;

declare type AccountActionContext<
  B extends Model.Budget | Model.Template = Model.Budget | Model.Template,
  PUBLIC extends boolean = boolean
> = Redux.WithActionContext<AccountContext<B, PUBLIC>>;

declare type AccountsTableContext<
  B extends Model.Budget | Model.Template = Model.Budget | Model.Template,
  PUBLIC extends boolean = boolean
> = BudgetContext<B, PUBLIC>;

declare type AccountsTableActionContext<
  B extends Model.Budget | Model.Template = Model.Budget | Model.Template,
  PUBLIC extends boolean = boolean
> = Redux.WithActionContext<AccountsTableContext<B, PUBLIC>>;

declare type SubAccountContext<
  B extends Model.Budget | Model.Template = Model.Budget | Model.Template,
  PUBLIC extends boolean = boolean
> = AccountOrSubAccountContext<B, Model.SubAccount, PUBLIC>;

declare type SubAccountActionContext<
  B extends Model.Budget | Model.Template = Model.Budget | Model.Template,
  PUBLIC extends boolean = boolean
> = Redux.WithActionContext<SubAccountContext<B, PUBLIC>>;

declare type SubAccountsTableContext<
  B extends Model.Budget | Model.Template = Model.Budget | Model.Template,
  P extends Model.Account | Model.SubAccount = Model.Account | Model.SubAccount,
  PUBLIC extends boolean = boolean
> = WithBudgetContext<
  {
    readonly parentType: P["type"];
    readonly parentId: P["id"];
  },
  B,
  PUBLIC
>;

declare type SubAccountsTableActionContext<
  B extends Model.Budget | Model.Template = Model.Budget | Model.Template,
  P extends Model.Account | Model.SubAccount = Model.Account | Model.SubAccount,
  PUBLIC extends boolean = boolean
> = Redux.WithActionContext<SubAccountsTableContext<B, P, PUBLIC>>;

// Actuals are only applicable for the budget domain and non-public cases.
type ActualsTableContext = Omit<BudgetContext<Model.Budget, false>, "public" | "domain">;
type ActualsTableActionContext = Redux.WithActionContext<ActualsTableContext>;

declare type FringesTableContext<
  B extends Model.Budget | Model.Template = Model.Budget | Model.Template,
  P extends Model.Account | Model.SubAccount = Model.Account | Model.SubAccount,
  PUBLIC extends boolean = boolean
> = WithBudgetContext<
  {
    readonly parentType: P["type"];
    readonly parentId: P["id"];
  },
  B,
  PUBLIC
>;

declare type FringesTableActionContext<
  B extends Model.Budget | Model.Template = Model.Budget | Model.Template,
  P extends Model.Account | Model.SubAccount = Model.Account | Model.SubAccount,
  PUBLIC extends boolean = boolean
> = Redux.WithActionContext<FringesTableContext<B, P, PUBLIC>>;

declare type ModelActionContextMap<
  B extends Model.Budget | Model.Template = Model.Budget | Model.Template,
  PUBLIC extends boolean = boolean
> = {
  readonly account: AccountActionContext<B, PUBLIC>;
  readonly subaccount: SubAccountActionContext<B, PUBLIC>;
};

declare type ModelActionContext<
  M,
  B extends Model.Budget | Model.Template = Model.Budget | Model.Template,
  PUBLIC extends boolean = boolean
> = M extends Model.Account | Model.SubAccount ? ModelActionContextMap<B, PUBLIC>[M["type"]] : never;
