import * as services from "./services";

export const getAccount = services.retrieveService<Model.Account>((id: number) => ["accounts", id]);
export const getAccountMarkups = services.detailListService<Model.Markup>((id: number) => ["accounts", id, "markups"]);
export const getAccountGroups = services.detailListService<Model.Group>((id: number) => ["accounts", id, "groups"]);
export const deleteAccount = services.deleteService((id: number) => ["accounts", id]);
export const updateAccount = services.detailPatchService<Partial<Http.AccountPayload>, Model.Account>((id: number) => [
  "accounts",
  id
]);
export const createAccountChild = services.detailPostService<Http.SubAccountPayload, Model.SubAccount>((id: number) => [
  "accounts",
  id,
  "children"
]);

export type CreateAccountMarkup = {
  <B extends Model.BaseBudget>(id: number, payload: Http.MarkupPayload, options?: Http.RequestOptions): Promise<
    Http.AncestryResponse<B, Model.Account, Model.Markup>
  >;
};

export const createAccountMarkup = services.detailPostService((id: number) => [
  "accounts",
  id,
  "markups"
]) as CreateAccountMarkup;

export const createAccountGroup = services.detailPostService<Http.GroupPayload, Model.Group>((id: number) => [
  "accounts",
  id,
  "groups"
]);

type GetAccountChildren = {
  <M extends Model.SubAccount | Model.SimpleSubAccount = Model.SubAccount>(
    id: number,
    query?: Http.ListQuery,
    options?: Http.RequestOptions
  ): Promise<Http.ListResponse<M>>;
};

export const getAccountChildren = services.detailListService((id: number) => [
  "accounts",
  id,
  "children"
]) as GetAccountChildren;

type BulkUpdateAccountChildren = {
  <B extends Model.BaseBudget>(
    id: number,
    payload: Http.BulkUpdatePayload<Http.AccountPayload>,
    options?: Http.RequestOptions
  ): Promise<Http.AncestryListResponse<B, Model.Account, Model.SubAccount>>;
};

export const bulkUpdateAccountChildren = services.detailBulkUpdateService((id: number) => [
  "accounts",
  id,
  "bulk-update-children"
]) as BulkUpdateAccountChildren;

type BulkDeleteAccountChildren = {
  <B extends Model.BaseBudget>(id: number, payload: Http.BulkDeletePayload, options?: Http.RequestOptions): Promise<
    Http.AncestryListResponse<B, Model.Account, Model.SubAccount>
  >;
};

export const bulkDeleteAccountChildren = services.detailBulkDeleteService((id: number) => [
  "accounts",
  id,
  "bulk-delete-children"
]) as BulkDeleteAccountChildren;

type BulkCreateAccountChildren = {
  <B extends Model.BaseBudget>(
    id: number,
    payload: Http.BulkCreatePayload<Http.AccountPayload>,
    options?: Http.RequestOptions
  ): Promise<Http.AncestryListResponse<B, Model.Account, Model.SubAccount>>;
};

export const bulkCreateAccountChildren = services.detailBulkCreateService((id: number) => [
  "accounts",
  id,
  "bulk-create-children"
]) as BulkCreateAccountChildren;

type BulkDeleteAccountMarkups = {
  <B extends Model.BaseBudget>(id: number, payload: Http.BulkDeletePayload, options?: Http.RequestOptions): Promise<
    Http.ParentsResponse<B, Model.Account>
  >;
};

export const bulkDeleteAccountMarkups = services.detailBulkDeleteService((id: number) => [
  "accounts",
  id,
  "bulk-delete-markups"
]) as BulkDeleteAccountMarkups;
