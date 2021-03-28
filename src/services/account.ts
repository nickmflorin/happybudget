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

export const createAccountSubAccount = async (
  accountId: number,
  budgetId: number,
  payload: Http.ISubAccountPayload,
  options: Http.IRequestOptions = {}
): Promise<ISubAccount> => {
  const url = URL.v1("budgets", budgetId, "accounts", accountId, "subaccounts");
  return client.post<ISubAccount>(url, payload, options);
};

export const getAccountGroups = async (
  id: number,
  query: Http.IListQuery = {},
  options: Http.IRequestOptions = {}
): Promise<Http.IListResponse<IGroup<ISimpleAccount>>> => {
  const url = URL.v1("budgets", id, "groups");
  return client.list<IGroup<ISimpleAccount>>(url, options);
};

export const createAccountGroup = async (
  id: number,
  payload: Http.IGroupPayload,
  options: Http.IRequestOptions = {}
): Promise<IGroup<ISimpleAccount>> => {
  const url = URL.v1("budgets", id, "groups");
  return client.post<IGroup<ISimpleAccount>>(url, payload, options);
};

export const updateAccountGroup = async (
  id: number,
  payload: Partial<Http.IGroupPayload>,
  options: Http.IRequestOptions = {}
): Promise<IGroup<ISimpleAccount>> => {
  const url = URL.v1("accounts", "groups", id);
  return client.patch<IGroup<ISimpleAccount>>(url, payload, options);
};

export const createAccountSubAccountGroup = async (
  accountId: number,
  payload: Http.IGroupPayload,
  options: Http.IRequestOptions = {}
): Promise<IGroup<ISimpleSubAccount>> => {
  const url = URL.v1("accounts", accountId, "groups");
  return client.post<IGroup<ISimpleSubAccount>>(url, payload, options);
};

export const getAccountSubAccountGroups = async (
  accountId: number,
  options: Http.IRequestOptions = {}
): Promise<Http.IListResponse<IGroup<ISimpleSubAccount>>> => {
  const url = URL.v1("accounts", accountId, "groups");
  return client.list<IGroup<ISimpleSubAccount>>(url, options);
};

export const deleteAccountGroup = async (id: number, options: Http.IRequestOptions = {}): Promise<null> => {
  const url = URL.v1("accounts", "groups", id);
  return client.delete<null>(url, options);
};
