import { client } from "api";
import * as services from "./services";

export const getTemplate = services.retrieveService<Model.Template>((id: number) => ["templates", id]);
export const getTemplates = services.listService<Model.SimpleTemplate>(["templates"]);
export const getCommunityTemplates = services.listService<Model.SimpleTemplate>(["templates", "community"]);
export const getTemplateAccounts = services.listService<Model.Account>((id: number) => ["templates", id, "accounts"]);
export const getTemplateAccountMarkups = services.listService<Model.Markup>((id: number) => [
  "templates",
  id,
  "markups"
]);
export const getTemplateAccountGroups = services.listService<Model.Group>((id: number) => ["templates", id, "groups"]);
export const getTemplateFringes = services.listService<Model.Fringe>((id: number) => ["templates", id, "fringes"]);
export const deleteTemplate = services.deleteService((id: number) => ["templates", id]);
export const updateTemplate = services.detailPatchService<Http.TemplatePayload, Model.Template>((id: number) => [
  "templates",
  id
]);
export const createTemplate = services.postService<Http.TemplatePayload, Model.Template>(["templates"]);
export const createCommunityTemplate = services.postService<Http.TemplatePayload | FormData, Model.Template>([
  "templates",
  "community"
]);
export const createTemplateAccount = services.detailPostService<Http.AccountPayload, Model.Account>((id: number) => [
  "templates",
  id,
  "accounts"
]);
export const createTemplateAccountGroup = services.detailPostService<Http.GroupPayload, Model.Group>((id: number) => [
  "templates",
  id,
  "groups"
]);
export const createTemplateFringe = services.detailPostService<Http.FringePayload, Model.Fringe>((id: number) => [
  "templates",
  id,
  "fringes"
]);
export const createTemplateAccountMarkup = services.detailPostService<
  Http.MarkupPayload,
  Http.BudgetContextDetailResponse<Model.Markup>
>((id: number) => ["templates", id, "markups"]);

export const duplicateTemplate = async (id: number, options: Http.RequestOptions = {}): Promise<Model.Template> => {
  const url = services.URL.v1("templates", id, "duplicate");
  return client.post<Model.Template>(url, {}, options);
};

export const bulkDeleteTemplateFringes = async (
  id: number,
  ids: number[],
  options: Http.RequestOptions = {}
): Promise<Http.BulkDeleteResponse<Model.Template>> => {
  const url = services.URL.v1("templates", id, "bulk-delete-fringes");
  return client.patch<Http.BulkDeleteResponse<Model.Template>>(url, { ids }, options);
};

export const bulkDeleteTemplateMarkups = async (
  id: number,
  ids: number[],
  options: Http.RequestOptions = {}
): Promise<Http.BulkDeleteResponse<Model.Template>> => {
  const url = services.URL.v1("templates", id, "bulk-delete-markups");
  return client.patch<Http.BulkDeleteResponse<Model.Template>>(url, { ids }, options);
};

export const bulkUpdateTemplateAccounts = async (
  id: number,
  data: Http.BulkUpdatePayload<Http.AccountPayload>,
  options: Http.RequestOptions = {}
): Promise<Http.BulkResponse<Model.Template, Model.Account>> => {
  const url = services.URL.v1("templates", id, "bulk-update-accounts");
  return client.patch<Http.BulkResponse<Model.Template, Model.Account>>(url, data, options);
};

export const bulkDeleteTemplateAccounts = async (
  id: number,
  ids: number[],
  options: Http.RequestOptions = {}
): Promise<Http.BulkDeleteResponse<Model.Template>> => {
  const url = services.URL.v1("templates", id, "bulk-delete-accounts");
  return client.patch<Http.BulkDeleteResponse<Model.Template>>(url, { ids }, options);
};

export const bulkCreateTemplateAccounts = async (
  id: number,
  payload: Http.BulkCreatePayload<Http.AccountPayload>,
  options: Http.RequestOptions = {}
): Promise<Http.BulkResponse<Model.Template, Model.Account>> => {
  const url = services.URL.v1("templates", id, "bulk-create-accounts");
  return client.patch<Http.BulkResponse<Model.Template, Model.Account>>(url, payload, options);
};

export const bulkUpdateTemplateFringes = async (
  id: number,
  data: Http.BulkUpdatePayload<Http.FringePayload>,
  options: Http.RequestOptions = {}
): Promise<Http.BulkResponse<Model.Template, Model.Fringe>> => {
  const url = services.URL.v1("templates", id, "bulk-update-fringes");
  return client.patch<Http.BulkResponse<Model.Template, Model.Fringe>>(url, data, options);
};

export const bulkCreateTemplateFringes = async (
  id: number,
  payload: Http.BulkCreatePayload<Http.FringePayload>,
  options: Http.RequestOptions = {}
): Promise<Http.BulkResponse<Model.Template, Model.Fringe>> => {
  const url = services.URL.v1("templates", id, "bulk-create-fringes");
  return client.patch<Http.BulkResponse<Model.Template, Model.Fringe>>(url, payload, options);
};
