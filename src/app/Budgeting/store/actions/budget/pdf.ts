import { redux } from "lib";
import ActionType from "../ActionType";

export const requestHeaderTemplatesAction = redux.actions.simpleAction<null>(ActionType.Budget.HeaderTemplates.Request);
export const loadingHeaderTemplatesAction = redux.actions.simpleAction<boolean>(
  ActionType.Budget.HeaderTemplates.Loading
);
export const responseHeaderTemplatesAction = redux.actions.simpleAction<Http.ListResponse<Model.SimpleHeaderTemplate>>(
  ActionType.Budget.HeaderTemplates.Response
);
export const addHeaderTemplateToStateAction = redux.actions.simpleAction<Model.HeaderTemplate>(
  ActionType.Budget.HeaderTemplates.AddToState
);
export const removeHeaderTemplateFromStateAction = redux.actions.simpleAction<number>(
  ActionType.Budget.HeaderTemplates.RemoveFromState
);

export const setLoadingHeaderTemplateDetailAction = redux.actions.simpleAction<boolean>(
  ActionType.Budget.HeaderTemplates.LoadingDetail
);
export const loadHeaderTemplateAction = redux.actions.simpleAction<number>(ActionType.Budget.HeaderTemplates.Load);
export const clearHeaderTemplateAction = redux.actions.simpleAction<null>(ActionType.Budget.HeaderTemplates.Clear);
export const displayHeaderTemplateAction = redux.actions.simpleAction<Model.HeaderTemplate>(
  ActionType.Budget.HeaderTemplates.Display
);
