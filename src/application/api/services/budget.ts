import { model } from "lib";

import { client } from "../client";
import * as types from "../types";

export const getBudget = client.createParameterizedRetrieveService<
  "/budgets/:id",
  model.UserBudget | model.Template
>("/budgets/:id");

/* TODO: This endpoint will eventually be refactored so that the budget and template payloads and
   response types are treated separately - but for now they are the same. */
export const updateBudget = client.createParameterizedPatchService<
  "/budgets/:id/",
  model.UserBudget | model.Template,
  Partial<types.BudgetPayload> | Partial<types.TemplatePayload>
>("/budgets/:id/");

export const deleteBudget =
  client.createParameterizedDeleteService<"/budgets/:id/">("/budgets/:id/");

export const createBudget = client.createPostService<model.UserBudget, types.BudgetPayload>(
  "/budgets/",
);

export const createTemplate = client.createPostService<model.Template, types.TemplatePayload>(
  "/templates/",
);

export const createCommunityTemplate = client.createPostService<
  model.Template,
  types.TemplatePayload | FormData
>("/templates/community/");

export const getBudgetPdf = client.createParameterizedRetrieveService<
  "/budgets/:id/pdf",
  model.PdfBudget
>("/budgets/:id/pdf");

export const getBudgets = client.createListService<model.SimpleBudget>("/budgets");

export const getArchivedBudgets = client.createListService<model.SimpleBudget>("/budgets/archived");

export const getCollaboratingBudgets =
  client.createListService<model.SimpleCollaboratingBudget>("/budgets/collaborating");

export const getTemplates = client.createListService<model.SimpleTemplate>("/templates");

export const getCommunityTemplates =
  client.createListService<model.SimpleTemplate>("/templates/community");

export const getBudgetChildren = client.createParameterizedListModelsService<
  "/budgets/:id/children",
  model.Account
>("/budgets/:id/children");

export const getBudgetSimpleChildren = client.createParameterizedListModelsService<
  "/budgets/:id/children",
  model.SimpleAccount
>("/budgets/:id/children", { query: { simple: true } });

export const getBudgetMarkups = client.createParameterizedListModelsService<
  "/budgets/:id/markups",
  model.Markup
>("/budgets/:id/markups");

export const getBudgetGroups = client.createParameterizedListModelsService<
  "/budgets/:id/groups",
  model.Group
>("/budgets/:id/groups");

export const getBudgetActualOwners = client.createParameterizedListModelsService<
  "/budgets/:id/actual-owners",
  model.ActualOwner
>("/budgets/:id/actual-owners");

export const getFringes = client.createParameterizedListModelsService<
  "/budgets/:id/fringes",
  model.Fringe
>("/budgets/:id/fringes");

export const getActuals = client.createParameterizedListModelsService<
  "/budgets/:id/actuals",
  model.Actual
>("/budgets/:id/actuals");

export const getCollaborators = client.createParameterizedListModelsService<
  "/budgets/:id/collaborators",
  model.Collaborator
>("/budgets/:id/collaborators");

export const createFringe = client.createParameterizedPostService<
  "/budgets/:id/fringes/",
  model.Fringe,
  types.FringePayload
>("/budgets/:id/fringes/");

export const createActual = client.createParameterizedPostService<
  "/budgets/:id/actuals/",
  model.Fringe,
  types.ActualPayload
>("/budgets/:id/actuals/");

export const createBudgetChild = client.createParameterizedPostService<
  "/budgets/:id/children/",
  model.Account,
  types.AccountPayload
>("/budgets/:id/children/");

export const createBudgetGroup = client.createParameterizedPostService<
  "/budgets/:id/groups/",
  model.Group,
  types.GroupPayload
>("/budgets/:id/groups/");

export const createCollaborator = client.createParameterizedPostService<
  "/budgets/:id/collaborators/",
  model.Collaborator,
  types.CollaboratorPayload
>("/budgets/:id/collaborators/");

export const duplicateBudget = client.createParameterizedPostService<
  "/budgets/:id/duplicate/",
  model.UserBudget | model.Template
>("/budgets/:id/duplicate/");

