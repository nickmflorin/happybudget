import { client } from "api";
import * as services from "./services";

type GetBudget = {
  <B extends Model.BaseBudget>(id: number, options?: Http.RequestOptions): Promise<B>;
};

export const getBudget = services.retrieveService((id: number) => ["budgets", id]) as GetBudget;

type UpdateBudget = {
  <
    B extends Model.BaseBudget,
    P extends Http.BudgetPayload | Http.TemplatePayload = B extends Model.Budget
      ? Http.BudgetPayload
      : Http.TemplatePayload
  >(
    id: number,
    p: Partial<P>,
    options?: Http.RequestOptions
  ): Promise<B>;
};

export const updateBudget = services.detailPatchService((id: number) => ["budgets", id]) as UpdateBudget;

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

export const duplicateBudget = async <B extends Model.BaseBudget>(
  id: number,
  options?: Http.RequestOptions
): Promise<B> => {
  const url = services.URL.v1("budgets", id, "duplicate");
  return client.post<B>(url, {}, options);
};

export const createBudgetPublicToken = services.detailPostService<Http.PublicTokenPayload, Model.PublicToken>(
  (id: number) => ["budgets", id, "public-token"]
);

export type CreateBudgetMarkup = {
  <B extends Model.BaseBudget>(id: number, payload: Http.MarkupPayload, options?: Http.RequestOptions): Promise<
    Http.ParentChildResponse<B, Model.Markup>
  >;
};

export const createBudgetMarkup = services.detailPostService((id: number) => [
  "budgets",
  id,
  "markups"
]) as CreateBudgetMarkup;

type BulkDeleteBudgetMarkups = {
  <B extends Model.BaseBudget>(id: number, payload: Http.BulkDeletePayload, options?: Http.RequestOptions): Promise<
    Http.ParentResponse<B>
  >;
};

export const bulkDeleteBudgetMarkups = services.detailBulkDeleteService((id: number) => [
  "budgets",
  id,
  "bulk-delete-markups"
]) as BulkDeleteBudgetMarkups;

type BulkUpdateBudgetChildren = {
  <B extends Model.BaseBudget>(
    id: number,
    payload: Http.BulkUpdatePayload<Http.AccountPayload>,
    options?: Http.RequestOptions
  ): Promise<Http.ParentChildListResponse<B, Model.Account>>;
};

export const bulkUpdateBudgetChildren = services.detailBulkUpdateService((id: number) => [
  "budgets",
  id,
  "bulk-update-children"
]) as BulkUpdateBudgetChildren;

type BulkDeleteBudgetChildren = {
  <B extends Model.BaseBudget>(id: number, payload: Http.BulkDeletePayload, options?: Http.RequestOptions): Promise<
    Http.ParentResponse<B>
  >;
};

export const bulkDeleteBudgetChildren = services.detailBulkDeleteService((id: number) => [
  "budgets",
  id,
  "bulk-delete-children"
]) as BulkDeleteBudgetChildren;

type BulkCreateBudgetChildren = {
  <B extends Model.BaseBudget>(
    id: number,
    payload: Http.BulkCreatePayload<Http.AccountPayload>,
    options?: Http.RequestOptions
  ): Promise<Http.ParentChildListResponse<B, Model.Account>>;
};

export const bulkCreateBudgetChildren = services.detailBulkCreateService((id: number) => [
  "budgets",
  id,
  "bulk-create-children"
]) as BulkCreateBudgetChildren;

export const bulkUpdateActuals = services.detailBulkUpdateService<
  Http.ActualPayload,
  Http.ParentChildListResponse<Model.Budget, Model.Actual>
>((id: number) => ["budgets", id, "bulk-update-actuals"]);

export const bulkDeleteActuals = services.detailBulkDeleteService<Http.ParentResponse<Model.Budget>>((id: number) => [
  "budgets",
  id,
  "bulk-delete-actuals"
]);

export const bulkCreateActuals = services.detailBulkCreateService<
  Http.ActualPayload,
  Http.ParentChildListResponse<Model.Budget, Model.Actual>
>((id: number) => ["budgets", id, "bulk-create-actuals"]);

type BulkUpdateFringes = {
  <B extends Model.BaseBudget>(
    id: number,
    payload: Http.BulkUpdatePayload<Http.FringePayload>,
    options?: Http.RequestOptions
  ): Promise<Http.ParentChildListResponse<B, Model.Fringe>>;
};

export const bulkUpdateFringes = services.detailBulkUpdateService((id: number) => [
  "budgets",
  id,
  "bulk-update-fringes"
]) as BulkUpdateFringes;

type BulkDeleteFringes = {
  <B extends Model.BaseBudget>(id: number, payload: Http.BulkDeletePayload, options?: Http.RequestOptions): Promise<
    Http.ParentResponse<B>
  >;
};

export const bulkDeleteFringes = services.detailBulkDeleteService((id: number) => [
  "budgets",
  id,
  "bulk-delete-fringes"
]) as BulkDeleteFringes;

type BulkCreateFringes = {
  <B extends Model.BaseBudget>(
    id: number,
    payload: Http.BulkCreatePayload<Http.FringePayload>,
    options?: Http.RequestOptions
  ): Promise<Http.ParentChildListResponse<B, Model.Fringe>>;
};

export const bulkCreateFringes = services.detailBulkUpdateService((id: number) => [
  "budgets",
  id,
  "bulk-create-fringes"
]) as BulkCreateFringes;
