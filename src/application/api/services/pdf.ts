import { model } from "lib";

import { client } from "../client";
import * as types from "../types";

export const getHeaderTemplates =
  client.createListModelsService<model.SimpleHeaderTemplate>("/pdf/header-templates");

export const deleteHeaderTemplate =
  client.createParameterizedDeleteService<"/pdf/header-templates/:id/">(
    "/pdf/header-templates/:id/",
  );
export const updateHeaderTemplate = client.createParameterizedPatchService<
  "/pdf/header-templates/:id/",
  model.HeaderTemplate,
  types.HeaderTemplatePayload
>("/pdf/header-templates/:id/");

export const getHeaderTemplate = client.createParameterizedRetrieveService<
  "/pdf/header-templates/:id/",
  model.HeaderTemplate
>("/pdf/header-templates/:id/");

export const createHeaderTemplate = client.createPostService<
  model.SimpleHeaderTemplate,
  types.HeaderTemplatePayload
>("/pdf/header-templates/");
