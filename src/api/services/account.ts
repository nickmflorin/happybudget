import { client } from "api";
import { URL } from "./util";

export const getAccount = async <M extends Model.Account = Model.BudgetAccount | Model.TemplateAccount>(
  id: number,
  options: Http.RequestOptions = {}
): Promise<M> => {
  const url = URL.v1("accounts", id);
  return client.retrieve<M>(url, options);
};

export const deleteAccount = async (id: number, options: Http.RequestOptions = {}): Promise<null> => {
  const url = URL.v1("accounts", id);
  return client.delete<null>(url, options);
};

export const updateAccount = async <M extends Model.Account = Model.BudgetAccount | Model.TemplateAccount>(
  id: number,
  payload: Partial<Http.AccountPayload>,
  options: Http.RequestOptions = {}
): Promise<M> => {
  const url = URL.v1("accounts", id);
  return client.patch<M>(url, payload, options);
};

export const bulkUpdateAccountSubAccounts = async <
  M extends Model.Account = Model.BudgetAccount | Model.TemplateAccount
>(
  id: number,
  data: Http.BulkUpdatePayload<Http.SubAccountPayload>[],
  options: Http.RequestOptions = {}
): Promise<M> => {
  const url = URL.v1("accounts", id, "bulk-update-subaccounts");
  return client.patch<M>(url, { data }, options);
};

export const bulkCreateAccountSubAccounts = async <
  M extends Model.SubAccount = Model.BudgetSubAccount | Model.TemplateSubAccount
>(
  id: number,
  payload: Http.BulkCreatePayload<Http.SubAccountPayload>,
  options: Http.RequestOptions = {}
): Promise<M[]> => {
  const url = URL.v1("accounts", id, "bulk-create-subaccounts");
  return client
    .patch<Http.BulkCreateResponse<M>>(url, payload, options)
    .then((response: Http.BulkCreateResponse<M>) => response.data);
};

export const getAccountSubAccounts = async <
  M extends Model.SubAccount = Model.BudgetSubAccount | Model.TemplateSubAccount
>(
  accountId: number,
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<M>> => {
  const url = URL.v1("accounts", accountId, "subaccounts");
  return client.list<M>(url, query, options);
};

export const createAccountSubAccount = async <
  M extends Model.SubAccount = Model.BudgetSubAccount | Model.TemplateSubAccount
>(
  accountId: number,
  payload: Http.SubAccountPayload,
  options: Http.RequestOptions = {}
): Promise<M> => {
  const url = URL.v1("accounts", accountId, "subaccounts");
  return client.post<M>(url, payload, options);
};

export const createAccountSubAccountGroup = async <G extends Model.Group = Model.BudgetGroup | Model.TemplateGroup>(
  accountId: number,
  payload: Http.GroupPayload,
  options: Http.RequestOptions = {}
): Promise<G> => {
  const url = URL.v1("accounts", accountId, "groups");
  return client.post<G>(url, payload, options);
};

export const getAccountSubAccountGroups = async <G extends Model.Group = Model.BudgetGroup | Model.TemplateGroup>(
  accountId: number,
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<G>> => {
  const url = URL.v1("accounts", accountId, "groups");
  return client.list<G>(url, query, options);
};

export const getAccountActuals = async (
  id: number,
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<Model.Actual>> => {
  const url = URL.v1("accounts", id, "actuals");
  return client.list<Model.Actual>(url, options);
};

export const createAccountActual = async (
  id: number,
  payload: Http.ActualPayload,
  options: Http.RequestOptions = {}
): Promise<Model.Actual> => {
  const url = URL.v1("accounts", id, "actuals");
  return client.post<Model.Actual>(url, payload, options);
};
