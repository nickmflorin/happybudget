import { client } from "api";
import { URL } from "./util";

export const getSubAccountSubAccounts = async (
  subaccountId: number,
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<Model.SubAccount>> => {
  const url = URL.v1("subaccounts", subaccountId, "subaccounts");
  return client.list<Model.SubAccount>(url, query, options);
};

export const createSubAccountSubAccount = async (
  subaccountId: number,
  payload: Http.SubAccountPayload,
  options: Http.RequestOptions = {}
): Promise<Model.SubAccount> => {
  const url = URL.v1("subaccounts", subaccountId, "subaccounts");
  return client.post<Model.SubAccount>(url, payload, options);
};

export const getSubAccount = async (id: number, options: Http.RequestOptions = {}): Promise<Model.SubAccount> => {
  const url = URL.v1("subaccounts", id);
  return client.retrieve<Model.SubAccount>(url, options);
};

export const deleteSubAccount = async (id: number, options: Http.RequestOptions = {}): Promise<null> => {
  const url = URL.v1("subaccounts", id);
  return client.delete<null>(url, options);
};

export const updateSubAccount = async (
  id: number,
  payload: Partial<Http.SubAccountPayload>,
  options: Http.RequestOptions = {}
): Promise<Model.Account> => {
  const url = URL.v1("subaccounts", id);
  return client.patch<Model.Account>(url, payload, options);
};

export const bulkUpdateSubAccountSubAccounts = async (
  id: number,
  data: Http.SubAccountBulkUpdatePayload[],
  options: Http.RequestOptions = {}
): Promise<Model.Account> => {
  const url = URL.v1("subaccounts", id, "bulk-update-subaccounts");
  return client.patch<Model.Account>(url, { data }, options);
};

export const bulkCreateSubAccountSubAccounts = async (
  id: number,
  data: Http.SubAccountPayload[],
  options: Http.RequestOptions = {}
): Promise<Model.SubAccount[]> => {
  const url = URL.v1("subaccounts", id, "bulk-create-subaccounts");
  return client
    .patch<Http.BulkCreateSubAccountsResponse>(url, { data }, options)
    .then((response: Http.BulkCreateSubAccountsResponse) => response.data);
};

export const createSubAccountSubAccountGroup = async (
  subaccountId: number,
  payload: Http.GroupPayload,
  options: Http.RequestOptions = {}
): Promise<Model.Group<Model.SimpleSubAccount>> => {
  const url = URL.v1("subaccounts", subaccountId, "groups");
  return client.post<Model.Group<Model.SimpleSubAccount>>(url, payload, options);
};

export const getSubAccountSubAccountGroups = async (
  subaccountId: number,
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<Model.Group<Model.SimpleSubAccount>>> => {
  const url = URL.v1("subaccounts", subaccountId, "groups");
  return client.list<Model.Group<Model.SimpleSubAccount>>(url, query, options);
};

export const updateSubAccountGroup = async (
  id: number,
  payload: Partial<Http.GroupPayload>,
  options: Http.RequestOptions = {}
): Promise<Model.Group<Model.SimpleSubAccount>> => {
  const url = URL.v1("subaccounts", "groups", id);
  return client.patch<Model.Group<Model.SimpleSubAccount>>(url, payload, options);
};

export const getSubAccountGroup = async (
  id: number,
  options: Http.RequestOptions = {}
): Promise<Model.Group<Model.SimpleSubAccount>> => {
  const url = URL.v1("subaccounts", "groups", id);
  return client.retrieve<Model.Group<Model.SimpleSubAccount>>(url, options);
};

export const deleteSubAccountGroup = async (id: number, options: Http.RequestOptions = {}): Promise<null> => {
  const url = URL.v1("subaccounts", "groups", id);
  return client.delete<null>(url, options);
};

export const getSubAccountActuals = async (
  id: number,
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<Model.Actual>> => {
  const url = URL.v1("subaccounts", id, "actuals");
  return client.list<Model.Actual>(url, options);
};

export const createSubAccountActual = async (
  id: number,
  payload: Http.ActualPayload,
  options: Http.RequestOptions = {}
): Promise<Model.Actual> => {
  const url = URL.v1("subaccounts", id, "actuals");
  return client.post<Model.Actual>(url, payload, options);
};
