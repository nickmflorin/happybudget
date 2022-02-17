import * as services from "./services";

export const getHeaderTemplates = services.listService<Model.SimpleHeaderTemplate>(["pdf", "header-templates"]);

export const deleteHeaderTemplate = services.deleteService((id: number) => ["pdf", "header-templates", id]);
export const updateHeaderTemplate = services.detailPatchService<
  Partial<Http.HeaderTemplatePayload>,
  Model.HeaderTemplate
>((id: number) => ["pdf", "header-templates", id]);
export const getHeaderTemplate = services.retrieveService<Model.HeaderTemplate>((id: number) => [
  "pdf",
  "header-templates",
  id
]);

export const createHeaderTemplate = services.postService<Http.HeaderTemplatePayload, Model.HeaderTemplate>([
  "pdf",
  "header-templates"
]);
