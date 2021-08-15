import { client } from "api";
import { URL } from "./util";

export const getContacts = async (
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<Model.Contact>> => {
  const url = URL.v1("contacts");
  return client.list<Model.Contact>(url, query, options);
};

export const getContact = async (id: number, options: Http.RequestOptions = {}): Promise<Model.Contact> => {
  const url = URL.v1("contacts", id);
  return client.retrieve<Model.Contact>(url, options);
};

export const updateContact = async (
  id: number,
  payload: Partial<Http.ContactPayload>,
  options: Http.RequestOptions = {}
): Promise<Model.Contact> => {
  const url = URL.v1("contacts", id);
  return client.patch<Model.Contact>(url, payload, options);
};

export const createContact = async (
  payload: Http.ContactPayload,
  options: Http.RequestOptions = {}
): Promise<Model.Contact> => {
  const url = URL.v1("contacts");
  return client.post<Model.Contact>(url, payload, options);
};

export const deleteContact = async (id: number, options: Http.RequestOptions = {}): Promise<null> => {
  const url = URL.v1("contacts", id);
  return client.delete<null>(url, options);
};

export const bulkUpdateContacts = async (
  data: Http.BulkUpdatePayload<Http.ContactPayload>[],
  options: Http.RequestOptions = {}
): Promise<Model.Contact> => {
  const url = URL.v1("contacts", "bulk-update");
  return client.patch<Model.Contact>(url, { data }, options);
};

export const bulkCreateContacts = async (
  payload: Http.BulkCreatePayload<Http.ContactPayload>,
  options: Http.RequestOptions = {}
): Promise<Http.BulkCreateResponse<Model.Contact>> => {
  const url = URL.v1("contacts", "bulk-create");
  return client.patch<Http.BulkCreateResponse<Model.Contact>>(url, payload, options);
};

export const bulkDeleteContacts = async (ids: number[], options: Http.RequestOptions = {}): Promise<void> => {
  const url = URL.v1("contacts", "bulk-delete");
  return client.patch<void>(url, { ids }, options);
};
