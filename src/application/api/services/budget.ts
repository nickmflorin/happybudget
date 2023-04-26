import { budgeting, auth } from "lib/model";

import { client } from "../client";
import * as types from "../types";

export const getBudget = client.createParameterizedRetrieveService<
  "/budgets/:id",
  budgeting.UserBudget | budgeting.Template
>("/budgets/:id");

/* TODO: This endpoint will eventually be refactored so that the budget and template payloads and
   response types are treated separately - but for now they are the same. */
export const updateBudget = client.createParameterizedPatchService<
  "/budgets/:id/",
  budgeting.UserBudget | budgeting.Template,
  Partial<types.BudgetPayload> | Partial<types.TemplatePayload>
>("/budgets/:id/");

export const deleteBudget =
  client.createParameterizedDeleteService<"/budgets/:id/">("/budgets/:id/");

export const createBudget = client.createPostService<budgeting.UserBudget, types.BudgetPayload>(
  "/budgets/",
);

export const createTemplate = client.createPostService<budgeting.Template, types.TemplatePayload>(
  "/templates/",
);

export const createCommunityTemplate = client.createPostService<
  budgeting.Template,
  types.TemplatePayload | FormData
>("/templates/community/");

export const getBudgetPdf = client.createParameterizedRetrieveService<
  "/budgets/:id/pdf",
  budgeting.PdfBudget
>("/budgets/:id/pdf");

export const getBudgets = client.createListService<budgeting.SimpleBudget>("/budgets");

export const getArchivedBudgets =
  client.createListService<budgeting.SimpleBudget>("/budgets/archived");

export const getCollaboratingBudgets =
  client.createListService<budgeting.SimpleCollaboratingBudget>("/budgets/collaborating");

export const getTemplates = client.createListService<budgeting.SimpleTemplate>("/templates");

export const getCommunityTemplates =
  client.createListService<budgeting.SimpleTemplate>("/templates/community");

export const getBudgetChildren = client.createParameterizedListModelsService<
  "/budgets/:id/children",
  budgeting.Account
>("/budgets/:id/children");

export const getBudgetSimpleChildren = client.createParameterizedListModelsService<
  "/budgets/:id/children",
  budgeting.SimpleAccount
>("/budgets/:id/children", { query: { simple: true } });

export const getBudgetMarkups = client.createParameterizedListModelsService<
  "/budgets/:id/markups",
  budgeting.Markup
>("/budgets/:id/markups");

export const getBudgetGroups = client.createParameterizedListModelsService<
  "/budgets/:id/groups",
  budgeting.Group
>("/budgets/:id/groups");

export const getBudgetActualOwners = client.createParameterizedListModelsService<
  "/budgets/:id/actual-owners",
  budgeting.ActualOwner
>("/budgets/:id/actual-owners");

export const getFringes = client.createParameterizedListModelsService<
  "/budgets/:id/fringes",
  budgeting.Fringe
>("/budgets/:id/fringes");

export const getActuals = client.createParameterizedListModelsService<
  "/budgets/:id/actuals",
  budgeting.Actual
>("/budgets/:id/actuals");

export const getCollaborators = client.createParameterizedListModelsService<
  "/budgets/:id/collaborators",
  budgeting.Collaborator
>("/budgets/:id/collaborators");

export const createFringe = client.createParameterizedPostService<
  "/budgets/:id/fringes/",
  budgeting.Fringe,
  types.FringePayload
>("/budgets/:id/fringes/");

export const createActual = client.createParameterizedPostService<
  "/budgets/:id/actuals/",
  budgeting.Fringe,
  types.ActualPayload
>("/budgets/:id/actuals/");

export const createBudgetChild = client.createParameterizedPostService<
  "/budgets/:id/children/",
  budgeting.Account,
  types.AccountPayload
>("/budgets/:id/children/");

export const createBudgetGroup = client.createParameterizedPostService<
  "/budgets/:id/groups/",
  budgeting.Group,
  types.GroupPayload
>("/budgets/:id/groups/");

export const createCollaborator = client.createParameterizedPostService<
  "/budgets/:id/collaborators/",
  budgeting.Collaborator,
  types.CollaboratorPayload
>("/budgets/:id/collaborators/");

export const duplicateBudget = client.createParameterizedPostService<
  "/budgets/:id/duplicate/",
  budgeting.UserBudget | budgeting.Template
