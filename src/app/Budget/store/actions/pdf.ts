import { createAction } from "@reduxjs/toolkit";
import ActionType from "./ActionType";

export const requestHeaderTemplatesAction = createAction<null>(ActionType.HeaderTemplates.Request);
export const loadingHeaderTemplatesAction = createAction<boolean>(ActionType.HeaderTemplates.Loading);
export const responseHeaderTemplatesAction = createAction<Http.ListResponse<Model.SimpleHeaderTemplate>>(
  ActionType.HeaderTemplates.Response
);
export const addHeaderTemplateToStateAction = createAction<Model.SimpleHeaderTemplate>(
  ActionType.HeaderTemplates.AddToState
);
export const removeHeaderTemplateFromStateAction = createAction<ID>(ActionType.HeaderTemplates.RemoveFromState);

export const setLoadingHeaderTemplateDetailAction = createAction<boolean>(ActionType.HeaderTemplates.LoadingDetail);
export const loadHeaderTemplateAction = createAction<ID>(ActionType.HeaderTemplates.Load);
export const clearHeaderTemplateAction = createAction<null>(ActionType.HeaderTemplates.Clear);
export const displayHeaderTemplateAction = createAction<Model.HeaderTemplate>(ActionType.HeaderTemplates.Display);
