import { client } from "api";
import { URL } from "./util";

export const getTemplates = async (
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<Model.SimpleTemplate>> => {
  const url = URL.v1("templates");
  return client.list<Model.SimpleTemplate>(url, query, options);
};

export const getCommunityTemplates = async (
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<Model.SimpleTemplate>> => {
  const url = URL.v1("templates", "community");
  return client.list<Model.Template>(url, query, options);
};

export const getTemplate = async (id: ID, options: Http.RequestOptions = {}): Promise<Model.Template> => {
  const url = URL.v1("templates", id);
  return client.retrieve<Model.Template>(url, options);
};

export const updateTemplate = async (
  id: ID,
  payload: Partial<Http.TemplatePayload> | FormData,
  options: Http.RequestOptions = {}
): Promise<Model.Template> => {
  const url = URL.v1("templates", id);
  return client.patch<Model.Template>(url, payload, options);
};

export const duplicateTemplate = async (id: ID, options: Http.RequestOptions = {}): Promise<Model.Template> => {
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

export const deleteTemplate = async (id: ID, options: Http.RequestOptions = {}): Promise<null> => {
  const url = URL.v1("templates", id);
  return client.delete<null>(url, options);
};

export const getTemplateAccounts = async (
  id: ID,
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<Model.Account>> => {
  const url = URL.v1("templates", id, "accounts");
  return client.list<Model.Account>(url, query, options);
};

export const createTemplateAccount = async (
  id: ID,
  payload: Http.AccountPayload,
  options: Http.RequestOptions = {}
): Promise<Model.Account> => {
  const url = URL.v1("templates", id, "accounts");
  return client.post<Model.Account>(url, payload, options);
};

export const getTemplateAccountGroups = async (
  id: ID,
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<Model.BudgetGroup>> => {
  const url = URL.v1("templates", id, "groups");
  return client.list<Model.BudgetGroup>(url, query, options);
};

export const createTemplateAccountGroup = async (
  id: ID,
  payload: Http.GroupPayload,
  options: Http.RequestOptions = {}
): Promise<Model.BudgetGroup> => {
  const url = URL.v1("templates", id, "groups");
  return client.post<Model.BudgetGroup>(url, payload, options);
};

export const getTemplateFringes = async (
  id: ID,
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<Model.Fringe>> => {
  const url = URL.v1("templates", id, "fringes");
  return client.list<Model.Fringe>(url, query, options);
};

export const bulkDeleteTemplateFringes = async (
  id: ID,
  ids: ID[],
  options: Http.RequestOptions = {}
): Promise<Http.BulkModelResponse<Model.Template>> => {
  const url = URL.v1("templates", id, "bulk-delete-fringes");
  return client.patch<Http.BulkModelResponse<Model.Template>>(url, { ids }, options);
};

export const createTemplateFringe = async (
  id: ID,
  payload: Http.FringePayload,
  options: Http.RequestOptions = {}
): Promise<Model.Fringe> => {
  const url = URL.v1("templates", id, "fringes");
  return client.post<Model.Fringe>(url, payload, options);
};

export const bulkUpdateTemplateAccounts = async (
  id: ID,
  data: Http.BulkUpdatePayload<Http.AccountPayload>,
  options: Http.RequestOptions = {}
): Promise<Http.BulkModelResponse<Model.Template>> => {
  const url = URL.v1("templates", id, "bulk-update-accounts");
  return client.patch<Http.BulkModelResponse<Model.Template>>(url, data, options);
};

export const bulkDeleteTemplateAccounts = async (
  id: ID,
  ids: ID[],
  options: Http.RequestOptions = {}
): Promise<Http.BulkModelResponse<Model.Template>> => {
  const url = URL.v1("templates", id, "bulk-delete-accounts");
  return client.patch<Http.BulkModelResponse<Model.Template>>(url, { ids }, options);
};

export const bulkCreateTemplateAccounts = async (
  id: ID,
  payload: Http.BulkCreatePayload<Http.AccountPayload>,
  options: Http.RequestOptions = {}
): Promise<Http.BulkCreateChildrenResponse<Model.Template, Model.Account>> => {
  const url = URL.v1("templates", id, "bulk-create-accounts");
  return client.patch<Http.BulkCreateChildrenResponse<Model.Template, Model.Account>>(url, payload, options);
};

export const bulkUpdateTemplateFringes = async (
  id: ID,
  data: Http.BulkUpdatePayload<Http.FringePayload>,
  options: Http.RequestOptions = {}
): Promise<Http.BulkModelResponse<Model.Template>> => {
  const url = URL.v1("templates", id, "bulk-update-fringes");
  return client.patch<Http.BulkModelResponse<Model.Template>>(url, data, options);
};

export const bulkCreateTemplateFringes = async (
  id: ID,
  payload: Http.BulkCreatePayload<Http.FringePayload>,
  options: Http.RequestOptions = {}
): Promise<Http.BulkCreateChildrenResponse<Model.Template, Model.Fringe>> => {
  const url = URL.v1("templates", id, "bulk-create-fringes");
  return client.patch<Http.BulkCreateChildrenResponse<Model.Template, Model.Fringe>>(url, payload, options);
};
