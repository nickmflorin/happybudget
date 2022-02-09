import { client } from "api";
import * as services from "./services";

export const getBudget = async <M extends Model.BaseBudget>(
  id: number,
  options: Http.RequestOptions = {}
): Promise<M> => {
  const url = services.URL.v1("budgets", id);
  return client.retrieve<M>(url, options);
};

export const updateBudget = async <
  M extends Model.BaseBudget = Model.Budget,
  P extends Http.BudgetPayload | Http.TemplatePayload = M extends Model.Budget
    ? Http.BudgetPayload
    : Http.TemplatePayload
>(
  id: number,
  payload: Partial<P>,
  options: Http.RequestOptions = {}
): Promise<M> => {
  const url = services.URL.v1("budgets", id);
  return client.patch<M, P>(url, payload, options);
};

export const getBudgetPdf = services.retrieveService<Model.PdfBudget>((id: number) => ["budgets", id, "pdf"]);
export const getBudgets = services.listService<Model.SimpleBudget>(["budgets"]);
export const getTemplates = services.listService<Model.SimpleTemplate>(["templates"]);
export const getCommunityTemplates = services.listService<Model.SimpleTemplate>(["templates", "community"]);

export const getBudgetChildren = services.detailListService<Model.Account>((id: number) => ["budgets", id, "children"]);
export const getBudgetMarkups = services.detailListService<Model.Markup>((id: number) => ["budgets", id, "markups"]);
export const getBudgetGroups = services.detailListService<Model.Group>((id: number) => ["budgets", id, "groups"]);
export const getBudgetActualOwners = services.detailListService<Model.ActualOwner>((id: number) => [
  "budgets",
  id,
  "actual-owners"
]);
export const getFringes = services.detailListService<Model.Fringe>((id: number) => ["budgets", id, "fringes"]);
export const createActual = services.detailPostService<Http.ActualPayload, Model.Actual>((id: number) => [
  "budgets",
  id,
  "actuals"
]);
export const getActuals = services.detailListService<Model.Actual>((id: number) => ["budgets", id, "actuals"]);
export const deleteBudget = services.deleteService((id: number) => ["budgets", id]);

export const createBudget = services.postService<Http.BudgetPayload, Model.Budget>(["budgets"]);
export const createTemplate = services.postService<Http.TemplatePayload, Model.Template>(["templates"]);
export const createCommunityTemplate = services.postService<Http.TemplatePayload | FormData, Model.Template>([
  "templates",
  "community"
]);
export const createBudgetChild = services.detailPostService<Http.AccountPayload, Model.Account>((id: number) => [
  "budgets",
  id,
  "children"
]);

export const createBudgetGroup = services.detailPostService<Http.GroupPayload, Model.Group>((id: number) => [
  "budgets",
  id,
  "groups"
]);

export const createFringe = services.detailPostService<Http.FringePayload, Model.Fringe>((id: number) => [
  "budgets",
  id,
  "fringes"
]);

export const duplicateBudget = async <M extends Model.BaseBudget = Model.Budget>(
  id: number,
  options: Http.RequestOptions = {}
): Promise<M> => {
  const url = services.URL.v1("budgets", id, "duplicate");
  return client.post<M>(url, {}, options);
};

export const createBudgetMarkup = services.detailPostService<
  Http.MarkupPayload,
  Http.BudgetContextDetailResponse<Model.Markup>
>((id: number) => ["budgets", id, "markups"]);

export const bulkDeleteBudgetMarkups = async <M extends Model.BaseBudget = Model.Budget>(
  id: number,
  ids: number[],
  options: Http.RequestOptions = {}
): Promise<Http.BulkDeleteResponse<M>> => {
  const url = services.URL.v1("budgets", id, "bulk-delete-markups");
  return client.patch<Http.BulkDeleteResponse<M>>(url, { ids }, options);
};

