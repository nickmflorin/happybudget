import { client } from "api";
import * as services from "./services";

export const getAccount = services.retrieveService<Model.Account>((id: number) => ["accounts", id]);
export const getAccountSubAccountMarkups = services.detailListService<Model.Markup>((id: number) => [
  "accounts",
  id,
  "markups"
]);
export const getAccountSubAccountGroups = services.detailListService<Model.Group>((id: number) => [
  "accounts",
  id,
  "groups"
]);
export const deleteAccount = services.deleteService((id: number) => ["accounts", id]);
export const updateAccount = services.detailPatchService<Http.AccountPayload, Model.Account>((id: number) => [
  "accounts",
  id
]);
export const createAccountSubAccount = services.detailPostService<Http.SubAccountPayload, Model.SubAccount>(
  (id: number) => ["accounts", id, "subaccounts"]
);
export const createAccountSubAccountMarkup = services.detailPostService<
  Http.MarkupPayload,
  Http.BudgetParentContextDetailResponse<Model.Markup, Model.Account>
>((id: number) => ["accounts", id, "markups"]);
export const createAccountSubAccountGroup = services.detailPostService<Http.GroupPayload, Model.Group>((id: number) => [
  "accounts",
  id,
  "groups"
]);

export const getAccountSubAccounts = async <M extends Model.SubAccount | Model.SimpleSubAccount = Model.SubAccount>(
  accountId: number,
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<M>> => {
  const url = services.URL.v1("accounts", accountId, "subaccounts");
  return client.list<M>(url, query, options);
};

export const bulkUpdateAccountSubAccounts = async <B extends Model.Budget | Model.Template>(
  id: number,
  data: Http.BulkUpdatePayload<Http.SubAccountPayload>,
  options: Http.RequestOptions = {}
): Promise<Http.BudgetBulkResponse<B, Model.Account, Model.SubAccount>> => {
  const url = services.URL.v1("accounts", id, "bulk-update-subaccounts");
  return client.patch<Http.BudgetBulkResponse<B, Model.Account, Model.SubAccount>>(url, data, options);
};

export const bulkDeleteAccountSubAccounts = async <B extends Model.Budget | Model.Template>(
  id: number,
  ids: number[],
  options: Http.RequestOptions = {}
): Promise<Http.BudgetBulkDeleteResponse<B, Model.Account>> => {
  const url = services.URL.v1("accounts", id, "bulk-delete-subaccounts");
  return client.patch<Http.BudgetBulkDeleteResponse<B, Model.Account>>(url, { ids }, options);
};

export const bulkCreateAccountSubAccounts = async <B extends Model.Budget | Model.Template>(
  id: number,
  payload: Http.BulkCreatePayload<Http.SubAccountPayload>,
  options: Http.RequestOptions = {}
): Promise<Http.BudgetBulkResponse<B, Model.Account, Model.SubAccount>> => {
  const url = services.URL.v1("accounts", id, "bulk-create-subaccounts");
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
