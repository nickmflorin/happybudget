import { client } from "api";
import { URL } from "./util";

export const getSubAccountSubAccounts = async (
  subaccountId: number,
  query: Http.IListQuery = {},
  options: Http.IRequestOptions = {}
): Promise<Http.IListResponse<ISubAccount>> => {
  const url = URL.v1("subaccounts", subaccountId, "subaccounts");
  return client.list<ISubAccount>(url, query, options);
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

export const createSubAccountSubAccountGroup = async (
  subaccountId: number,
  payload: Http.IGroupPayload,
  options: Http.IRequestOptions = {}
): Promise<IGroup<ISimpleSubAccount>> => {
  const url = URL.v1("subaccounts", subaccountId, "groups");
  return client.post<IGroup<ISimpleSubAccount>>(url, payload, options);
};

export const getSubAccountSubAccountGroups = async (
  subaccountId: number,
  query: Http.IListQuery = {},
  options: Http.IRequestOptions = {}
): Promise<Http.IListResponse<IGroup<ISimpleSubAccount>>> => {
  const url = URL.v1("subaccounts", subaccountId, "groups");
  return client.list<IGroup<ISimpleSubAccount>>(url, query, options);
};

export const updateSubAccountGroup = async (
  id: number,
  payload: Partial<Http.IGroupPayload>,
  options: Http.IRequestOptions = {}
): Promise<IGroup<ISimpleSubAccount>> => {
  const url = URL.v1("subaccounts", "groups", id);
  return client.patch<IGroup<ISimpleSubAccount>>(url, payload, options);
};

export const getSubAccountGroup = async (
  id: number,
  options: Http.IRequestOptions = {}
): Promise<IGroup<ISimpleSubAccount>> => {
  const url = URL.v1("subaccounts", "groups", id);
  return client.retrieve<IGroup<ISimpleSubAccount>>(url, options);
};

export const deleteSubAccountGroup = async (id: number, options: Http.IRequestOptions = {}): Promise<null> => {
  const url = URL.v1("subaccounts", "groups", id);
  return client.delete<null>(url, options);
};
