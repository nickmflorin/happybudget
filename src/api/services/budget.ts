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

export const getFringes = async (
  id: number,
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<Model.Fringe>> => {
  const url = URL.v1("budgets", id, "fringes");
  return client.list<Model.Fringe>(url, query, options);
};

export const createFringe = async (
  id: number,
  payload: Http.FringePayload,
  options: Http.RequestOptions = {}
): Promise<Model.Fringe> => {
  const url = URL.v1("budgets", id, "fringes");
  return client.post<Model.Fringe>(url, payload, options);
};

export const getFringe = async (id: number, options: Http.RequestOptions = {}): Promise<Model.Fringe> => {
  const url = URL.v1("budgets", "fringes", id);
  return client.retrieve<Model.Fringe>(url, options);
};

export const deleteFringe = async (id: number, options: Http.RequestOptions = {}): Promise<null> => {
  const url = URL.v1("budgets", "fringes", id);
  return client.delete<null>(url, options);
};

export const updateFringe = async (
  id: number,
  payload: Partial<Http.FringePayload>,
  options: Http.RequestOptions = {}
): Promise<Model.Fringe> => {
  const url = URL.v1("budgets", "fringes", id);
  return client.patch<Model.Fringe>(url, payload, options);
};

export const getBudgetItems = async (
  id: number,
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<Model.BudgetItem>> => {
  const url = URL.v1("budgets", id, "items");
  return client.list<Model.BudgetItem>(url, query, options);
};

export const getBudgetItemsTree = async (
  id: number,
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<Model.BudgetItemNode>> => {
  const url = URL.v1("budgets", id, "items", "tree");
  return client.list<Model.BudgetItemNode>(url, query, options);
};

export const getBudgetActuals = async (
  id: number,
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<Model.Actual>> => {
  const url = URL.v1("budgets", id, "actuals");
  return client.list<Model.Actual>(url, query, options);
};

export const bulkUpdateAccounts = async (
  id: number,
  data: Http.AccountBulkUpdatePayload[],
  options: Http.RequestOptions = {}
): Promise<Model.Budget> => {
  const url = URL.v1("budgets", id, "bulk-update-accounts");
  return client.patch<Model.Budget>(url, { data }, options);
};

export const bulkCreateAccounts = async (
  id: number,
  data: Http.AccountPayload[],
  options: Http.RequestOptions = {}
): Promise<Model.Account[]> => {
  const url = URL.v1("budgets", id, "bulk-create-accounts");
  return client
    .patch<Http.BulkCreateAccountsResponse>(url, { data }, options)
    .then((response: Http.BulkCreateAccountsResponse) => response.data);
};

export const bulkUpdateActuals = async (
  id: number,
  data: Http.ActualBulkUpdatePayload[],
  options: Http.RequestOptions = {}
): Promise<Model.Actual> => {
  const url = URL.v1("budgets", id, "bulk-update-actuals");
  return client.patch<Model.Actual>(url, { data }, options);
};

export const bulkUpdateFringes = async (
  id: number,
  data: Http.FringeBulkUpdatePayload[],
  options: Http.RequestOptions = {}
): Promise<Model.Budget> => {
  const url = URL.v1("budgets", id, "bulk-update-fringes");
  return client.patch<Model.Budget>(url, { data }, options);
};

export const bulkCreateFringes = async (
  id: number,
  data: Http.FringePayload[],
  options: Http.RequestOptions = {}
): Promise<Model.Fringe[]> => {
  const url = URL.v1("budgets", id, "bulk-create-fringes");
  return client
    .patch<Http.BulkCreateFringesResponse>(url, { data }, options)
    .then((response: Http.BulkCreateFringesResponse) => response.data);
};
