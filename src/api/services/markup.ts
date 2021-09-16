import { client } from "api";
import { URL } from "./util";

export const updateMarkup = async (
  id: number,
  payload: Partial<Http.MarkupPayload>,
  options: Http.RequestOptions = {}
): Promise<Model.Markup> => {
  const url = URL.v1("markups", id);
  return client.patch<Model.Markup>(url, payload, options);
};

export const deleteMarkup = async (id: number, options: Http.RequestOptions = {}): Promise<null> => {
  const url = URL.v1("markups", id);
  return client.delete<null>(url, options);
};

export const getMarkup = async (id: number, options: Http.RequestOptions = {}): Promise<Model.Markup> => {
  const url = URL.v1("markups", id);
  return client.retrieve<Model.Markup>(url, options);
};

export const removeMarkupChildren = async (
  id: number,
  payload: Http.ModifyMarkupPayload,
  options: Http.RequestOptions = {}
): Promise<Model.Markup> => {
  const url = URL.v1("markups", id, "remove-children");
  return client.patch<Model.Markup>(url, payload, options);
};

export const addMarkupChildren = async (
  id: number,
  payload: Http.ModifyMarkupPayload,
  options: Http.RequestOptions = {}
): Promise<Model.Markup> => {
  const url = URL.v1("markups", id, "add-children");
  return client.patch<Model.Markup>(url, payload, options);
};
