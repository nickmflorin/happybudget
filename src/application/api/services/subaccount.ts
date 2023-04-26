import { attachment, budgeting } from "lib/model";

import { client } from "../client";
import * as types from "../types";

export const getSubAccount = client.createParameterizedRetrieveService<
  "/subaccounts/:id",
  budgeting.Account
>("/subaccounts/:id");

export const getSubAccountMarkups = client.createParameterizedListModelsService<
  "/subaccounts/:id/markups",
  budgeting.Markup
>("/subaccounts/:id/markups");

export const getSubAccountGroups = client.createParameterizedListModelsService<
  "/subaccounts/:id/groups",
  budgeting.Group
>("/subaccounts/:id/groups");

export const deleteSubAccount = client.createParameterizedDeleteService<"/subaccounts/:id/", never>(
  "/subaccounts/:id/",
);

export const updateSubAccount = client.createParameterizedPatchService<
  "/subaccounts/:id/",
  budgeting.SubAccount,
  Partial<types.SubAccountPayload>
>("/subaccounts/:id/");

export const createSubAccountChild = client.createParameterizedPostService<
  "/subaccounts/:id/children/",
  budgeting.SubAccount,
  Partial<types.SubAccountPayload>
>("/subaccounts/:id/children/");

export const createSubAccountMarkup = client.createParameterizedPostService<
  "/subaccounts/:id/markups/",
  types.AncestryResponse<
    budgeting.UserBudget | budgeting.Template,
    budgeting.SubAccount,
    budgeting.Markup
  >,
  Partial<types.MarkupPayload>
>("/subaccounts/:id/markups/");

export const createSubAccountGroup = client.createParameterizedPostService<
  "/subaccounts/:id/groups/",
  budgeting.Group,
  types.GroupPayload
>("/subaccounts/:id/groups/");

export const getSubAccountChildren = client.createParameterizedListModelsService<
  "/subaccounts/:id/children/",
  budgeting.SubAccount
>("/subaccounts/:id/children/");

export const getSubAccountSimpleChildren = client.createParameterizedListModelsService<
  "/subaccounts/:id/children/",
  budgeting.SubAccount
>("/subaccounts/:id/children/", { query: { simple: true } });

export const bulkUpdateSubAccountChildren = client.createParameterizedPatchService<
  "/subaccounts/:id/bulk-update-children/",
  types.ApiSuccessResponse<
    types.AncestryListResponse<
      budgeting.UserBudget | budgeting.Template,
      budgeting.SubAccount,
      budgeting.SubAccount
    >
  >,
  types.BulkUpdatePayload<types.SubAccountPayload>
>("/subaccounts/:id/bulk-update-children/");

export const bulkDeleteSubAccountChildren = client.createParameterizedPatchService<
  "/subaccounts/:id/bulk-delete-children/",
  types.ApiSuccessResponse<
    types.AncestryListResponse<
      budgeting.UserBudget | budgeting.Template,
      budgeting.SubAccount,
      budgeting.SubAccount
    >
  >,
  types.BulkDeletePayload
>("/subaccounts/:id/bulk-delete-children/");

export const bulkCreateSubAccountChildren = client.createParameterizedPatchService<
  "/subaccounts/:id/bulk-create-children/",
  types.ApiSuccessResponse<
    types.AncestryListResponse<
      budgeting.UserBudget | budgeting.Template,
      budgeting.SubAccount,
      budgeting.SubAccount
    >
  >,
  types.BulkCreatePayload<types.SubAccountPayload>
>("/subaccounts/:id/bulk-create-children/");

export const bulkDeleteSubAccountMarkups = client.createParameterizedPatchService<
  "/subaccounts/:id/bulk-delete-markups/",
  types.ApiSuccessResponse<
    types.ParentsResponse<budgeting.UserBudget | budgeting.Template, budgeting.Account>
  >,
  types.BulkDeletePayload
>("/subaccounts/:id/bulk-delete-markups/");

export const getSubAccountUnits =
  client.createListModelsService<budgeting.SubAccountUnit>("/subaccounts/units");

export const getSubAccountAttachments = client.createParameterizedListModelsService<
  "/subaccounts/:id/attachments",
  attachment.Attachment
>("/subaccounts/:id/attachments");

export const deleteSubAccountAttachment = client.createParameterizedDeleteService<
  "/subaccounts/:id/attachments/:attachmentId/",
  never
>("/subaccounts/:id/attachments/:attachmentId/");

export const uploadSubAccountAttachment = client.createParameterizedUploadService<
  "/subaccounts/:id/attachments/",
  { data: attachment.Attachment[] }
>("/subaccounts/:id/attachments/");
