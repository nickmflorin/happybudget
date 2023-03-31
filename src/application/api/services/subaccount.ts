import { model } from "lib";

import { client } from "../client";
import * as types from "../types";

export const getSubAccount = client.createParameterizedRetrieveService<
  "/subaccounts/:id",
  model.Account
>("/subaccounts/:id");

export const getSubAccountMarkups = client.createParameterizedListModelsService<
  "/subaccounts/:id/markups",
  model.Markup
>("/subaccounts/:id/markups");

export const getSubAccountGroups = client.createParameterizedListModelsService<
  "/subaccounts/:id/groups",
  model.Group
>("/subaccounts/:id/groups");

export const deleteSubAccount = client.createParameterizedDeleteService<"/subaccounts/:id/", never>(
  "/subaccounts/:id/",
);

export const updateSubAccount = client.createParameterizedPatchService<
  "/subaccounts/:id/",
  model.SubAccount,
  Partial<types.SubAccountPayload>
>("/subaccounts/:id/");

export const createSubAccountChild = client.createParameterizedPostService<
  "/subaccounts/:id/children/",
  model.SubAccount,
  Partial<types.SubAccountPayload>
>("/subaccounts/:id/children/");

export const createSubAccountMarkup = client.createParameterizedPostService<
  "/subaccounts/:id/markups/",
  types.AncestryResponse<model.Budget | model.Template, model.SubAccount, model.Markup>,
  Partial<types.MarkupPayload>
>("/subaccounts/:id/markups/");

export const createSubAccountGroup = client.createParameterizedPostService<
  "/subaccounts/:id/groups/",
  model.Group,
  types.GroupPayload
>("/subaccounts/:id/groups/");

export const getSubAccountChildren = client.createParameterizedListModelsService<
  "/subaccounts/:id/children/",
  model.SubAccount
>("/subaccounts/:id/children/");

export const getSubAccountSimpleChildren = client.createParameterizedListModelsService<
  "/subaccounts/:id/children/",
  model.SubAccount
>("/subaccounts/:id/children/", { query: { simple: true } });

export const bulkUpdateSubAccountChildren = client.createParameterizedPatchService<
  "/subaccounts/:id/bulk-update-children/",
  types.ApiSuccessResponse<
    types.AncestryListResponse<model.Budget | model.Template, model.SubAccount, model.SubAccount>
  >,
  types.BulkUpdatePayload<types.SubAccountPayload>
>("/subaccounts/:id/bulk-update-children/");

export const bulkDeleteSubAccountChildren = client.createParameterizedPatchService<
  "/subaccounts/:id/bulk-delete-children/",
  types.ApiSuccessResponse<
    types.AncestryListResponse<model.Budget | model.Template, model.SubAccount, model.SubAccount>
  >,
  types.BulkDeletePayload
>("/subaccounts/:id/bulk-delete-children/");

export const bulkCreateSubAccountChildren = client.createParameterizedPatchService<
  "/subaccounts/:id/bulk-create-children/",
  types.ApiSuccessResponse<
    types.AncestryListResponse<model.Budget | model.Template, model.SubAccount, model.SubAccount>
  >,
  types.BulkCreatePayload<types.SubAccountPayload>
>("/subaccounts/:id/bulk-create-children/");

export const bulkDeleteSubAccountMarkups = client.createParameterizedPatchService<
  "/subaccounts/:id/bulk-delete-markups/",
  types.ApiSuccessResponse<types.ParentsResponse<model.Budget | model.Template, model.Account>>,
  types.BulkDeletePayload
>("/subaccounts/:id/bulk-delete-markups/");

export const getSubAccountUnits = client.createListModelsService<model.Tag>("/subaccounts/units");

export const getSubAccountAttachments = client.createParameterizedListModelsService<
  "/subaccounts/:id/attachments",
  model.Attachment
>("/subaccounts/:id/attachments");

export const deleteSubAccountAttachment = client.createParameterizedDeleteService<
  "/subaccounts/:id/attachments/:attachmentId/",
  never
>("/subaccounts/:id/attachments/:attachmentId/");

export const uploadSubAccountAttachment = client.createParameterizedUploadService<
  "/subaccounts/:id/attachments/",
  { data: model.Attachment[] }
>("/subaccounts/:id/attachments/");
