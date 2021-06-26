import { client } from "api";
import { URL } from "./util";

export const getSubAccountSubAccounts = async <
  M extends Model.SubAccount = Model.BudgetSubAccount | Model.TemplateSubAccount
>(
  subaccountId: number,
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<M>> => {
  const url = URL.v1("subaccounts", subaccountId, "subaccounts");
  return client.list<M>(url, query, options);
};

export const createSubAccountSubAccount = async <
  M extends Model.SubAccount = Model.BudgetSubAccount | Model.TemplateSubAccount
>(
  subaccountId: number,
  payload: Http.SubAccountPayload,
  options: Http.RequestOptions = {}
): Promise<M> => {
  const url = URL.v1("subaccounts", subaccountId, "subaccounts");
  return client.post<M>(url, payload, options);
};

export const getSubAccount = async <M extends Model.SubAccount = Model.BudgetSubAccount | Model.TemplateSubAccount>(
  id: number,
  options: Http.RequestOptions = {}
): Promise<M> => {
  const url = URL.v1("subaccounts", id);
  return client.retrieve<M>(url, options);
};

export const getSubAccountUnits = async (options: Http.RequestOptions = {}): Promise<Http.ListResponse<Model.Tag>> => {
  const url = URL.v1("subaccounts", "units");
  return client.list<Model.Tag>(url, {}, options);
};

export const deleteSubAccount = async (id: number, options: Http.RequestOptions = {}): Promise<null> => {
  const url = URL.v1("subaccounts", id);
  return client.delete<null>(url, options);
};

export const updateSubAccount = async <M extends Model.SubAccount = Model.BudgetSubAccount | Model.TemplateSubAccount>(
  id: number,
  payload: Partial<Http.SubAccountPayload>,
  options: Http.RequestOptions = {}
): Promise<M> => {
  const url = URL.v1("subaccounts", id);
  return client.patch<M>(url, payload, options);
};

export const bulkUpdateSubAccountSubAccounts = async <
  M extends Model.SubAccount = Model.BudgetSubAccount | Model.TemplateSubAccount
>(
  id: number,
  data: Http.BulkUpdatePayload<Http.SubAccountPayload>[],
  options: Http.RequestOptions = {}
): Promise<M> => {
  const url = URL.v1("subaccounts", id, "bulk-update-subaccounts");
  return client.patch<M>(url, { data }, options);
};

export const bulkDeleteSubAccountSubAccounts = async <
  M extends Model.SubAccount = Model.BudgetSubAccount | Model.TemplateSubAccount
>(
  id: number,
  ids: number[],
  options: Http.RequestOptions = {}
): Promise<M> => {
  const url = URL.v1("subaccounts", id, "bulk-delete-subaccounts");
  return client.patch<M>(url, { ids }, options);
};

export const bulkCreateSubAccountSubAccounts = async <
  M extends Model.SubAccount = Model.BudgetSubAccount | Model.TemplateSubAccount
>(
  id: number,
  payload: Http.BulkCreatePayload<Http.SubAccountPayload>,
  options: Http.RequestOptions = {}
): Promise<M[]> => {
  const url = URL.v1("subaccounts", id, "bulk-create-subaccounts");
  return client
    .patch<Http.BulkCreateResponse<M>>(url, payload, options)
    .then((response: Http.BulkCreateResponse<M>) => response.data);
};

export const createSubAccountSubAccountGroup = async <G extends Model.Group = Model.BudgetGroup | Model.TemplateGroup>(
  subaccountId: number,
  payload: Http.GroupPayload,
  options: Http.RequestOptions = {}
): Promise<G> => {
  const url = URL.v1("subaccounts", subaccountId, "groups");
  return client.post<G>(url, payload, options);
};

export const getSubAccountSubAccountGroups = async <G extends Model.Group = Model.BudgetGroup | Model.TemplateGroup>(
  subaccountId: number,
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<G>> => {
  const url = URL.v1("subaccounts", subaccountId, "groups");
  return client.list<G>(url, query, options);
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
