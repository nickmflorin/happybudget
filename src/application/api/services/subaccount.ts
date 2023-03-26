import * as services from "./services";

export const getSubAccount = services.retrieveService<Model.SubAccount>((id: number) => [
  "subaccounts",
  id,
]);
export const getSubAccountMarkups = services.detailListService<Model.Markup>((id: number) => [
  "subaccounts",
  id,
  "markups",
]);
export const getSubAccountGroups = services.detailListService<Model.Group>((id: number) => [
  "subaccounts",
  id,
  "groups",
]);
export const deleteSubAccount = services.deleteService((id: number) => ["subaccounts", id]);
export const updateSubAccount = services.detailPatchService<
  Partial<Http.SubAccountPayload>,
  Model.SubAccount
>((id: number) => ["subaccounts", id]);
export const createSubAccountChild = services.detailPostService<
  Http.SubAccountPayload,
  Model.SubAccount
>((id: number) => ["subaccounts", id, "children"]);

export const createSubAccountGroup = services.detailPostService<Http.GroupPayload, Model.Group>(
  (id: number) => ["subaccounts", id, "groups"],
);

export type CreateSubAccountMarkup = {
  <B extends Model.BaseBudget, P extends Model.Account | Model.SubAccount>(
    id: number,
    payload: Http.MarkupPayload,
    options?: Http.RequestOptions,
  ): Promise<Http.AncestryResponse<B, P, Model.Markup>>;
};

export const createSubAccountMarkup = services.detailPostService((id: number) => [
  "subaccounts",
  id,
  "markups",
]) as CreateSubAccountMarkup;

type GetSubAccountChildren = {
  <M extends Model.SubAccount | Model.SimpleSubAccount = Model.SubAccount>(
    id: number,
    query?: Http.ListQuery,
    options?: Http.RequestOptions,
  ): Promise<Http.ListResponse<M>>;
};

export const getSubAccountChildren = services.detailListService((id: number) => [
  "subaccounts",
  id,
  "children",
]) as GetSubAccountChildren;

export const getSubAccountUnits = services.listService<Model.Tag>(["subaccounts", "units"]);

export const getSubAccountAttachments = services.detailListService<Model.Attachment>(
  (id: number) => ["subaccounts", id, "attachments"],
);
export const deleteSubAccountAttachment = services.detailDeleteService(
  (id: number, objId: number) => ["subaccounts", objId, "attachments", id],
);
export const uploadSubAccountAttachment = services.detailPostService<
  FormData,
  { data: Model.Attachment[] }
>((id: number) => ["subaccounts", id, "attachments"]);

type BulkUpdateSubAccountChildren = {
  <B extends Model.BaseBudget, P extends Model.Account | Model.SubAccount>(
    id: number,
    payload: Http.BulkUpdatePayload<Http.SubAccountPayload>,
    options?: Http.RequestOptions,
  ): Promise<Http.AncestryListResponse<B, P, Model.SubAccount>>;
};

export const bulkUpdateSubAccountChildren = services.detailBulkUpdateService((id: number) => [
  "subaccounts",
  id,
  "bulk-update-children",
]) as BulkUpdateSubAccountChildren;

type BulkDeleteSubAccountChildren = {
  <B extends Model.BaseBudget, P extends Model.Account | Model.SubAccount>(
    id: number,
    payload: Http.BulkDeletePayload,
    options?: Http.RequestOptions,
  ): Promise<Http.AncestryListResponse<B, P, Model.SubAccount>>;
};

export const bulkDeleteSubAccountChildren = services.detailBulkDeleteService((id: number) => [
  "subaccounts",
  id,
  "bulk-delete-children",
]) as BulkDeleteSubAccountChildren;

type BulkDeleteSubAccountMarkups = {
  <B extends Model.BaseBudget, P extends Model.Account | Model.SubAccount>(
    id: number,
    payload: Http.BulkDeletePayload,
    options?: Http.RequestOptions,
  ): Promise<Http.ParentsResponse<B, P>>;
};

export const bulkDeleteSubAccountMarkups = services.detailBulkDeleteService((id: number) => [
  "subaccounts",
  id,
  "bulk-delete-markups",
]) as BulkDeleteSubAccountMarkups;

type BulkCreateSubAccountChildren = {
  <B extends Model.BaseBudget, P extends Model.Account | Model.SubAccount>(
    id: number,
    payload: Http.BulkCreatePayload<Http.SubAccountPayload>,
    options?: Http.RequestOptions,
  ): Promise<Http.AncestryListResponse<B, P, Model.SubAccount>>;
};

export const bulkCreateSubAccountChildren = services.detailBulkCreateService((id: number) => [
  "subaccounts",
  id,
  "bulk-create-children",
]) as BulkCreateSubAccountChildren;