>("/budgets/:id/duplicate/");

export const createBudgetPublicToken = client.createParameterizedPostService<
  "/budgets/:id/public-token/",
  auth.PublicToken,
  types.PublicTokenPayload
>("/budgets/:id/public-token/");

export const createBudgetMarkup = client.createParameterizedPostService<
  "/budgets/:id/markups/",
  | types.ParentChildResponse<budgeting.UserBudget, budgeting.Markup>
  | types.ParentChildResponse<budgeting.Template, budgeting.Markup>
>("/budgets/:id/markups/");

export const bulkDeleteBudgetMarkups = client.createParameterizedPatchService<
  "/budgets/:id/bulk-delete-markups/",
  types.ParentResponse<budgeting.UserBudget> | types.ParentResponse<budgeting.Template>,
  types.BulkDeletePayload
>("/budgets/:id/bulk-delete-markups/");

export const bulkUpdateBudgetChildren = client.createParameterizedPatchService<
  "/budgets/:id/bulk-update-children/",
  | types.ParentChildListResponse<budgeting.UserBudget, budgeting.Account>
  | types.ParentChildListResponse<budgeting.Template, budgeting.Account>,
  types.BulkUpdatePayload<types.AccountPayload>
>("/budgets/:id/bulk-update-children/");

export const bulkDeleteBudgetChildren = client.createParameterizedPatchService<
  "/budgets/:id/bulk-delete-children/",
  types.ParentResponse<budgeting.UserBudget> | types.ParentResponse<budgeting.Template>,
  types.BulkDeletePayload
>("/budgets/:id/bulk-delete-children/");

export const bulkCreateBudgetChildren = client.createParameterizedPatchService<
  "/budgets/:id/bulk-create-children/",
  | types.ParentChildListResponse<budgeting.UserBudget, budgeting.Account>
  | types.ParentChildListResponse<budgeting.Template, budgeting.Account>,
  types.BulkCreatePayload<types.AccountPayload>
>("/budgets/:id/bulk-create-children/");

export const bulkUpdateActuals = client.createParameterizedPatchService<
  "/budgets/:id/bulk-update-actuals/",
  types.ParentChildListResponse<budgeting.UserBudget, budgeting.Actual>,
  types.BulkUpdatePayload<types.ActualPayload>
>("/budgets/:id/bulk-update-actuals/");

export const bulkDeleteActuals = client.createParameterizedPatchService<
  "/budgets/:id/bulk-delete-actuals/",
  types.ParentResponse<budgeting.UserBudget>,
  types.BulkDeletePayload
>("/budgets/:id/bulk-delete-actuals/");

export const bulkImportActuals = client.createParameterizedPatchService<
  "/budgets/:id/bulk-import-actuals/",
  types.ParentChildListResponse<budgeting.UserBudget, budgeting.Actual>,
  types.BulkImportActualsPayload
>("/budgets/:id/bulk-import-actuals/");

export const bulkCreateActuals = client.createParameterizedPatchService<
  "/budgets/:id/bulk-create-actuals/",
  types.ParentChildListResponse<budgeting.UserBudget, budgeting.Actual>,
  types.BulkCreatePayload<types.ActualPayload>
>("/budgets/:id/bulk-create-actuals/");

export const bulkUpdateFringes = client.createParameterizedPatchService<
  "/budgets/:id/bulk-update-fringes/",
  | types.ParentChildListResponse<budgeting.UserBudget, budgeting.Fringe>
  | types.ParentChildListResponse<budgeting.Template, budgeting.Fringe>,
  types.BulkUpdatePayload<types.FringePayload>
>("/budgets/:id/bulk-update-fringes/");

export const bulkDeleteFringes = client.createParameterizedPatchService<
  "/budgets/:id/bulk-delete-fringes/",
  types.ParentResponse<budgeting.UserBudget> | types.ParentResponse<budgeting.Template>,
  types.BulkDeletePayload
>("/budgets/:id/bulk-delete-fringes/");

export const bulkCreateFringes = client.createParameterizedPatchService<
  "/budgets/:id/bulk-create-fringes/",
  | types.ParentChildListResponse<budgeting.UserBudget, budgeting.Fringe>
  | types.ParentChildListResponse<budgeting.Template, budgeting.Fringe>,
  types.BulkCreatePayload<types.FringePayload>
>("/budgets/:id/bulk-create-fringes/");