export const bulkUpdateBudgetChildren = async <M extends Model.BaseBudget = Model.Budget>(
  id: number,
  data: Http.BulkUpdatePayload<Http.AccountPayload>,
  options: Http.RequestOptions = {}
): Promise<Http.BulkResponse<M, Model.Account>> => {
  const url = services.URL.v1("budgets", id, "bulk-update-children");
  return client.patch<Http.BulkResponse<M, Model.Account>>(url, data, options);
};

export const bulkDeleteBudgetChildren = async <M extends Model.BaseBudget = Model.Budget>(
  id: number,
  ids: number[],
  options: Http.RequestOptions = {}
): Promise<Http.BulkDeleteResponse<M>> => {
  const url = services.URL.v1("budgets", id, "bulk-delete-children");
  return client.patch<Http.BulkDeleteResponse<M>>(url, { ids }, options);
};

export const bulkCreateBudgetChildren = async <M extends Model.BaseBudget = Model.Budget>(
  id: number,
  payload: Http.BulkCreatePayload<Http.AccountPayload>,
  options: Http.RequestOptions = {}
): Promise<Http.BulkResponse<M, Model.Account>> => {
  const url = services.URL.v1("budgets", id, "bulk-create-children");
  return client.patch<Http.BulkResponse<M, Model.Account>>(url, payload, options);
};

export const bulkUpdateActuals = async (
  id: number,
  data: Http.BulkUpdatePayload<Http.ActualPayload>,
  options: Http.RequestOptions = {}
): Promise<Http.BulkResponse<Model.Budget, Model.Actual>> => {
  const url = services.URL.v1("budgets", id, "bulk-update-actuals");
  return client.patch<Http.BulkResponse<Model.Budget, Model.Actual>>(url, data, options);
};

export const bulkDeleteActuals = async (
  id: number,
  ids: number[],
  options: Http.RequestOptions = {}
): Promise<Http.BulkDeleteResponse<Model.Budget>> => {
  const url = services.URL.v1("budgets", id, "bulk-delete-actuals");
  return client.patch<Http.BulkDeleteResponse<Model.Budget>>(url, { ids }, options);
};

export const bulkCreateActuals = async (
  id: number,
  payload: Http.BulkCreatePayload<Http.ActualPayload>,
  options: Http.RequestOptions = {}
): Promise<Http.BulkResponse<Model.Budget, Model.Actual>> => {
  const url = services.URL.v1("budgets", id, "bulk-create-actuals");
  return client.patch<Http.BulkResponse<Model.Budget, Model.Actual>>(url, payload, options);
};

export const bulkUpdateFringes = async <M extends Model.BaseBudget = Model.Budget>(
  id: number,
  data: Http.BulkUpdatePayload<Http.FringePayload>,
  options: Http.RequestOptions = {}
): Promise<Http.BulkResponse<M, Model.Fringe>> => {
  const url = services.URL.v1("budgets", id, "bulk-update-fringes");
  return client.patch<Http.BulkResponse<M, Model.Fringe>>(url, data, options);
};

export const bulkDeleteFringes = async <M extends Model.BaseBudget = Model.Budget>(
  id: number,
  ids: number[],
  options: Http.RequestOptions = {}
): Promise<Http.BulkDeleteResponse<M>> => {
  const url = services.URL.v1("budgets", id, "bulk-delete-fringes");
  return client.patch<Http.BulkDeleteResponse<M>>(url, { ids }, options);
};

export const bulkCreateFringes = async <M extends Model.BaseBudget = Model.Budget>(
  id: number,
  payload: Http.BulkCreatePayload<Http.FringePayload>,
  options: Http.RequestOptions = {}
): Promise<Http.BulkResponse<M, Model.Fringe>> => {
  const url = services.URL.v1("budgets", id, "bulk-create-fringes");
  return client.patch<Http.BulkResponse<M, Model.Fringe>>(url, payload, options);
};
