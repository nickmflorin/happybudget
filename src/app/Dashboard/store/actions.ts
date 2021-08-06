import { redux } from "lib";

export const ActionType = {
  Budgets: {
    Loading: "dashboard.budgets.Loading",
    Response: "dashboard.budgets.Response",
    Request: "dashboard.budgets.Request",
    SetSearch: "dashboard.budgets.SetSearch",
    SetPage: "dashboard.budgets.SetPage",
    SetPageSize: "dashboard.budgets.SetPageSize",
    SetPageAndSize: "dashboard.budgets.SetPageAndSize",
    UpdateInState: "dashboard.budgets.UpdateInState",
    RemoveFromState: "dashboard.budgets.RemoveFromState",
    AddToState: "dashboard.budgets.AddToState",
    Delete: "dashboard.budgets.Delete",
    Deleting: "dashboard.budgets.Deleting"
  },
  Templates: {
    Loading: "dashboard.templates.Loading",
    Response: "dashboard.templates.Response",
    Request: "dashboard.templates.Request",
    SetSearch: "dashboard.templates.SetSearch",
    SetPage: "dashboard.templates.SetPage",
    SetPageSize: "dashboard.templates.SetPageSize",
    SetPageAndSize: "dashboard.templates.SetPageAndSize",
    UpdateInState: "dashboard.templates.UpdateInState",
    RemoveFromState: "dashboard.templates.RemoveFromState",
    AddToState: "dashboard.templates.AddToState",
    Delete: "dashboard.templates.Delete",
    Deleting: "dashboard.templates.Deleting",
    MoveToCommunity: "dashboard.templates.MoveToCommunity",
    MovingToCommunity: "dashboard.templates.MovingToCommunity",
    Duplicate: "dashboard.templates.Duplicate",
    Duplicating: "dashboard.templates.Duplicating"
  },
  Community: {
    Loading: "dashboard.community.Loading",
    Response: "dashboard.community.Response",
    Request: "dashboard.community.Request",
    SetSearch: "dashboard.community.SetSearch",
    SetPage: "dashboard.community.SetPage",
    SetPageSize: "dashboard.community.SetPageSize",
    SetPageAndSize: "dashboard.community.SetPageAndSize",
    UpdateInState: "dashboard.community.UpdateInState",
    RemoveFromState: "dashboard.community.RemoveFromState",
    AddToState: "dashboard.community.AddToState",
    Delete: "dashboard.community.Delete",
    Deleting: "dashboard.community.Deleting",
    Duplicate: "dashboard.community.Duplicate",
    Duplicating: "dashboard.community.Duplicating",
    Hide: "dashboard.community.Hide",
    Hiding: "dashboard.community.Hiding",
    Show: "dashboard.community.Show",
    Showing: "dashboard.community.Showing"
  }
};

export const requestBudgetsAction = redux.actions.simpleAction<null>(ActionType.Budgets.Request);
export const loadingBudgetsAction = redux.actions.simpleAction<boolean>(ActionType.Budgets.Loading);
export const responseBudgetsAction = redux.actions.simpleAction<Http.ListResponse<Model.SimpleBudget>>(
  ActionType.Budgets.Response
);
export const setBudgetsSearchAction = redux.actions.simpleAction<string>(ActionType.Budgets.SetSearch);
export const setBudgetsPageAction = redux.actions.simpleAction<number>(ActionType.Budgets.SetPage);
export const setBudgetsPageSizeAction = redux.actions.simpleAction<number>(ActionType.Budgets.SetPageSize);
export const setBudgetsPageAndSizeAction = redux.actions.simpleAction<PageAndSize>(ActionType.Budgets.SetPageAndSize);
export const updateBudgetInStateAction = redux.actions.simpleAction<Redux.UpdateModelActionPayload<Model.Budget>>(
  ActionType.Budgets.UpdateInState
);
export const addBudgetToStateAction = redux.actions.simpleAction<Model.Budget>(ActionType.Budgets.AddToState);
export const removeBudgetFromStateAction = redux.actions.simpleAction<number>(ActionType.Budgets.RemoveFromState);
export const deleteBudgetAction = redux.actions.simpleAction<number>(ActionType.Budgets.Delete);
export const deletingBudgetAction = redux.actions.simpleAction<Redux.ModelListActionPayload>(
  ActionType.Budgets.Deleting
);

