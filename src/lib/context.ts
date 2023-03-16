export const isSubAccountsTableActionContext = <
  B extends Model.Budget | Model.Template,
  P extends Model.Account | Model.SubAccount,
  PUBLIC extends boolean = false,
>(
  ctx: SubAccountActionContext<B, PUBLIC> | SubAccountsTableActionContext<B, P, PUBLIC>,
): ctx is SubAccountsTableActionContext<B, P, PUBLIC> =>
  (ctx as SubAccountsTableActionContext<B, P, PUBLIC>).parentId !== undefined;
