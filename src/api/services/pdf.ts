import { client } from "api";
import * as services from "./services";

export const getHeaderTemplates = async (
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<Model.SimpleHeaderTemplate>> => {
  const url = services.URL.v1("pdf", "header-templates");
  return client.list<Model.SimpleHeaderTemplate>(url, query, options);
};

export const getHeaderTemplate = services.retrieveService<Model.HeaderTemplate>((id: number) => [
  "pdf",
  "header-templates",
  id
]);

export const updateHeaderTemplate = async (
  id: number,
  payload: Partial<Http.HeaderTemplatePayload>,
  options: Http.RequestOptions = {}
): Promise<Model.HeaderTemplate> => {
  const url = services.URL.v1("pdf", "header-templates", id);
  return client.patch<Model.HeaderTemplate>(url, payload, options);
};

export const createHeaderTemplate = async (
  payload: Http.HeaderTemplatePayload,
  options: Http.RequestOptions = {}
): Promise<Model.HeaderTemplate> => {
  const url = services.URL.v1("pdf", "header-templates");
  return client.post<Model.HeaderTemplate>(url, payload, options);
};

export const deleteHeaderTemplate = async (id: number, options: Http.RequestOptions = {}): Promise<null> => {
  const url = services.URL.v1("pdf", "header-templates", id);
  return client.delete<null>(url, options);
};
