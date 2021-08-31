import { client } from "api";
import { URL } from "./util";

export const getAccount = async (id: ID, options: Http.RequestOptions = {}): Promise<Model.Account> => {
  const url = URL.v1("accounts", id);
  return client.retrieve<Model.Account>(url, options);
};

export const deleteAccount = async (id: ID, options: Http.RequestOptions = {}): Promise<null> => {
  const url = URL.v1("accounts", id);
  return client.delete<null>(url, options);
};

export const updateAccount = async (
  id: ID,
  payload: Partial<Http.AccountPayload>,
  options: Http.RequestOptions = {}
): Promise<Model.Account> => {
  const url = URL.v1("accounts", id);
  return client.patch<Model.Account>(url, payload, options);
};

export const bulkUpdateAccountSubAccounts = async <B extends Model.Budget | Model.Template>(
  id: ID,
  data: Http.BulkUpdatePayload<Http.SubAccountPayload>,
  options: Http.RequestOptions = {}
): Promise<Http.BudgetBulkResponse<B, Model.Account>> => {
  const url = URL.v1("accounts", id, "bulk-update-subaccounts");
  return client.patch<Http.BudgetBulkResponse<B, Model.Account>>(url, data, options);
};

export const bulkDeleteAccountSubAccounts = async <B extends Model.Budget | Model.Template>(
  id: ID,
  ids: ID[],
  options: Http.RequestOptions = {}
): Promise<Http.BudgetBulkResponse<B, Model.Account>> => {
  const url = URL.v1("accounts", id, "bulk-delete-subaccounts");
  return client.patch<Http.BudgetBulkResponse<B, Model.Account>>(url, { ids }, options);
};

export const bulkCreateAccountSubAccounts = async <B extends Model.Budget | Model.Template>(
  id: ID,
  payload: Http.BulkCreatePayload<Http.SubAccountPayload>,
  options: Http.RequestOptions = {}
): Promise<Http.BudgetBulkCreateResponse<B, Model.Account, Model.SubAccount>> => {
  const url = URL.v1("accounts", id, "bulk-create-subaccounts");
  return client.patch<Http.BudgetBulkCreateResponse<B, Model.Account, Model.SubAccount>>(url, payload, options);
};

export const getAccountSubAccounts = async (
  accountId: ID,
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<Model.SubAccount>> => {
  const url = URL.v1("accounts", accountId, "subaccounts");
  return client.list<Model.SubAccount>(url, query, options);
};

export const createAccountSubAccount = async (
  accountId: ID,
  payload: Http.SubAccountPayload,
  options: Http.RequestOptions = {}
): Promise<Model.SubAccount> => {
  const url = URL.v1("accounts", accountId, "subaccounts");
  return client.post<Model.SubAccount>(url, payload, options);
};

export const createAccountSubAccountGroup = async (
  accountId: ID,
  payload: Http.GroupPayload,
  options: Http.RequestOptions = {}
): Promise<Model.BudgetGroup> => {
  const url = URL.v1("accounts", accountId, "groups");
  return client.post<Model.BudgetGroup>(url, payload, options);
};

export const getAccountSubAccountGroups = async (
  accountId: ID,
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<Model.BudgetGroup>> => {
  const url = URL.v1("accounts", accountId, "groups");
  return client.list<Model.BudgetGroup>(url, query, options);
};

export const getAccountActuals = async (
  id: ID,
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<Model.Actual>> => {
  const url = URL.v1("accounts", id, "actuals");
  return client.list<Model.Actual>(url, options);
};

export const createAccountActual = async (
  id: ID,
  payload: Http.ActualPayload,
  options: Http.RequestOptions = {}
): Promise<Model.Actual> => {
  const url = URL.v1("accounts", id, "actuals");
  return client.post<Model.Actual>(url, payload, options);
};
