import { simpleAction } from "store/actions";
import ActionType from "../ActionType";

export const requestHeaderTemplatesAction = simpleAction<null>(ActionType.Budget.HeaderTemplates.Request);
export const loadingHeaderTemplatesAction = simpleAction<boolean>(ActionType.Budget.HeaderTemplates.Loading);
export const responseHeaderTemplatesAction = simpleAction<Http.ListResponse<Model.SimpleHeaderTemplate>>(
  ActionType.Budget.HeaderTemplates.Response
);
export const addHeaderTemplateToStateAction = simpleAction<Model.HeaderTemplate>(
  ActionType.Budget.HeaderTemplates.AddToState
);
export const removeHeaderTemplateFromStateAction = simpleAction<number>(
  ActionType.Budget.HeaderTemplates.RemoveFromState
);

export const setLoadingHeaderTemplateDetailAction = simpleAction<boolean>(
  ActionType.Budget.HeaderTemplates.LoadingDetail
);
export const loadHeaderTemplateAction = simpleAction<number>(ActionType.Budget.HeaderTemplates.Load);
export const clearHeaderTemplateAction = simpleAction<null>(ActionType.Budget.HeaderTemplates.Clear);
export const displayHeaderTemplateAction = simpleAction<Model.HeaderTemplate>(
  ActionType.Budget.HeaderTemplates.Display
);
