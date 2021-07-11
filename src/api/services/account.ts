import { client } from "api";
import { URL } from "./util";

export const getAccount = async (id: number, options: Http.RequestOptions = {}): Promise<Model.Account> => {
  const url = URL.v1("accounts", id);
  return client.retrieve<Model.Account>(url, options);
};

export const deleteAccount = async (id: number, options: Http.RequestOptions = {}): Promise<null> => {
  const url = URL.v1("accounts", id);
  return client.delete<null>(url, options);
};

export const updateAccount = async (
  id: number,
  payload: Partial<Http.AccountPayload>,
  options: Http.RequestOptions = {}
): Promise<Model.Account> => {
  const url = URL.v1("accounts", id);
  return client.patch<Model.Account>(url, payload, options);
};

export const bulkUpdateAccountSubAccounts = async (
  id: number,
  data: Http.BulkUpdatePayload<Http.SubAccountPayload>[],
  options: Http.RequestOptions = {}
): Promise<Model.Account> => {
  const url = URL.v1("accounts", id, "bulk-update-subaccounts");
  return client.patch<Model.Account>(url, { data }, options);
};

export const bulkDeleteAccountSubAccounts = async (
  id: number,
  ids: number[],
  options: Http.RequestOptions = {}
): Promise<Model.Account> => {
  const url = URL.v1("accounts", id, "bulk-delete-subaccounts");
  return client.patch<Model.Account>(url, { ids }, options);
};

export const bulkCreateAccountSubAccounts = async (
  id: number,
  payload: Http.BulkCreatePayload<Http.SubAccountPayload>,
  options: Http.RequestOptions = {}
): Promise<Model.SubAccount[]> => {
  const url = URL.v1("accounts", id, "bulk-create-subaccounts");
  return client
    .patch<Http.BulkCreateResponse<Model.SubAccount>>(url, payload, options)
    .then((response: Http.BulkCreateResponse<Model.SubAccount>) => response.data);
};

export const getAccountSubAccounts = async (
  accountId: number,
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<Model.SubAccount>> => {
  const url = URL.v1("accounts", accountId, "subaccounts");
  return client.list<Model.SubAccount>(url, query, options);
};

export const createAccountSubAccount = async (
  accountId: number,
  payload: Http.SubAccountPayload,
  options: Http.RequestOptions = {}
): Promise<Model.SubAccount> => {
  const url = URL.v1("accounts", accountId, "subaccounts");
  return client.post<Model.SubAccount>(url, payload, options);
};

export const createAccountSubAccountGroup = async (
  accountId: number,
  payload: Http.GroupPayload,
  options: Http.RequestOptions = {}
): Promise<Model.Group> => {
  const url = URL.v1("accounts", accountId, "groups");
  return client.post<Model.Group>(url, payload, options);
};

export const getAccountSubAccountGroups = async (
  accountId: number,
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<Model.Group>> => {
  const url = URL.v1("accounts", accountId, "groups");
  return client.list<Model.Group>(url, query, options);
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
