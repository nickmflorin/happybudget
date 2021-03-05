import { client } from "api";
import { URL } from "./util";

export const getAccounts = async (
  budgetId: number,
  query: Http.IListQuery = {},
  options: Http.IRequestOptions = {}
): Promise<Http.IListResponse<IAccount>> => {
  const url = URL.v1("budgets", budgetId, "accounts");
  return client.list<IAccount>(url, query, options);
};

export const getAccount = async (id: number, options: Http.IRequestOptions = {}): Promise<IAccount> => {
  const url = URL.v1("accounts", id);
  return client.retrieve<IAccount>(url, options);
};

export const deleteAccount = async (id: number, options: Http.IRequestOptions = {}): Promise<null> => {
  const url = URL.v1("accounts", id);
  return client.delete<null>(url, options);
};

export const createAccount = async (
  budgetId: number,
  payload: Http.IAccountPayload,
  options: Http.IRequestOptions = {}
): Promise<IAccount> => {
  const url = URL.v1("budgets", budgetId, "accounts");
  return client.post<IAccount>(url, payload, options);
};

export const updateAccount = async (
  id: number,
  payload: Partial<Http.IAccountPayload>,
  options: Http.IRequestOptions = {}
): Promise<IAccount> => {
  const url = URL.v1("accounts", id);
  return client.patch<IAccount>(url, payload, options);
};

export const getAccountSubAccounts = async (
  accountId: number,
  budgetId: number,
  query: Http.IListQuery = {},
  options: Http.IRequestOptions = {}
): Promise<Http.IListResponse<ISubAccount>> => {
  const url = URL.v1("budgets", budgetId, "accounts", accountId, "subaccounts");
  return client.list<ISubAccount>(url, query, options);
};

export const getSubAccountSubAccounts = async (
  subaccountId: number,
  query: Http.IListQuery = {},
  options: Http.IRequestOptions = {}
): Promise<Http.IListResponse<ISubAccount>> => {
  const url = URL.v1("subaccounts", subaccountId, "subaccounts");
  return client.list<ISubAccount>(url, query, options);
};

export const createAccountSubAccount = async (
  accountId: number,
  budgetId: number,
  payload: Http.IAccountPayload,
  options: Http.IRequestOptions = {}
): Promise<ISubAccount> => {
  const url = URL.v1("budgets", budgetId, "accounts", accountId, "subaccounts");
  return client.post<ISubAccount>(url, payload, options);
};

export const createSubAccountSubAccount = async (
  subaccountId: number,
  payload: Http.ISubAccountPayload,
  options: Http.IRequestOptions = {}
): Promise<ISubAccount> => {
  const url = URL.v1("subaccounts", subaccountId, "subaccounts");
  return client.post<ISubAccount>(url, payload, options);
};

export const getSubAccount = async (id: number, options: Http.IRequestOptions = {}): Promise<ISubAccount> => {
  const url = URL.v1("subaccounts", id);
  return client.retrieve<ISubAccount>(url, options);
};

export const deleteSubAccount = async (id: number, options: Http.IRequestOptions = {}): Promise<null> => {
  const url = URL.v1("subaccounts", id);
  return client.delete<null>(url, options);
};

export const updateSubAccount = async (
  id: number,
  payload: Partial<Http.ISubAccountPayload>,
  options: Http.IRequestOptions = {}
): Promise<IAccount> => {
  const url = URL.v1("subaccounts", id);
  return client.patch<IAccount>(url, payload, options);
};
