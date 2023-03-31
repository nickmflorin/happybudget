import { model } from "lib";

import { client } from "../client";
import * as types from "../types";

export const getAccount = client.createParameterizedRetrieveService<"/accounts/:id", model.Account>(
  "/accounts/:id",
);

export const getAccountMarkups = client.createParameterizedListModelsService<
  "/accounts/:id/markups",
  model.Markup
>("/accounts/:id/markups");

export const getAccountGroups = client.createParameterizedListService<
  "/accounts/:id/groups",
  model.Group
>("/accounts/:id/groups");

export const deleteAccount = client.createParameterizedDeleteService<"/accounts/:id/", never>(
  "/accounts/:id/",
);

export const updateAccount = client.createParameterizedPatchService<
  "/accounts/:id/",
  model.Account,
  Partial<types.AccountPayload>
>("/accounts/:id/");

export const createAccountChild = client.createParameterizedPostService<
  "/accounts/:id/children/",
  model.SubAccount,
  Partial<types.SubAccountPayload>
>("/accounts/:id/children/");

export const createAccountMarkup = client.createParameterizedPostService<
  "/accounts/:id/markups/",
  types.AncestryResponse<model.Budget | model.Template, model.Account, model.Markup>,
  Partial<types.MarkupPayload>
>("/accounts/:id/markups/");

export const createAccountGroup = client.createParameterizedPostService<
  "/accounts/:id/groups/",
  model.Group,
  types.GroupPayload
>("/accounts/:id/groups/");

export const getAccountChildren = client.createParameterizedListModelsService<
  "/accounts/:id/children/",
  model.SubAccount
>("/accounts/:id/children/");

export const getAccountSimpleChildren = client.createParameterizedListModelsService<
  "/accounts/:id/children/",
  model.SimpleSubAccount
>("/accounts/:id/children/", { query: { simple: true } });

export const bulkUpdateAccountChildren = client.createParameterizedPatchService<
  "/accounts/:id/bulk-update-children/",
  types.ApiSuccessResponse<
    types.AncestryListResponse<model.Budget | model.Template, model.Account, model.SubAccount>
  >,
  types.BulkUpdatePayload<types.AccountPayload>
>("/accounts/:id/bulk-update-children/");

export const bulkDeleteAccountChildren = client.createParameterizedPatchService<
  "/accounts/:id/bulk-delete-children/",
  types.ApiSuccessResponse<
    types.AncestryListResponse<model.Budget | model.Template, model.Account, model.SubAccount>
  >,
  types.BulkDeletePayload
>("/accounts/:id/bulk-delete-children/");

export const bulkCreateAccountChildren = client.createParameterizedPatchService<
  "/accounts/:id/bulk-create-children/",
  types.ApiSuccessResponse<
    types.AncestryListResponse<model.Budget | model.Template, model.Account, model.SubAccount>
  >,
  types.BulkCreatePayload<types.AccountPayload>
>("/accounts/:id/bulk-create-children/");

export const bulkDeleteAccountMarkups = client.createParameterizedPatchService<
  "/accounts/:id/bulk-delete-markups/",
  types.ApiSuccessResponse<types.ParentsResponse<model.Budget | model.Template, model.Account>>,
  types.BulkDeletePayload
>("/accounts/:id/bulk-delete-markups/");
