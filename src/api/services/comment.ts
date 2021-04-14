import { client } from "api";
import { URL } from "./util";

export const getBudgetComments = async (
  id: number,
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<Model.Comment>> => {
  const url = URL.v1("budgets", id, "comments");
  return client.list<Model.Comment>(url, query, options);
};

export const getAccountComments = async (
  id: number,
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<Model.Comment>> => {
  const url = URL.v1("accounts", id, "comments");
  return client.list<Model.Comment>(url, query, options);
};

export const getSubAccountComments = async (
  id: number,
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<Model.Comment>> => {
  const url = URL.v1("subaccounts", id, "comments");
  return client.list<Model.Comment>(url, query, options);
};

export const getComment = async (id: number, options: Http.RequestOptions = {}): Promise<Model.Comment> => {
  const url = URL.v1("comments", id);
  return client.retrieve<Model.Comment>(url, options);
};

export const deleteComment = async (id: number, options: Http.RequestOptions = {}): Promise<null> => {
  const url = URL.v1("comments", id);
  return client.delete<null>(url, options);
};

export const updateComment = async (
  id: number,
  payload: Partial<Http.CommentPayload>,
  options: Http.RequestOptions = {}
): Promise<Model.Comment> => {
  const url = URL.v1("comments", id);
  return client.patch<Model.Comment>(url, payload, options);
};

export const replyToComment = async (
  id: number,
  text: string,
  options: Http.RequestOptions = {}
): Promise<Model.Comment> => {
  const url = URL.v1("comments", id, "reply");
  return client.post<Model.Comment>(url, { text }, options);
};

export const createBudgetComment = async (
  id: number,
  payload: Http.CommentPayload,
  options: Http.RequestOptions = {}
): Promise<Model.Comment> => {
  const url = URL.v1("budgets", id, "comments");
  return client.post<Model.Comment>(url, payload, options);
};

export const createAccountComment = async (
  id: number,
  payload: Http.CommentPayload,
  options: Http.RequestOptions = {}
): Promise<Model.Comment> => {
  const url = URL.v1("accounts", id, "comments");
  return client.post<Model.Comment>(url, payload, options);
};

export const createSubAccountComment = async (
  id: number,
  payload: Http.CommentPayload,
  options: Http.RequestOptions = {}
): Promise<Model.Comment> => {
  const url = URL.v1("subaccounts", id, "comments");
  return client.post<Model.Comment>(url, payload, options);
};
