import { client } from "api";
import { URL } from "./util";

export const getSubAccountSubAccounts = async (
  subaccountId: ID,
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<Model.SubAccount>> => {
  const url = URL.v1("subaccounts", subaccountId, "subaccounts");
  return client.list<Model.SubAccount>(url, query, options);
};

export const createSubAccountSubAccount = async (
  subaccountId: ID,
  payload: Http.SubAccountPayload,
  options: Http.RequestOptions = {}
): Promise<Model.SubAccount> => {
  const url = URL.v1("subaccounts", subaccountId, "subaccounts");
  return client.post<Model.SubAccount>(url, payload, options);
};

export const getSubAccount = async (id: ID, options: Http.RequestOptions = {}): Promise<Model.SubAccount> => {
  const url = URL.v1("subaccounts", id);
  return client.retrieve<Model.SubAccount>(url, options);
};

export const getSubAccountUnits = async (options: Http.RequestOptions = {}): Promise<Http.ListResponse<Model.Tag>> => {
  const url = URL.v1("subaccounts", "units");
  return client.list<Model.Tag>(url, {}, options);
};

export const deleteSubAccount = async (id: ID, options: Http.RequestOptions = {}): Promise<null> => {
  const url = URL.v1("subaccounts", id);
  return client.delete<null>(url, options);
};

export const updateSubAccount = async (
  id: ID,
  payload: Partial<Http.SubAccountPayload>,
  options: Http.RequestOptions = {}
): Promise<Model.SubAccount> => {
  const url = URL.v1("subaccounts", id);
  return client.patch<Model.SubAccount>(url, payload, options);
};

export const bulkUpdateSubAccountSubAccounts = async <B extends Model.Budget | Model.Template>(
  id: ID,
  data: Http.BulkUpdatePayload<Http.SubAccountPayload>,
  options: Http.RequestOptions = {}
): Promise<Http.BudgetBulkResponse<B, Model.SubAccount>> => {
  const url = URL.v1("subaccounts", id, "bulk-update-subaccounts");
  return client.patch<Http.BudgetBulkResponse<B, Model.SubAccount>>(url, data, options);
};

export const bulkDeleteSubAccountSubAccounts = async <B extends Model.Budget | Model.Template>(
  id: ID,
  ids: ID[],
  options: Http.RequestOptions = {}
): Promise<Http.BudgetBulkResponse<B, Model.SubAccount>> => {
  const url = URL.v1("subaccounts", id, "bulk-delete-subaccounts");
  return client.patch<Http.BudgetBulkResponse<B, Model.SubAccount>>(url, { ids }, options);
};

export const bulkCreateSubAccountSubAccounts = async <B extends Model.Budget | Model.Template>(
  id: ID,
  payload: Http.BulkCreatePayload<Http.SubAccountPayload>,
  options: Http.RequestOptions = {}
): Promise<Http.BudgetBulkCreateResponse<B, Model.SubAccount, Model.SubAccount>> => {
  const url = URL.v1("subaccounts", id, "bulk-create-subaccounts");
  return client.patch<Http.BudgetBulkCreateResponse<B, Model.SubAccount, Model.SubAccount>>(url, payload, options);
};

export const createSubAccountSubAccountGroup = async (
  subaccountId: ID,
  payload: Http.GroupPayload,
  options: Http.RequestOptions = {}
): Promise<Model.BudgetGroup> => {
  const url = URL.v1("subaccounts", subaccountId, "groups");
  return client.post<Model.BudgetGroup>(url, payload, options);
};

export const getSubAccountSubAccountGroups = async (
  subaccountId: ID,
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<Model.BudgetGroup>> => {
  const url = URL.v1("subaccounts", subaccountId, "groups");
  return client.list<Model.BudgetGroup>(url, query, options);
};

export const getSubAccountActuals = async (
  id: ID,
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<Model.Actual>> => {
  const url = URL.v1("subaccounts", id, "actuals");
  return client.list<Model.Actual>(url, options);
};

export const createSubAccountActual = async (
  id: ID,
  payload: Http.ActualPayload,
  options: Http.RequestOptions = {}
): Promise<Model.Actual> => {
  const url = URL.v1("subaccounts", id, "actuals");
  return client.post<Model.Actual>(url, payload, options);
};
