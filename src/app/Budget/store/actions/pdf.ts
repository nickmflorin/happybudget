import { redux } from "lib";
import ActionType from "./ActionType";

export const requestHeaderTemplatesAction = redux.actions.createAction<null>(ActionType.HeaderTemplates.Request);
export const loadingHeaderTemplatesAction = redux.actions.createAction<boolean>(ActionType.HeaderTemplates.Loading);
export const responseHeaderTemplatesAction = redux.actions.createAction<Http.ListResponse<Model.SimpleHeaderTemplate>>(
  ActionType.HeaderTemplates.Response
);
export const addHeaderTemplateToStateAction = redux.actions.createAction<Model.SimpleHeaderTemplate>(
  ActionType.HeaderTemplates.AddToState
);
export const removeHeaderTemplateFromStateAction = redux.actions.createAction<number>(
  ActionType.HeaderTemplates.RemoveFromState
);

export const setLoadingHeaderTemplateDetailAction = redux.actions.createAction<boolean>(
  ActionType.HeaderTemplates.LoadingDetail
);
export const loadHeaderTemplateAction = redux.actions.createAction<number>(ActionType.HeaderTemplates.Load);
export const clearHeaderTemplateAction = redux.actions.createAction<null>(ActionType.HeaderTemplates.Clear);
export const displayHeaderTemplateAction = redux.actions.createAction<Model.HeaderTemplate>(
  ActionType.HeaderTemplates.Display
);
