import * as api from "api";

/* eslint-disable indent */
export const getTableChildren = <
  M extends Model.Account | Model.SimpleAccount | Model.SubAccount | Model.SimpleSubAccount
>(
  parentId: number,
  parentType: Model.ParentType,
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<M>> => {
  const serviceMap: {
    /* eslint-disable-next-line no-unused-vars */
    [key in Model.ParentType]: (
      id: number,
      q?: Http.ListQuery,
      o?: Http.RequestOptions
    ) => Promise<Http.ListResponse<any>>;
  } = {
    budget: api.getBudgetAccounts,
    account: api.getAccountSubAccounts,
    subaccount: api.getSubAccountSubAccounts
  };
  return serviceMap[parentType](parentId, query, options);
};

export const createTableMarkup = (
  parentId: number,
  parentType: Model.ParentType,
  payload: Http.MarkupPayload,
  options: Http.RequestOptions = {}
): Promise<Model.Markup> => {
  const serviceMap: {
    /* eslint-disable-next-line no-unused-vars */
    [key in Model.ParentType]: (id: number, p: Http.MarkupPayload, o?: Http.RequestOptions) => Promise<Model.Markup>;
  } = {
    budget: api.createBudgetAccountMarkup,
    account: api.createAccountSubAccountMarkup,
    subaccount: api.createSubAccountSubAccountMarkup
  };
  return serviceMap[parentType](parentId, payload, options);
};

export const createTableGroup = (
  parentId: number,
  parentType: Model.ParentType | "template",
  payload: Http.GroupPayload,
  options: Http.RequestOptions = {}
): Promise<Model.Group> => {
  const serviceMap: {
    /* eslint-disable-next-line no-unused-vars */
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
