import { client } from "api";
import { URL } from "./util";

export const getBudgetComments = async (
  id: number,
  query: Http.IListQuery = {},
  options: Http.IRequestOptions = {}
): Promise<Http.IListResponse<IComment>> => {
  const url = URL.v1("budgets", id, "comments");
  return client.list<IComment>(url, query, options);
};

export const getAccountComments = async (
  id: number,
  query: Http.IListQuery = {},
  options: Http.IRequestOptions = {}
): Promise<Http.IListResponse<IComment>> => {
  const url = URL.v1("accounts", id, "comments");
  return client.list<IComment>(url, query, options);
};

export const getSubAccountComments = async (
  id: number,
  query: Http.IListQuery = {},
  options: Http.IRequestOptions = {}
): Promise<Http.IListResponse<IComment>> => {
  const url = URL.v1("subaccounts", id, "comments");
  return client.list<IComment>(url, query, options);
};

export const getComment = async (id: number, options: Http.IRequestOptions = {}): Promise<IComment> => {
  const url = URL.v1("comments", id);
  return client.retrieve<IComment>(url, options);
};

export const deleteComment = async (id: number, options: Http.IRequestOptions = {}): Promise<null> => {
  const url = URL.v1("comments", id);
  return client.delete<null>(url, options);
};

export const updateComment = async (
  id: number,
  payload: Partial<Http.ICommentPayload>,
  options: Http.IRequestOptions = {}
): Promise<IComment> => {
  const url = URL.v1("comments", id);
  return client.patch<IComment>(url, payload, options);
};

export const createBudgetComment = async (
  id: number,
  payload: Http.ICommentPayload,
  options: Http.IRequestOptions = {}
): Promise<IComment> => {
  const url = URL.v1("budgets", id, "comments");
  return client.post<IComment>(url, payload, options);
};

export const createAccountComment = async (
  id: number,
  payload: Http.ICommentPayload,
  options: Http.IRequestOptions = {}
): Promise<IComment> => {
  const url = URL.v1("accounts", id, "comments");
  return client.post<IComment>(url, payload, options);
};

export const createSubAccountComment = async (
  id: number,
  payload: Http.ICommentPayload,
  options: Http.IRequestOptions = {}
): Promise<IComment> => {
  const url = URL.v1("subaccounts", id, "comments");
  return client.post<IComment>(url, payload, options);
};
