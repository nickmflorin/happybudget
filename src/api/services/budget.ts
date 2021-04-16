import { client } from "api";
import { URL } from "./util";

export const getBudgets = async (
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<Model.Budget>> => {
  const url = URL.v1("budgets");
  return client.list<Model.Budget>(url, query, options);
};

export const getBudget = async (id: number, options: Http.RequestOptions = {}): Promise<Model.Budget> => {
  const url = URL.v1("budgets", id);
  return client.retrieve<Model.Budget>(url, options);
};

export const updateBudget = async (
  id: number,
  payload: Partial<Http.BudgetPayload>,
  options: Http.RequestOptions = {}
): Promise<Model.Budget> => {
  const url = URL.v1("budgets", id);
  return client.patch<Model.Budget>(url, payload, options);
};

export const getBudgetPdf = async (id: number, options: Http.RequestOptions = {}): Promise<any> => {
  const url = URL.v1("budgets", id, "pdf");
  return client.get<any>(url, options);
};

export const createBudget = async (
  payload: Http.BudgetPayload,
  options: Http.RequestOptions = {}
): Promise<Model.Budget> => {
  const url = URL.v1("budgets");
  return client.post<Model.Budget>(url, payload, options);
};

export const getBudgetsInTrash = async (
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<Model.Budget>> => {
  const url = URL.v1("budgets", "trash");
  return client.list<Model.Budget>(url, query, options);
};

export const getBudgetInTrash = async (id: number, options: Http.RequestOptions = {}): Promise<Model.Budget> => {
  const url = URL.v1("budgets", "trash", id);
  return client.retrieve<Model.Budget>(url, options);
};

export const deleteBudget = async (id: number, options: Http.RequestOptions = {}): Promise<null> => {
  const url = URL.v1("budgets", id);
  return client.delete<null>(url, options);
};

export const restoreBudget = async (id: number, options: Http.RequestOptions = {}): Promise<Model.Budget> => {
  const url = URL.v1("budgets", "trash", id, "restore");
  return client.patch<Model.Budget>(url, options);
};

export const permanentlyDeleteBudget = async (id: number, options: Http.RequestOptions = {}): Promise<null> => {
  const url = URL.v1("budgets", "trash", id);
  return client.delete<null>(url, options);
};

export const getBudgetAccounts = async (
  budgetId: number,
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<Model.BudgetAccount>> => {
  const url = URL.v1("budgets", budgetId, "accounts");
  return client.list<Model.BudgetAccount>(url, query, options);
};

export const createBudgetAccount = async (
  budgetId: number,
  payload: Http.BudgetAccountPayload,
  options: Http.RequestOptions = {}
): Promise<Model.BudgetAccount> => {
  const url = URL.v1("budgets", budgetId, "accounts");
  return client.post<Model.BudgetAccount>(url, payload, options);
};

export const getBudgetAccountGroups = async (
  id: number,
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<Model.BudgetGroup>> => {
  const url = URL.v1("budgets", id, "groups");
  return client.list<Model.BudgetGroup>(url, query, options);
};

export const createBudgetAccountGroup = async (
  id: number,
  payload: Http.GroupPayload,
  options: Http.RequestOptions = {}
): Promise<Model.BudgetGroup> => {
  const url = URL.v1("budgets", id, "groups");
  return client.post<Model.BudgetGroup>(url, payload, options);
};

export const getBudgetFringes = async (
  id: number,
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<Model.Fringe>> => {
  const url = URL.v1("budgets", id, "fringes");
  return client.list<Model.Fringe>(url, query, options);
};

export const createBudgetFringe = async (
  id: number,
  payload: Http.FringePayload,
  options: Http.RequestOptions = {}
): Promise<Model.Fringe> => {
  const url = URL.v1("budgets", id, "fringes");
  return client.post<Model.Fringe>(url, payload, options);
};

export const getBudgetItems = async (
  id: number,
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<Model.SimpleLineItem>> => {
  const url = URL.v1("budgets", id, "items");
  return client.list<Model.SimpleLineItem>(url, query, options);
};

export const getBudgetItemsTree = async (
  id: number,
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<Model.AccountTreeNode>> => {
  const url = URL.v1("budgets", id, "items", "tree");
  return client.list<Model.AccountTreeNode>(url, query, options);
};

export const getBudgetActuals = async (
  id: number,
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<Model.Actual>> => {
  const url = URL.v1("budgets", id, "actuals");
  return client.list<Model.Actual>(url, query, options);
};

export const bulkUpdateBudgetAccounts = async (
  id: number,
  data: Http.BulkUpdatePayload<Http.BudgetAccountPayload>[],
  options: Http.RequestOptions = {}
): Promise<Model.Budget> => {
  const url = URL.v1("budgets", id, "bulk-update-accounts");
  return client.patch<Model.Budget>(url, { data }, options);
};

export const bulkCreateBudgetAccounts = async (
  id: number,
  data: Http.BudgetAccountPayload[],
  options: Http.RequestOptions = {}
): Promise<Model.BudgetAccount[]> => {
  const url = URL.v1("budgets", id, "bulk-create-accounts");
  return client
    .patch<Http.BulkCreateResponse<Model.BudgetAccount>>(url, { data }, options)
    .then((response: Http.BulkCreateResponse<Model.BudgetAccount>) => response.data);
};

export const bulkUpdateBudgetActuals = async (
  id: number,
  data: Http.BulkUpdatePayload<Http.ActualPayload>[],
  options: Http.RequestOptions = {}
): Promise<Model.Actual> => {
  const url = URL.v1("budgets", id, "bulk-update-actuals");
  return client.patch<Model.Actual>(url, { data }, options);
};

export const bulkUpdateBudgetFringes = async (
  id: number,
  data: Http.BulkUpdatePayload<Http.FringePayload>[],
  options: Http.RequestOptions = {}
): Promise<Model.Budget> => {
  const url = URL.v1("budgets", id, "bulk-update-fringes");
  return client.patch<Model.Budget>(url, { data }, options);
};

export const bulkCreateBudgetFringes = async (
  id: number,
  data: Http.FringePayload[],
  options: Http.RequestOptions = {}
): Promise<Model.Fringe[]> => {
  const url = URL.v1("budgets", id, "bulk-create-fringes");
  return client
    .patch<Http.BulkCreateResponse<Model.Fringe>>(url, { data }, options)
    .then((response: Http.BulkCreateResponse<Model.Fringe>) => response.data);
};
