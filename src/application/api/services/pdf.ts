import { budgeting } from "lib/model";

import { client } from "../client";
import * as types from "../types";

export const getHeaderTemplates =
  client.createListModelsService<budgeting.SimpleHeaderTemplate>("/pdf/header-templates");

export const deleteHeaderTemplate =
  client.createParameterizedDeleteService<"/pdf/header-templates/:id/">(
    "/pdf/header-templates/:id/",
  );
export const updateHeaderTemplate = client.createParameterizedPatchService<
  "/pdf/header-templates/:id/",
  budgeting.HeaderTemplate,
  types.HeaderTemplatePayload
>("/pdf/header-templates/:id/");

export const getHeaderTemplate = client.createParameterizedRetrieveService<
  "/pdf/header-templates/:id/",
  budgeting.HeaderTemplate
>("/pdf/header-templates/:id/");

export const createHeaderTemplate = client.createPostService<
  budgeting.SimpleHeaderTemplate,
  types.HeaderTemplatePayload
>("/pdf/header-templates/");