export const requestTemplatesAction = redux.actions.simpleAction<null>(ActionType.Templates.Request);
export const loadingTemplatesAction = redux.actions.simpleAction<boolean>(ActionType.Templates.Loading);
export const responseTemplatesAction = redux.actions.simpleAction<Http.ListResponse<Model.SimpleTemplate>>(
  ActionType.Templates.Response
);
export const setTemplatesSearchAction = redux.actions.simpleAction<string>(ActionType.Templates.SetSearch);
export const setTemplatesPageAction = redux.actions.simpleAction<number>(ActionType.Templates.SetPage);
export const setTemplatesPageSizeAction = redux.actions.simpleAction<number>(ActionType.Templates.SetPageSize);
export const setTemplatesPageAndSizeAction = redux.actions.simpleAction<PageAndSize>(
  ActionType.Templates.SetPageAndSize
);
export const updateTemplateInStateAction = redux.actions.simpleAction<Redux.UpdateModelActionPayload<Model.Template>>(
  ActionType.Templates.UpdateInState
);
export const addTemplateToStateAction = redux.actions.simpleAction<Model.Template>(ActionType.Templates.AddToState);
export const removeTemplateFromStateAction = redux.actions.simpleAction<number>(ActionType.Templates.RemoveFromState);
export const deleteTemplateAction = redux.actions.simpleAction<number>(ActionType.Templates.Delete);
export const deletingTemplateAction = redux.actions.simpleAction<Redux.ModelListActionPayload>(
  ActionType.Templates.Deleting
);
export const moveTemplateToCommunityAction = redux.actions.simpleAction<number>(ActionType.Templates.MoveToCommunity);
export const movingTemplateToCommunityAction = redux.actions.simpleAction<Redux.ModelListActionPayload>(
  ActionType.Templates.MovingToCommunity
);
export const duplicateTemplateAction = redux.actions.simpleAction<number>(ActionType.Templates.Duplicate);
export const duplicatingTemplateAction = redux.actions.simpleAction<Redux.ModelListActionPayload>(
  ActionType.Templates.Duplicating
);

export const requestCommunityTemplatesAction = redux.actions.simpleAction<null>(ActionType.Community.Request);
export const loadingCommunityTemplatesAction = redux.actions.simpleAction<boolean>(ActionType.Community.Loading);
export const responseCommunityTemplatesAction = redux.actions.simpleAction<Http.ListResponse<Model.SimpleTemplate>>(
  ActionType.Community.Response
);
export const setCommunityTemplatesSearchAction = redux.actions.simpleAction<string>(ActionType.Community.SetSearch);
export const setCommunityTemplatesPageAction = redux.actions.simpleAction<number>(ActionType.Community.SetPage);
export const setCommunityTemplatesPageSizeAction = redux.actions.simpleAction<number>(ActionType.Community.SetPageSize);
export const setCommunityTemplatesPageAndSizeAction = redux.actions.simpleAction<PageAndSize>(
  ActionType.Community.SetPageAndSize
);
export const updateCommunityTemplateInStateAction = redux.actions.simpleAction<
  Redux.UpdateModelActionPayload<Model.Template>
>(ActionType.Community.UpdateInState);
export const addCommunityTemplateToStateAction = redux.actions.simpleAction<Model.Template>(
  ActionType.Community.AddToState
);
export const removeCommunityTemplateFromStateAction = redux.actions.simpleAction<number>(
  ActionType.Community.RemoveFromState
);
export const deleteCommunityTemplateAction = redux.actions.simpleAction<number>(ActionType.Community.Delete);
export const deletingCommunityTemplateAction = redux.actions.simpleAction<Redux.ModelListActionPayload>(
  ActionType.Community.Deleting
);
export const duplicateCommunityTemplateAction = redux.actions.simpleAction<number>(ActionType.Community.Duplicate);
export const duplicatingCommunityTemplateAction = redux.actions.simpleAction<Redux.ModelListActionPayload>(
  ActionType.Community.Duplicating
);
export const hideCommunityTemplateAction = redux.actions.simpleAction<number>(ActionType.Community.Hide);
export const hidingCommunityTemplateAction = redux.actions.simpleAction<Redux.ModelListActionPayload>(
  ActionType.Community.Hiding
);
export const showCommunityTemplateAction = redux.actions.simpleAction<number>(ActionType.Community.Show);
export const showingCommunityTemplateAction = redux.actions.simpleAction<Redux.ModelListActionPayload>(
  ActionType.Community.Showing
);
