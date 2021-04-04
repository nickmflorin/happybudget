import { client } from "api";
import { URL } from "./util";

export const getBudgets = async (
  query: Http.IListQuery = {},
  options: Http.IRequestOptions = {}
): Promise<Http.IListResponse<IBudget>> => {
  const url = URL.v1("budgets");
  return client.list<IBudget>(url, query, options);
};

export const getBudget = async (id: number, options: Http.IRequestOptions = {}): Promise<IBudget> => {
  const url = URL.v1("budgets", id);
  return client.retrieve<IBudget>(url, options);
};

export const createBudget = async (
  payload: Http.IBudgetPayload,
  options: Http.IRequestOptions = {}
): Promise<IBudget> => {
  const url = URL.v1("budgets");
  return client.post<IBudget>(url, payload, options);
};

export const getBudgetsInTrash = async (
  query: Http.IListQuery = {},
  options: Http.IRequestOptions = {}
): Promise<Http.IListResponse<IBudget>> => {
  const url = URL.v1("budgets", "trash");
  return client.list<IBudget>(url, query, options);
};

export const getBudgetInTrash = async (id: number, options: Http.IRequestOptions = {}): Promise<IBudget> => {
  const url = URL.v1("budgets", "trash", id);
  return client.retrieve<IBudget>(url, options);
};

export const deleteBudget = async (id: number, options: Http.IRequestOptions = {}): Promise<null> => {
  const url = URL.v1("budgets", id);
  return client.delete<null>(url, options);
};

export const restoreBudget = async (id: number, options: Http.IRequestOptions = {}): Promise<IBudget> => {
  const url = URL.v1("budgets", "trash", id, "restore");
  return client.patch<IBudget>(url, options);
};

export const permanentlyDeleteBudget = async (id: number, options: Http.IRequestOptions = {}): Promise<null> => {
  const url = URL.v1("budgets", "trash", id);
  return client.delete<null>(url, options);
};

export const getFringes = async (
  id: number,
  query: Http.IListQuery = {},
  options: Http.IRequestOptions = {}
): Promise<Http.IListResponse<IFringe>> => {
  const url = URL.v1("budgets", id, "fringes");
  return client.list<IFringe>(url, query, options);
};

export const createFringe = async (
  id: number,
  payload: Http.IFringePayload,
  options: Http.IRequestOptions = {}
): Promise<IFringe> => {
  const url = URL.v1("budgets", id, "fringes");
  return client.post<IFringe>(url, payload, options);
};

export const getFringe = async (id: number, options: Http.IRequestOptions = {}): Promise<IFringe> => {
  const url = URL.v1("budgets", "fringes", id);
  return client.retrieve<IFringe>(url, options);
};

export const deleteFringe = async (id: number, options: Http.IRequestOptions = {}): Promise<null> => {
  const url = URL.v1("budgets", "fringes", id);
  return client.delete<null>(url, options);
};

export const updateFringe = async (
  id: number,
  payload: Partial<Http.IFringePayload>,
  options: Http.IRequestOptions = {}
): Promise<IFringe> => {
  const url = URL.v1("budgets", "fringes", id);
  return client.patch<IFringe>(url, payload, options);
};

export const getBudgetItems = async (
  id: number,
  query: Http.IListQuery = {},
  options: Http.IRequestOptions = {}
): Promise<Http.IListResponse<IBudgetItem>> => {
  const url = URL.v1("budgets", id, "items");
  return client.list<IBudgetItem>(url, query, options);
};

export const getBudgetItemsTree = async (
  id: number,
  query: Http.IListQuery = {},
  options: Http.IRequestOptions = {}
): Promise<Http.IListResponse<IBudgetItemNode>> => {
  const url = URL.v1("budgets", id, "items", "tree");
  return client.list<IBudgetItemNode>(url, query, options);
};

export const getBudgetActuals = async (
  id: number,
  query: Http.IListQuery = {},
  options: Http.IRequestOptions = {}
): Promise<Http.IListResponse<IActual>> => {
  const url = URL.v1("budgets", id, "actuals");
  return client.list<IActual>(url, query, options);
};

export const bulkUpdateAccounts = async (
  id: number,
  data: Http.IAccountBulkUpdatePayload[],
  options: Http.IRequestOptions = {}
): Promise<IBudget> => {
  const url = URL.v1("budgets", id, "bulk-update-accounts");
  return client.patch<IBudget>(url, { data }, options);
};

export const bulkCreateAccounts = async (
  id: number,
  data: Http.IAccountPayload[],
  options: Http.IRequestOptions = {}
): Promise<IAccount[]> => {
  const url = URL.v1("budgets", id, "bulk-create-accounts");
  return client
    .patch<Http.IBulkCreateAccountsResponse>(url, { data }, options)
    .then((response: Http.IBulkCreateAccountsResponse) => response.data);
};

export const bulkUpdateActuals = async (
  id: number,
  data: Http.IActualBulkUpdatePayload[],
  options: Http.IRequestOptions = {}
): Promise<IActual> => {
  const url = URL.v1("budgets", id, "bulk-update-actuals");
  return client.patch<IActual>(url, { data }, options);
};

export const bulkUpdateFringes = async (
  id: number,
  data: Http.IFringeBulkUpdatePayload[],
  options: Http.IRequestOptions = {}
): Promise<IBudget> => {
  const url = URL.v1("budgets", id, "bulk-update-fringes");
  return client.patch<IBudget>(url, { data }, options);
};

export const bulkCreateFringes = async (
  id: number,
  data: Http.IFringePayload[],
  options: Http.IRequestOptions = {}
): Promise<IFringe[]> => {
  const url = URL.v1("budgets", id, "bulk-create-fringes");
  return client
    .patch<Http.IBulkCreateFringesResponse>(url, { data }, options)
    .then((response: Http.IBulkCreateFringesResponse) => response.data);
};
