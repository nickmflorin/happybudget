import { budgeting } from "lib/model";

import { client } from "../client";
import * as types from "../types";

export const getAccount = client.createParameterizedRetrieveService<
  "/accounts/:id",
  budgeting.Account
>("/accounts/:id");

export const getAccountMarkups = client.createParameterizedListModelsService<
  "/accounts/:id/markups",
  budgeting.Markup
>("/accounts/:id/markups");

export const getAccountGroups = client.createParameterizedListService<
  "/accounts/:id/groups",
  budgeting.Group
>("/accounts/:id/groups");

export const deleteAccount = client.createParameterizedDeleteService<"/accounts/:id/", never>(
  "/accounts/:id/",
);

export const updateAccount = client.createParameterizedPatchService<
  "/accounts/:id/",
  budgeting.Account,
  Partial<types.AccountPayload>
>("/accounts/:id/");

export const createAccountChild = client.createParameterizedPostService<
  "/accounts/:id/children/",
  budgeting.SubAccount,
  Partial<types.SubAccountPayload>
>("/accounts/:id/children/");

export const createAccountMarkup = client.createParameterizedPostService<
  "/accounts/:id/markups/",
  types.AncestryResponse<
    budgeting.UserBudget | budgeting.Template,
    budgeting.Account,
    budgeting.Markup
  >,
  Partial<types.MarkupPayload>
>("/accounts/:id/markups/");

export const createAccountGroup = client.createParameterizedPostService<
  "/accounts/:id/groups/",
  budgeting.Group,
  types.GroupPayload
>("/accounts/:id/groups/");

export const getAccountChildren = client.createParameterizedListModelsService<
  "/accounts/:id/children/",
  budgeting.SubAccount
>("/accounts/:id/children/");

export const getAccountSimpleChildren = client.createParameterizedListModelsService<
  "/accounts/:id/children/",
  budgeting.SimpleSubAccount
>("/accounts/:id/children/", { query: { simple: true } });

export const bulkUpdateAccountChildren = client.createParameterizedPatchService<
  "/accounts/:id/bulk-update-children/",
  types.ApiSuccessResponse<
    types.AncestryListResponse<
      budgeting.UserBudget | budgeting.Template,
      budgeting.Account,
      budgeting.SubAccount
    >
  >,
  types.BulkUpdatePayload<types.AccountPayload>
>("/accounts/:id/bulk-update-children/");

export const bulkDeleteAccountChildren = client.createParameterizedPatchService<
  "/accounts/:id/bulk-delete-children/",
  types.ApiSuccessResponse<
    types.AncestryListResponse<
      budgeting.UserBudget | budgeting.Template,
      budgeting.Account,
      budgeting.SubAccount
    >
  >,
  types.BulkDeletePayload
>("/accounts/:id/bulk-delete-children/");

export const bulkCreateAccountChildren = client.createParameterizedPatchService<
  "/accounts/:id/bulk-create-children/",
  types.ApiSuccessResponse<
    types.AncestryListResponse<
      budgeting.UserBudget | budgeting.Template,
      budgeting.Account,
      budgeting.SubAccount
    >
  >,
  types.BulkCreatePayload<types.AccountPayload>
>("/accounts/:id/bulk-create-children/");

export const bulkDeleteAccountMarkups = client.createParameterizedPatchService<
  "/accounts/:id/bulk-delete-markups/",
  types.ApiSuccessResponse<
    types.ParentsResponse<budgeting.UserBudget | budgeting.Template, budgeting.Account>
  >,
  types.BulkDeletePayload
>("/accounts/:id/bulk-delete-markups/");
