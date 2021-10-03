import { client } from "api";
import * as services from "./services";

export const getContacts = async (
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<Model.Contact>> => {
  const url = services.URL.v1("contacts");
  return client.list<Model.Contact>(url, query, options);
};

export const getContact = services.retrieveService<Model.Contact>((id: number) => ["contacts", id]);

export const updateContact = async (
  id: number,
  payload: Partial<Http.ContactPayload>,
  options: Http.RequestOptions = {}
): Promise<Model.Contact> => {
  const url = services.URL.v1("contacts", id);
  return client.patch<Model.Contact>(url, payload, options);
};

export const createContact = async (
  payload: Http.ContactPayload,
  options: Http.RequestOptions = {}
): Promise<Model.Contact> => {
  const url = services.URL.v1("contacts");
  return client.post<Model.Contact>(url, payload, options);
};

export const deleteContact = async (id: number, options: Http.RequestOptions = {}): Promise<null> => {
  const url = services.URL.v1("contacts", id);
  return client.delete<null>(url, options);
};

export const bulkUpdateContacts = async (
  data: Http.BulkUpdatePayload<Http.ContactPayload>,
  options: Http.RequestOptions = {}
): Promise<Model.Contact> => {
  const url = services.URL.v1("contacts", "bulk-update");
  return client.patch<Model.Contact>(url, data, options);
};

export const bulkCreateContacts = async (
  payload: Http.BulkCreatePayload<Http.ContactPayload>,
  options: Http.RequestOptions = {}
): Promise<Http.BulkModelResponse<Model.Contact>> => {
  const url = services.URL.v1("contacts", "bulk-create");
  return client.patch<Http.BulkModelResponse<Model.Contact>>(url, payload, options);
};

export const bulkDeleteContacts = async (ids: number[], options: Http.RequestOptions = {}): Promise<void> => {
  const url = services.URL.v1("contacts", "bulk-delete");
  return client.patch<void>(url, { ids }, options);
};
