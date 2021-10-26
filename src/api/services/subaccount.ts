import { client } from "api";
import * as services from "./services";

export const getSubAccount = services.retrieveService<Model.SubAccount>((id: number) => ["subaccounts", id]);
export const getSubAccountSubAccountMarkups = services.detailListService<Model.Markup>((id: number) => [
  "subaccounts",
  id,
  "markups"
]);
export const getSubAccountSubAccountGroups = services.detailListService<Model.Group>((id: number) => [
  "subaccounts",
  id,
  "groups"
]);
export const getSubAccountActuals = services.detailListService<Model.Actual>((id: number) => [
  "subaccounts",
  id,
  "actuals"
]);
export const deleteSubAccount = services.deleteService((id: number) => ["subaccounts", id]);
export const updateSubAccount = services.detailPatchService<Http.SubAccountPayload, Model.SubAccount>((id: number) => [
  "subaccounts",
  id
]);
export const createSubAccountSubAccount = services.detailPostService<Http.SubAccountPayload, Model.SubAccount>(
  (id: number) => ["subaccounts", id, "subaccounts"]
);
export const createSubAccountSubAccountMarkup = services.detailPostService<
  Http.MarkupPayload,
  Http.BudgetParentContextDetailResponse<Model.Markup, Model.Account>
>((id: number) => ["subaccounts", id, "markups"]);
export const createSubAccountSubAccountGroup = services.detailPostService<Http.GroupPayload, Model.Group>(
  (id: number) => ["subaccounts", id, "groups"]
);
export const createSubAccountActual = services.detailPostService<Http.ActualPayload, Model.Actual>((id: number) => [
  "subaccounts",
  id,
  "actuals"
]);

export const getSubAccountSubAccounts = async <M extends Model.SubAccount | Model.SimpleSubAccount = Model.SubAccount>(
  subaccountId: number,
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<M>> => {
  const url = services.URL.v1("subaccounts", subaccountId, "subaccounts");
  return client.list<M>(url, query, options);
};

export const getSubAccountUnits = async (options: Http.RequestOptions = {}): Promise<Http.ListResponse<Model.Tag>> => {
  const url = services.URL.v1("subaccounts", "units");
  return client.list<Model.Tag>(url, { no_pagination: true }, options);
};

export const getSubAccountAttachments = services.detailListService<Model.Attachment>((id: number) => [
  "subaccounts",
  id,
  "attachments"
]);
export const deleteSubAccountAttachment = services.detailDeleteService((id: number, objId: number) => [
  "subaccounts",
  id,
  "attachments",
  objId
]);
export const uploadSubAccountAttachment = services.detailPostService<FormData, Model.Attachment>((id: number) => [
  "subaccounts",
  id,
  "attachments"
]);

export const bulkUpdateSubAccountSubAccounts = async <B extends Model.Budget | Model.Template>(
  id: number,
  data: Http.BulkUpdatePayload<Http.SubAccountPayload>,
  options: Http.RequestOptions = {}
): Promise<Http.BudgetBulkResponse<B, Model.SubAccount, Model.SubAccount>> => {
  const url = services.URL.v1("subaccounts", id, "bulk-update-subaccounts");
  return client.patch<Http.BudgetBulkResponse<B, Model.SubAccount, Model.SubAccount>>(url, data, options);
};

export const bulkDeleteSubAccountSubAccounts = async <B extends Model.Budget | Model.Template>(
  id: number,
  ids: number[],
  options: Http.RequestOptions = {}
): Promise<Http.BudgetBulkDeleteResponse<B, Model.SubAccount>> => {
  const url = services.URL.v1("subaccounts", id, "bulk-delete-subaccounts");
  return client.patch<Http.BudgetBulkDeleteResponse<B, Model.SubAccount>>(url, { ids }, options);
};

export const bulkDeleteSubAccountMarkups = async <B extends Model.Budget | Model.Template>(
  id: number,
  ids: number[],
  options: Http.RequestOptions = {}
): Promise<Http.BudgetBulkDeleteResponse<B, Model.SubAccount>> => {
  const url = services.URL.v1("subaccounts", id, "bulk-delete-markups");
  return client.patch<Http.BudgetBulkDeleteResponse<B, Model.SubAccount>>(url, { ids }, options);
};

export const bulkCreateSubAccountSubAccounts = async <B extends Model.Budget | Model.Template>(
  id: number,
  payload: Http.BulkCreatePayload<Http.SubAccountPayload>,
  options: Http.RequestOptions = {}
): Promise<Http.BudgetBulkResponse<B, Model.SubAccount, Model.SubAccount>> => {
  const url = services.URL.v1("subaccounts", id, "bulk-create-subaccounts");
  return client.patch<Http.BudgetBulkResponse<B, Model.SubAccount, Model.SubAccount>>(url, payload, options);
};
