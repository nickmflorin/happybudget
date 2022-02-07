import { redux } from "lib";

export const requestHeaderTemplatesAction = redux.actions.createAction<null>("budget.headertemplates.Request");
export const loadingHeaderTemplatesAction = redux.actions.createAction<boolean>("budget.headertemplates.Loading");
export const responseHeaderTemplatesAction = redux.actions.createAction<Http.ListResponse<Model.SimpleHeaderTemplate>>(
  "budget.headertemplates.Response"
);
export const addHeaderTemplateToStateAction = redux.actions.createAction<Model.SimpleHeaderTemplate>(
  "budget.headertemplates.AddToState"
);
export const removeHeaderTemplateFromStateAction = redux.actions.createAction<number>(
  "budget.headertemplates.RemoveFromState"
);

export const setLoadingHeaderTemplateDetailAction = redux.actions.createAction<boolean>(
  "budget.headertemplates.LoadingDetail"
);
export const loadHeaderTemplateAction = redux.actions.createAction<number>("budget.headertemplates.Load");
export const clearHeaderTemplateAction = redux.actions.createAction<null>("budget.headertemplates.Clear");
export const displayHeaderTemplateAction = redux.actions.createAction<Model.HeaderTemplate>(
  "budget.headertemplates.Display"
);
