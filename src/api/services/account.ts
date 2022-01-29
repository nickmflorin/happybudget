import { client } from "api";
import * as services from "./services";

export const getAccount = services.retrieveService<Model.Account>((id: number) => ["accounts", id]);
export const getAccountMarkups = services.detailListService<Model.Markup>((id: number) => ["accounts", id, "markups"]);
export const getAccountGroups = services.detailListService<Model.Group>((id: number) => ["accounts", id, "groups"]);
export const deleteAccount = services.deleteService((id: number) => ["accounts", id]);
export const updateAccount = services.detailPatchService<Http.AccountPayload, Model.Account>((id: number) => [
  "accounts",
  id
]);
export const createAccountChild = services.detailPostService<Http.SubAccountPayload, Model.SubAccount>((id: number) => [
  "accounts",
  id,
  "children"
]);
export const createAccountMarkup = services.detailPostService<
  Http.MarkupPayload,
  Http.BudgetParentContextDetailResponse<Model.Markup, Model.Account>
>((id: number) => ["accounts", id, "markups"]);

export const createAccountGroup = services.detailPostService<Http.GroupPayload, Model.Group>((id: number) => [
  "accounts",
  id,
  "groups"
]);

export const getAccountChildren = async <M extends Model.SubAccount | Model.SimpleSubAccount = Model.SubAccount>(
  accountId: number,
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<M>> => {
  const url = services.URL.v1("accounts", accountId, "children");
  return client.list<M>(url, query, options);
};

export const bulkUpdateAccountChildren = async <B extends Model.Budget | Model.Template>(
  id: number,
  data: Http.BulkUpdatePayload<Http.SubAccountPayload>,
  options: Http.RequestOptions = {}
): Promise<Http.BudgetBulkResponse<B, Model.Account, Model.SubAccount>> => {
  const url = services.URL.v1("accounts", id, "bulk-update-children");
  return client.patch<Http.BudgetBulkResponse<B, Model.Account, Model.SubAccount>>(url, data, options);
};

export const bulkDeleteAccountChildren = async <B extends Model.Budget | Model.Template>(
  id: number,
  ids: number[],
  options: Http.RequestOptions = {}
): Promise<Http.BudgetBulkDeleteResponse<B, Model.Account>> => {
  const url = services.URL.v1("accounts", id, "bulk-delete-children");
  return client.patch<Http.BudgetBulkDeleteResponse<B, Model.Account>>(url, { ids }, options);
};

export const bulkCreateAccountChildren = async <B extends Model.Budget | Model.Template>(
  id: number,
  payload: Http.BulkCreatePayload<Http.SubAccountPayload>,
  options: Http.RequestOptions = {}
): Promise<Http.BudgetBulkResponse<B, Model.Account, Model.SubAccount>> => {
  const url = services.URL.v1("accounts", id, "bulk-create-children");
  return client.patch<Http.BudgetBulkResponse<B, Model.Account, Model.SubAccount>>(url, payload, options);
};

export const bulkDeleteAccountMarkups = async <B extends Model.Budget | Model.Template>(
  id: number,
  ids: number[],
  options: Http.RequestOptions = {}
): Promise<Http.BudgetBulkDeleteResponse<B, Model.Account>> => {
  const url = services.URL.v1("accounts", id, "bulk-delete-markups");
  return client.patch<Http.BudgetBulkDeleteResponse<B, Model.Account>>(url, { ids }, options);
};
