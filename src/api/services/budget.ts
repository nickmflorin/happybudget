import { client } from "api";
import * as services from "./services";

export const getBudgets = async (
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<Model.SimpleBudget>> => {
  const url = services.URL.v1("budgets");
  return client.list<Model.SimpleBudget>(url, query, options);
};

export const getBudget = services.retrieveService<Model.Budget>((id: number) => ["budgets", id]);

export const updateBudget = async (
  id: number,
  payload: Partial<Http.BudgetPayload> | FormData,
  options: Http.RequestOptions = {}
): Promise<Model.Budget> => {
  const url = services.URL.v1("budgets", id);
  return client.patch<Model.Budget>(url, payload, options);
};

export const getBudgetPdf = services.retrieveService<Model.PdfBudget>((id: number) => ["budgets", id, "pdf"]);

export const createBudget = async (
  payload: Http.BudgetPayload | FormData,
  options: Http.RequestOptions = {}
): Promise<Model.Budget> => {
  const url = services.URL.v1("budgets");
  return client.post<Model.Budget>(url, payload, options);
};

export const deleteBudget = async (id: number, options: Http.RequestOptions = {}): Promise<null> => {
  const url = services.URL.v1("budgets", id);
  return client.delete<null>(url, options);
};

export const getBudgetAccounts = async <M extends Model.Account | Model.SimpleAccount = Model.Account>(
  budgetId: number,
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<M>> => {
  const url = services.URL.v1("budgets", budgetId, "accounts");
  return client.list<M>(url, query, options);
};

export const createBudgetAccount = async (
  budgetId: number,
  payload: Http.AccountPayload,
  options: Http.RequestOptions = {}
): Promise<Model.Account> => {
  const url = services.URL.v1("budgets", budgetId, "accounts");
  return client.post<Model.Account>(url, payload, options);
};

export const getBudgetAccountGroups = async (
  id: number,
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<Model.Group>> => {
  const url = services.URL.v1("budgets", id, "groups");
  return client.list<Model.Group>(url, query, options);
};

export const createBudgetAccountGroup = services.detailPostService<Http.GroupPayload, Model.Group>((id: number) => [
  "budgets",
  id,
  "groups"
]);

export const getBudgetAccountMarkups = async (
  id: number,
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<Model.Markup>> => {
  const url = services.URL.v1("budgets", id, "markups");
  return client.list<Model.Markup>(url, query, options);
};

export const createBudgetAccountMarkup = services.detailPostService<
  Http.MarkupPayload,
  Http.BudgetContextDetailResponse<Model.Markup>
>((id: number) => ["budgets", id, "markups"]);

export const getBudgetFringes = async (
  id: number,
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<Model.Fringe>> => {
  const url = services.URL.v1("budgets", id, "fringes");
  return client.list<Model.Fringe>(url, query, options);
};

export const createBudgetFringe = async (
  id: number,
  payload: Http.FringePayload,
  options: Http.RequestOptions = {}
): Promise<Model.Fringe> => {
  const url = services.URL.v1("budgets", id, "fringes");
  return client.post<Model.Fringe>(url, payload, options);
};

export const getBudgetSubAccounts = async (
  id: number,
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<Model.SimpleSubAccount>> => {
  const url = services.URL.v1("budgets", id, "subaccounts");
  return client.list<Model.SimpleSubAccount>(url, query, options);
};

export const getBudgetSubAccountsTree = async (
  id: number,
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<Model.SubAccountTreeNode>> => {
  const url = services.URL.v1("budgets", id, "subaccounts", "tree");
  return client.list<Model.SubAccountTreeNode>(url, query, options);
};

export const getBudgetActuals = async (
  id: number,
  query: Http.ListQuery = {},
  options: Http.RequestOptions = {}
): Promise<Http.ListResponse<Model.Actual>> => {
  const url = services.URL.v1("budgets", id, "actuals");
  return client.list<Model.Actual>(url, query, options);
};

export const bulkDeleteBudgetMarkups = async (
  id: number,
  ids: number[],
  options: Http.RequestOptions = {}
): Promise<Http.BulkModelResponse<Model.Budget>> => {
  const url = services.URL.v1("budgets", id, "bulk-delete-markups");
  return client.patch<Http.BulkModelResponse<Model.Budget>>(url, { ids }, options);
};

export const bulkUpdateBudgetAccounts = async (
  id: number,
  data: Http.BulkUpdatePayload<Http.AccountPayload>,
  options: Http.RequestOptions = {}
): Promise<Http.BulkModelResponse<Model.Budget>> => {
  const url = services.URL.v1("budgets", id, "bulk-update-accounts");
  return client.patch<Http.BulkModelResponse<Model.Budget>>(url, data, options);
};

export const bulkDeleteBudgetAccounts = async (
  id: number,
  ids: number[],
  options: Http.RequestOptions = {}
): Promise<Http.BulkModelResponse<Model.Budget>> => {
  const url = services.URL.v1("budgets", id, "bulk-delete-accounts");
  return client.patch<Http.BulkModelResponse<Model.Budget>>(url, { ids }, options);
};

export const bulkCreateBudgetAccounts = async (
  id: number,
  payload: Http.BulkCreatePayload<Http.AccountPayload>,
  options: Http.RequestOptions = {}
): Promise<Http.BulkCreateChildrenResponse<Model.Budget, Model.Account>> => {
  const url = services.URL.v1("budgets", id, "bulk-create-accounts");
  return client.patch<Http.BulkCreateChildrenResponse<Model.Budget, Model.Account>>(url, payload, options);
};

export const bulkUpdateBudgetActuals = async (
  id: number,
  data: Http.BulkUpdatePayload<Http.ActualPayload>,
  options: Http.RequestOptions = {}
): Promise<Http.BulkModelResponse<Model.Budget>> => {
  const url = services.URL.v1("budgets", id, "bulk-update-actuals");
  return client.patch<Http.BulkModelResponse<Model.Budget>>(url, data, options);
};

export const bulkDeleteBudgetActuals = async (
  id: number,
  ids: number[],
  options: Http.RequestOptions = {}
): Promise<Http.BulkModelResponse<Model.Budget>> => {
  const url = services.URL.v1("budgets", id, "bulk-delete-actuals");
  return client.patch<Http.BulkModelResponse<Model.Budget>>(url, { ids }, options);
};

export const bulkCreateBudgetActuals = async (
  id: number,
  payload: Http.BulkCreatePayload<Http.ActualPayload>,
  options: Http.RequestOptions = {}
): Promise<Http.BulkCreateChildrenResponse<Model.Budget, Model.Actual>> => {
  const url = services.URL.v1("budgets", id, "bulk-create-actuals");
  return client.patch<Http.BulkCreateChildrenResponse<Model.Budget, Model.Actual>>(url, payload, options);
};

export const bulkUpdateBudgetFringes = async (
  id: number,
  data: Http.BulkUpdatePayload<Http.FringePayload>,
  options: Http.RequestOptions = {}
): Promise<Http.BulkModelResponse<Model.Budget>> => {
  const url = services.URL.v1("budgets", id, "bulk-update-fringes");
  return client.patch<Http.BulkModelResponse<Model.Budget>>(url, data, options);
};

export const bulkDeleteBudgetFringes = async (
  id: number,
  ids: number[],
  options: Http.RequestOptions = {}
): Promise<Http.BulkModelResponse<Model.Budget>> => {
  const url = services.URL.v1("budgets", id, "bulk-delete-fringes");
  return client.patch<Http.BulkModelResponse<Model.Budget>>(url, { ids }, options);
};

export const bulkCreateBudgetFringes = async (
  id: number,
  payload: Http.BulkCreatePayload<Http.FringePayload>,
  options: Http.RequestOptions = {}
): Promise<Http.BulkCreateChildrenResponse<Model.Budget, Model.Fringe>> => {
  const url = services.URL.v1("budgets", id, "bulk-create-fringes");
  return client.patch<Http.BulkCreateChildrenResponse<Model.Budget, Model.Fringe>>(url, payload, options);
};
