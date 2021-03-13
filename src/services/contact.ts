import { client } from "api";
import { URL } from "./util";

export const getContacts = async (
  query: Http.IListQuery = {},
  options: Http.IRequestOptions = {}
): Promise<Http.IListResponse<IContact>> => {
  const url = URL.v1("contacts");
  return client.list<IContact>(url, query, options);
};

export const getContact = async (
  id: number,
  query: Http.IListQuery = {},
  options: Http.IRequestOptions = {}
): Promise<IContact> => {
  const url = URL.v1("contacts", id);
  return client.retrieve<IContact>(url, options);
};

export const updateContact = async (
  id: number,
  payload: Partial<Http.IContactPayload>,
  options: Http.IRequestOptions = {}
): Promise<IContact> => {
  const url = URL.v1("contacts", id);
  return client.patch<IContact>(url, payload, options);
};

export const createContact = async (
  payload: Http.IContactPayload,
  options: Http.IRequestOptions = {}
): Promise<IContact> => {
  const url = URL.v1("contacts");
  return client.post<IContact>(url, payload, options);
};

export const deleteContact = async (id: number, options: Http.IRequestOptions = {}): Promise<null> => {
  const url = URL.v1("contacts", id);
  return client.delete<null>(url, options);
};