export const createBudgetPublicToken = client.createParameterizedPostService<
  "/budgets/:id/public-token/",
  model.PublicToken,
  types.PublicTokenPayload
>("/budgets/:id/public-token/");

export const createBudgetMarkup = client.createParameterizedPostService<
  "/budgets/:id/markups/",
  | types.ParentChildResponse<model.UserBudget, model.Markup>
  | types.ParentChildResponse<model.Template, model.Markup>
>("/budgets/:id/markups/");

export const bulkDeleteBudgetMarkups = client.createParameterizedPatchService<
  "/budgets/:id/bulk-delete-markups/",
  types.ParentResponse<model.UserBudget> | types.ParentResponse<model.Template>,
  types.BulkDeletePayload
>("/budgets/:id/bulk-delete-markups/");

export const bulkUpdateBudgetChildren = client.createParameterizedPatchService<
  "/budgets/:id/bulk-update-children/",
  | types.ParentChildListResponse<model.UserBudget, model.Account>
  | types.ParentChildListResponse<model.Template, model.Account>,
  types.BulkUpdatePayload<types.AccountPayload>
>("/budgets/:id/bulk-update-children/");

export const bulkDeleteBudgetChildren = client.createParameterizedPatchService<
  "/budgets/:id/bulk-delete-children/",
  types.ParentResponse<model.UserBudget> | types.ParentResponse<model.Template>,
  types.BulkDeletePayload
>("/budgets/:id/bulk-delete-children/");

export const bulkCreateBudgetChildren = client.createParameterizedPatchService<
  "/budgets/:id/bulk-create-children/",
  | types.ParentChildListResponse<model.UserBudget, model.Account>
  | types.ParentChildListResponse<model.Template, model.Account>,
  types.BulkCreatePayload<types.AccountPayload>
>("/budgets/:id/bulk-create-children/");

export const bulkUpdateActuals = client.createParameterizedPatchService<
  "/budgets/:id/bulk-update-actuals/",
  types.ParentChildListResponse<model.UserBudget, model.Actual>,
  types.BulkUpdatePayload<types.ActualPayload>
>("/budgets/:id/bulk-update-actuals/");

export const bulkDeleteActuals = client.createParameterizedPatchService<
  "/budgets/:id/bulk-delete-actuals/",
  types.ParentResponse<model.UserBudget>,
  types.BulkDeletePayload
>("/budgets/:id/bulk-delete-actuals/");

export const bulkImportActuals = client.createParameterizedPatchService<
  "/budgets/:id/bulk-import-actuals/",
  types.ParentChildListResponse<model.UserBudget, model.Actual>,
  types.BulkImportActualsPayload
>("/budgets/:id/bulk-import-actuals/");

export const bulkCreateActuals = client.createParameterizedPatchService<
  "/budgets/:id/bulk-create-actuals/",
  types.ParentChildListResponse<model.UserBudget, model.Actual>,
  types.BulkCreatePayload<types.ActualPayload>
>("/budgets/:id/bulk-create-actuals/");

export const bulkUpdateFringes = client.createParameterizedPatchService<
  "/budgets/:id/bulk-update-fringes/",
  | types.ParentChildListResponse<model.UserBudget, model.Fringe>
  | types.ParentChildListResponse<model.Template, model.Fringe>,
  types.BulkUpdatePayload<types.FringePayload>
>("/budgets/:id/bulk-update-fringes/");

export const bulkDeleteFringes = client.createParameterizedPatchService<
  "/budgets/:id/bulk-delete-fringes/",
  types.ParentResponse<model.UserBudget> | types.ParentResponse<model.Template>,
  types.BulkDeletePayload
>("/budgets/:id/bulk-delete-fringes/");

export const bulkCreateFringes = client.createParameterizedPatchService<
  "/budgets/:id/bulk-create-fringes/",
  | types.ParentChildListResponse<model.UserBudget, model.Fringe>
  | types.ParentChildListResponse<model.Template, model.Fringe>,
  types.BulkCreatePayload<types.FringePayload>
>("/budgets/:id/bulk-create-fringes/");
