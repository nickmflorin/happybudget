import { client } from "api";
import * as services from "./services";

export const getBudgetComments = services.listService<Model.Comment>((id: number) => ["budgets", id, "comments"]);
export const getAccountComments = services.listService<Model.Comment>((id: number) => ["accounts", id, "comments"]);
export const getSubAccountComments = services.listService<Model.Comment>((id: number) => ["accounts", id, "comments"]);
export const getComment = services.retrieveService<Model.Comment>((id: number) => ["comments", id]);
export const deleteComment = services.deleteService((id: number) => ["comments", id]);
export const updateComment = services.detailPatchService<Http.CommentPayload, Model.Comment>((id: number) => [
  "comments",
  id
]);
export const createBudgetComment = services.detailPostService<Http.CommentPayload, Model.Comment>((id: number) => [
  "budgets",
  id,
  "comments"
]);
export const createAccountComment = services.detailPostService<Http.CommentPayload, Model.Comment>((id: number) => [
  "accounts",
  id,
  "comments"
]);
export const createSubAccountComment = services.detailPostService<Http.CommentPayload, Model.Comment>((id: number) => [
  "subaccounts",
  id,
  "comments"
]);

export const replyToComment = async (
  id: number,
  text: string,
  options: Http.RequestOptions = {}
): Promise<Model.Comment> => {
  const url = services.URL.v1("comments", id, "reply");
  return client.post<Model.Comment>(url, { text }, options);
};
