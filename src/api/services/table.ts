import * as api from "api";

type TableChildrenService<M extends Model.HttpModel> = (
  id: number,
  q?: Http.ListQuery,
  o?: Http.RequestOptions
) => Promise<Http.ListResponse<M>>;

type ParentTypeModelMap = {
  account: Model.SubAccount;
  subaccount: Model.SubAccount;
  budget: Model.Account;
  template: Model.Account;
};

export const getTableChildren = <
  M extends Model.Account | Model.SimpleAccount | Model.SubAccount | Model.SimpleSubAccount
>(
  parentId: number,
  parentType: Model.ParentType | "template",
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<M>> => {
  const serviceMap: {
    [key in Model.ParentType | "template"]: TableChildrenService<ParentTypeModelMap[key]>;
  } = {
    budget: api.getBudgetAccounts,
    template: api.getTemplateAccounts,
    account: api.getAccountSubAccounts,
    subaccount: api.getSubAccountSubAccounts
  };
  return serviceMap[parentType](parentId, query, options) as Promise<Http.ListResponse<M>>;
};

export const createTableMarkup = <
  B extends Model.Budget | Model.Template,
  R extends Http.MarkupResponseTypes<B> = Http.MarkupResponseTypes<B>
>(
  parentId: number,
  parentType: Model.ParentType | "template",
  payload: Http.MarkupPayload,
  options: Http.RequestOptions = {}
): Promise<R> => {
  type ResponseTypes =
    | Http.BudgetContextDetailResponse<Model.Markup>
    | Http.BudgetParentContextDetailResponse<Model.Markup, Model.Account>
    | Http.BudgetParentContextDetailResponse<Model.Markup, Model.SubAccount>;

  const serviceMap: {
    [key in Model.ParentType | "template"]: (
      id: number,
      p: Http.MarkupPayload,
      o?: Http.RequestOptions
    ) => Promise<ResponseTypes>;
  } = {
    budget: api.createBudgetAccountMarkup,
    template: api.createTemplateAccountMarkup,
    account: api.createAccountSubAccountMarkup,
    subaccount: api.createSubAccountSubAccountMarkup
  };
  return serviceMap[parentType](parentId, payload, options) as Promise<R>;
};

export const getTableGroups = (
  parentId: number,
  parentType: Model.ParentType | "template",
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<Model.Group>> => {
  const serviceMap: {
    [key in Model.ParentType | "template"]: (
      id: number,
      q?: Http.ListQuery,
      o?: Http.RequestOptions
    ) => Promise<Http.ListResponse<Model.Group>>;
  } = {
    budget: api.getBudgetAccountGroups,
    template: api.getTemplateAccountGroups,
    account: api.getAccountSubAccountGroups,
    subaccount: api.getSubAccountSubAccountGroups
  };
  return serviceMap[parentType](parentId, query, options);
};

export const createTableGroup = (
  parentId: number,
  parentType: Model.ParentType | "template",
  payload: Http.GroupPayload,
  options: Http.RequestOptions = {}
): Promise<Model.Group> => {
  const serviceMap: {
    [key in Model.ParentType | "template"]: (
      id: number,
      p: Http.GroupPayload,
      o?: Http.RequestOptions
    ) => Promise<Model.Group>;
  } = {
    budget: api.createBudgetAccountGroup,
    template: api.createTemplateAccountGroup,
    account: api.createAccountSubAccountGroup,
    subaccount: api.createSubAccountSubAccountGroup
  };
  return serviceMap[parentType](parentId, payload, options);
};
