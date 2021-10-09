import { client } from "api";
import * as services from "./services";

export const getHeaderTemplates = async (
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<Model.SimpleHeaderTemplate>> => {
  const url = services.URL.v1("pdf", "header-templates");
  return client.list<Model.SimpleHeaderTemplate>(url, query, options);
};

export const deleteHeaderTemplate = services.deleteService((id: number) => ["pdf", "header-templates", id]);
export const updateHeaderTemplate = services.detailPatchService<Http.HeaderTemplatePayload, Model.HeaderTemplate>(
  (id: number) => ["pdf", "header-templates", id]
);
export const getHeaderTemplate = services.retrieveService<Model.HeaderTemplate>((id: number) => [
  "pdf",
  "header-templates",
  id
]);

export const createHeaderTemplate = async (
  payload: Http.HeaderTemplatePayload,
  options: Http.RequestOptions = {}
): Promise<Model.HeaderTemplate> => {
  const url = services.URL.v1("pdf", "header-templates");
  return client.post<Model.HeaderTemplate>(url, payload, options);
};
