import { client } from "api";
import * as services from "./services";

export const getMarkup = services.retrieveService<Model.Markup>((id: number) => ["markups", id]);

export const updateMarkup = async <R extends Http.MarkupResponseTypes = Http.MarkupResponseTypes>(
  id: number,
  payload: Partial<Http.MarkupPayload>,
  options: Http.RequestOptions = {}
): Promise<R> => {
  const url = services.URL.v1("markups", id);
  return client.patch<R>(url, payload, options);
};

export const deleteMarkup = async (id: number, options: Http.RequestOptions = {}): Promise<null> => {
  const url = services.URL.v1("markups", id);
  return client.delete<null>(url, options);
};

export const removeMarkupChildren = async (
  id: number,
  payload: Http.ModifyMarkupPayload,
  options: Http.RequestOptions = {}
): Promise<Model.Markup> => {
  const url = services.URL.v1("markups", id, "remove-children");
  return client.patch<Model.Markup>(url, payload, options);
};

export const addMarkupChildren = async (
  id: number,
  payload: Http.ModifyMarkupPayload,
  options: Http.RequestOptions = {}
): Promise<Model.Markup> => {
  const url = services.URL.v1("markups", id, "add-children");
  return client.patch<Model.Markup>(url, payload, options);
};
