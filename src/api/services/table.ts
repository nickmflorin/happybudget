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
};

export const getTableChildren = <
  M extends Model.Account | Model.SimpleAccount | Model.SubAccount | Model.SimpleSubAccount
>(
  parentId: number,
  parentType: Model.ParentType,
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<M>> => {
  const serviceMap: {
    [key in Model.ParentType]: TableChildrenService<ParentTypeModelMap[key]>;
  } = {
    budget: api.getBudgetChildren,
    account: api.getAccountChildren,
    subaccount: api.getSubAccountChildren
  };
  return serviceMap[parentType](parentId, query, options) as Promise<Http.ListResponse<M>>;
};

export const createTableMarkup = <
  B extends Model.Budget | Model.Template,
  R extends Http.MarkupResponseTypes<B> = Http.MarkupResponseTypes<B>
>(
  parentId: number,
  parentType: Model.ParentType,
  payload: Http.MarkupPayload,
  options: Http.RequestOptions = {}
): Promise<R> => {
  const serviceMap: {
    [key in Model.ParentType]: api.CreateSubAccountMarkup | api.CreateAccountMarkup | api.CreateBudgetMarkup;
  } = {
    budget: api.createBudgetMarkup,
    account: api.createAccountMarkup,
    subaccount: api.createSubAccountMarkup
  };
  const service = serviceMap[parentType] as (id: number, p: Http.MarkupPayload, o?: Http.RequestOptions) => Promise<R>;
  return service(parentId, payload, options);
};

export const getTableGroups = (
  parentId: number,
  parentType: Model.ParentType,
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<Model.Group>> => {
  const serviceMap: {
    [key in Model.ParentType]: (
      id: number,
      q?: Http.ListQuery,
      o?: Http.RequestOptions
    ) => Promise<Http.ListResponse<Model.Group>>;
  } = {
    budget: api.getBudgetGroups,
    account: api.getAccountGroups,
    subaccount: api.getSubAccountGroups
  };
  return serviceMap[parentType](parentId, query, options);
};

export const createTableGroup = (
  parentId: number,
  parentType: Model.ParentType,
  payload: Http.GroupPayload,
  options: Http.RequestOptions = {}
): Promise<Model.Group> => {
  const serviceMap: {
    [key in Model.ParentType]: (id: number, p: Http.GroupPayload, o?: Http.RequestOptions) => Promise<Model.Group>;
  } = {
    budget: api.createBudgetGroup,
    account: api.createAccountGroup,
    subaccount: api.createSubAccountGroup
  };
  return serviceMap[parentType](parentId, payload, options);
};
