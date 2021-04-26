import { client } from "api";
import { URL } from "./util";

export const getTemplates = async (
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<Model.Template>> => {
  const url = URL.v1("templates");
  return client.list<Model.Template>(url, query, options);
};

export const getCommunityTemplates = async (
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<Model.Template>> => {
  const url = URL.v1("templates", "community");
  return client.list<Model.Template>(url, query, options);
};

export const getTemplate = async (id: number, options: Http.RequestOptions = {}): Promise<Model.Template> => {
  const url = URL.v1("templates", id);
  return client.retrieve<Model.Template>(url, options);
};

export const updateTemplate = async (
  id: number,
  payload: Partial<Http.TemplatePayload> | FormData,
  options: Http.RequestOptions = {}
): Promise<Model.Template> => {
  const url = URL.v1("templates", id);
  return client.patch<Model.Template>(url, payload, options);
};

export const duplicateTemplate = async (id: number, options: Http.RequestOptions = {}): Promise<Model.Template> => {
  const url = URL.v1("templates", id, "duplicate");
  return client.post<Model.Template>(url, {}, options);
};

export const createTemplate = async (
  payload: Http.TemplatePayload | FormData,
  options: Http.RequestOptions = {}
): Promise<Model.Template> => {
  const url = URL.v1("templates");
  return client.post<Model.Template>(url, payload, options);
};

export const createCommunityTemplate = async (
  payload: Http.TemplatePayload | FormData,
  options: Http.RequestOptions = {}
): Promise<Model.Template> => {
  const url = URL.v1("templates", "community");
  return client.post<Model.Template>(url, payload, options);
};

export const getTemplatesInTrash = async (
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<Model.Template>> => {
  const url = URL.v1("templates", "trash");
  return client.list<Model.Template>(url, query, options);
};

export const getTemplateInTrash = async (id: number, options: Http.RequestOptions = {}): Promise<Model.Template> => {
  const url = URL.v1("templates", "trash", id);
  return client.retrieve<Model.Template>(url, options);
};

export const deleteTemplate = async (id: number, options: Http.RequestOptions = {}): Promise<null> => {
  const url = URL.v1("templates", id);
  return client.delete<null>(url, options);
};

export const restoreTemplate = async (id: number, options: Http.RequestOptions = {}): Promise<Model.Template> => {
  const url = URL.v1("templates", "trash", id, "restore");
  return client.patch<Model.Template>(url, options);
};

export const permanentlyDeleteTemplate = async (id: number, options: Http.RequestOptions = {}): Promise<null> => {
  const url = URL.v1("templates", "trash", id);
  return client.delete<null>(url, options);
};

export const getTemplateAccounts = async (
  id: number,
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<Model.TemplateAccount>> => {
  const url = URL.v1("templates", id, "accounts");
  return client.list<Model.TemplateAccount>(url, query, options);
};

export const createTemplateAccount = async (
  id: number,
  payload: Http.TemplateAccountPayload,
  options: Http.RequestOptions = {}
): Promise<Model.TemplateAccount> => {
  const url = URL.v1("templates", id, "accounts");
  return client.post<Model.TemplateAccount>(url, payload, options);
};

export const getTemplateAccountGroups = async (
  id: number,
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<Model.TemplateGroup>> => {
  const url = URL.v1("templates", id, "groups");
  return client.list<Model.TemplateGroup>(url, query, options);
};

export const createTemplateAccountGroup = async (
  id: number,
  payload: Http.GroupPayload,
  options: Http.RequestOptions = {}
): Promise<Model.TemplateGroup> => {
  const url = URL.v1("templates", id, "groups");
  return client.post<Model.TemplateGroup>(url, payload, options);
};

export const getTemplateFringes = async (
  id: number,
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<Model.Fringe>> => {
  const url = URL.v1("templates", id, "fringes");
  return client.list<Model.Fringe>(url, query, options);
};

export const createTemplateFringe = async (
  id: number,
  payload: Http.FringePayload,
  options: Http.RequestOptions = {}
): Promise<Model.Fringe> => {
  const url = URL.v1("templates", id, "fringes");
  return client.post<Model.Fringe>(url, payload, options);
};

export const bulkUpdateTemplateAccounts = async (
  id: number,
  data: Http.BulkUpdatePayload<Http.TemplateAccountPayload>[],
  options: Http.RequestOptions = {}
): Promise<Model.Template> => {
  const url = URL.v1("templates", id, "bulk-update-accounts");
  return client.patch<Model.Template>(url, { data }, options);
};

export const bulkCreateTemplateAccounts = async (
  id: number,
  data: Http.TemplateAccountPayload[],
  options: Http.RequestOptions = {}
): Promise<Model.TemplateAccount[]> => {
  const url = URL.v1("templates", id, "bulk-create-accounts");
  return client
    .patch<Http.BulkCreateResponse<Model.TemplateAccount>>(url, { data }, options)
    .then((response: Http.BulkCreateResponse<Model.TemplateAccount>) => response.data);
};

export const bulkUpdateTemplateFringes = async (
  id: number,
  data: Http.BulkUpdatePayload<Http.FringePayload>[],
  options: Http.RequestOptions = {}
): Promise<Model.Template> => {
  const url = URL.v1("templates", id, "bulk-update-fringes");
  return client.patch<Model.Template>(url, { data }, options);
};

export const bulkCreateTemplateFringes = async (
  id: number,
  data: Http.FringePayload[],
  options: Http.RequestOptions = {}
): Promise<Model.Fringe[]> => {
  const url = URL.v1("templates", id, "bulk-create-fringes");
  return client
    .patch<Http.BulkCreateResponse<Model.Fringe>>(url, { data }, options)
    .then((response: Http.BulkCreateResponse<Model.Fringe>) => response.data);
};
