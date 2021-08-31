import { client } from "api";
import { URL } from "./util";

export const getHeaderTemplates = async (
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<Model.SimpleHeaderTemplate>> => {
  const url = URL.v1("pdf", "header-templates");
  return client.list<Model.SimpleHeaderTemplate>(url, query, options);
};

export const getHeaderTemplate = async (id: ID, options: Http.RequestOptions = {}): Promise<Model.HeaderTemplate> => {
  const url = URL.v1("pdf", "header-templates", id);
  return client.retrieve<Model.HeaderTemplate>(url, options);
};

export const updateHeaderTemplate = async (
  id: ID,
  payload: Partial<Http.HeaderTemplatePayload>,
  options: Http.RequestOptions = {}
): Promise<Model.HeaderTemplate> => {
  const url = URL.v1("pdf", "header-templates", id);
  return client.patch<Model.HeaderTemplate>(url, payload, options);
};

export const createHeaderTemplate = async (
  payload: Http.HeaderTemplatePayload,
  options: Http.RequestOptions = {}
): Promise<Model.HeaderTemplate> => {
  const url = URL.v1("pdf", "header-templates");
  return client.post<Model.HeaderTemplate>(url, payload, options);
};

export const deleteHeaderTemplate = async (id: ID, options: Http.RequestOptions = {}): Promise<null> => {
  const url = URL.v1("pdf", "header-templates", id);
  return client.delete<null>(url, options);
};
