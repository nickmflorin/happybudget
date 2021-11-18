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
export const updateContact = services.detailPatchService<Http.ContactPayload, Model.Contact>((id: number) => [
  "contacts",
  id
]);
export const deleteContact = services.deleteService((id: number) => ["contacts", id]);
export const createContact = services.postService<Http.ContactPayload, Model.Contact>(["contacts"]);

export const getContactAttachments = services.detailListService<Model.Attachment>((id: number) => [
  "contacts",
  id,
  "attachments"
]);
export const deleteContactAttachment = services.detailDeleteService((id: number, objId: number) => [
  "contacts",
  objId,
  "attachments",
  id
]);
export const uploadContactAttachment = services.detailPostService<FormData, Model.Attachment>((id: number) => [
  "contacts",
  id,
  "attachments"
]);

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
