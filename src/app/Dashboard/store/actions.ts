import { redux } from "lib";

export const ActionType = {
  Budgets: {
    Loading: "dashboard.budgets.Loading",
    Response: "dashboard.budgets.Response",
    Request: "dashboard.budgets.Request",
    SetSearch: "dashboard.budgets.SetSearch",
    UpdateInState: "dashboard.budgets.UpdateInState",
    RemoveFromState: "dashboard.budgets.RemoveFromState",
    AddToState: "dashboard.budgets.AddToState"
  },
  Templates: {
    Loading: "dashboard.templates.Loading",
    Response: "dashboard.templates.Response",
    Request: "dashboard.templates.Request",
    SetSearch: "dashboard.templates.SetSearch",
    UpdateInState: "dashboard.templates.UpdateInState",
    RemoveFromState: "dashboard.templates.RemoveFromState",
    AddToState: "dashboard.templates.AddToState"
  },
  Community: {
    Loading: "dashboard.community.Loading",
    Response: "dashboard.community.Response",
    Request: "dashboard.community.Request",
    SetSearch: "dashboard.community.SetSearch",
    UpdateInState: "dashboard.community.UpdateInState",
    RemoveFromState: "dashboard.community.RemoveFromState",
    AddToState: "dashboard.community.AddToState"
  }
};

export const requestBudgetsAction = redux.actions.simpleAction<null>(ActionType.Budgets.Request);
export const loadingBudgetsAction = redux.actions.simpleAction<boolean>(ActionType.Budgets.Loading);
export const responseBudgetsAction = redux.actions.simpleAction<Http.ListResponse<Model.SimpleBudget>>(
  ActionType.Budgets.Response
);
export const setBudgetsSearchAction = redux.actions.simpleAction<string>(ActionType.Budgets.SetSearch);
export const updateBudgetInStateAction = redux.actions.simpleAction<Redux.UpdateModelActionPayload<Model.Budget>>(
  ActionType.Budgets.UpdateInState
);
export const addBudgetToStateAction = redux.actions.simpleAction<Model.Budget>(ActionType.Budgets.AddToState);
export const removeBudgetFromStateAction = redux.actions.simpleAction<number>(ActionType.Budgets.RemoveFromState);

export const requestTemplatesAction = redux.actions.simpleAction<null>(ActionType.Templates.Request);
export const loadingTemplatesAction = redux.actions.simpleAction<boolean>(ActionType.Templates.Loading);
export const responseTemplatesAction = redux.actions.simpleAction<Http.ListResponse<Model.SimpleTemplate>>(
  ActionType.Templates.Response
);
export const setTemplatesSearchAction = redux.actions.simpleAction<string>(ActionType.Templates.SetSearch);
export const updateTemplateInStateAction = redux.actions.simpleAction<Redux.UpdateModelActionPayload<Model.Template>>(
  ActionType.Templates.UpdateInState
);
export const addTemplateToStateAction = redux.actions.simpleAction<Model.Template>(ActionType.Templates.AddToState);
export const removeTemplateFromStateAction = redux.actions.simpleAction<number>(ActionType.Templates.RemoveFromState);

export const requestCommunityTemplatesAction = redux.actions.simpleAction<null>(ActionType.Community.Request);
export const loadingCommunityTemplatesAction = redux.actions.simpleAction<boolean>(ActionType.Community.Loading);
export const responseCommunityTemplatesAction = redux.actions.simpleAction<Http.ListResponse<Model.SimpleTemplate>>(
  ActionType.Community.Response
);
export const setCommunityTemplatesSearchAction = redux.actions.simpleAction<string>(ActionType.Community.SetSearch);
export const updateCommunityTemplateInStateAction = redux.actions.simpleAction<
  Redux.UpdateModelActionPayload<Model.Template>
>(ActionType.Community.UpdateInState);
export const addCommunityTemplateToStateAction = redux.actions.simpleAction<Model.Template>(
  ActionType.Community.AddToState
);
export const removeCommunityTemplateFromStateAction = redux.actions.simpleAction<number>(
  ActionType.Community.RemoveFromState
);
