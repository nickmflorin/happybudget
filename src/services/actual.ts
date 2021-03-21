import { client } from "api";
import { URL } from "./util";

export const getActual = async (id: number, options: Http.IRequestOptions = {}): Promise<IActual> => {
  const url = URL.v1("actuals", id);
  return client.retrieve<IActual>(url, options);
};

export const deleteActual = async (id: number, options: Http.IRequestOptions = {}): Promise<null> => {
  const url = URL.v1("actuals", id);
  return client.delete<null>(url, options);
};

export const updateActual = async (
  id: number,
  payload: Partial<Http.IActualPayload>,
  options: Http.IRequestOptions = {}
): Promise<IActual> => {
  const url = URL.v1("actuals", id);
  return client.patch<IActual>(url, payload, options);
};

export const getAccountActuals = async (
  id: number,
  options: Http.IRequestOptions = {}
): Promise<Http.IListResponse<IActual>> => {
  const url = URL.v1("accounts", id, "actuals");
  return client.list<IActual>(url, options);
};

export const createAccountActual = async (
  id: number,
  payload: Http.IActualPayload,
  options: Http.IRequestOptions = {}
): Promise<IActual> => {
  const url = URL.v1("accounts", id, "actuals");
  return client.post<IActual>(url, payload, options);
};

export const getSubAccountActuals = async (
  id: number,
  options: Http.IRequestOptions = {}
): Promise<Http.IListResponse<IActual>> => {
  const url = URL.v1("subaccounts", id, "actuals");
  return client.list<IActual>(url, options);
};

export const createSubAccountActual = async (
  id: number,
  payload: Http.IActualPayload,
  options: Http.IRequestOptions = {}
): Promise<IActual> => {
  const url = URL.v1("subaccounts", id, "actuals");
  return client.post<IActual>(url, payload, options);
};
