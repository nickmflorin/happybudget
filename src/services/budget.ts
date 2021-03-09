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

export const getBudgetActuals = async (
  id: number,
  query: Http.IListQuery = {},
  options: Http.IRequestOptions = {}
): Promise<Http.IListResponse<IActual>> => {
  const url = URL.v1("budgets", id, "actuals");
  return client.list<IActual>(url, query, options);
};
