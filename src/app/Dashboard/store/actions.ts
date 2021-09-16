import { createAction } from "@reduxjs/toolkit";

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
  },
  Contacts: {
    TableChanged: "dashboard.contacts.TableChanged",
    Saving: "dashboard.contacts.Saving",
    Request: "dashboard.contacts.Request",
    Clear: "dashboard.contacts.Clear",
    Loading: "dashboard.contacts.Loading",
    Response: "dashboard.contacts.Response",
    SetSearch: "dashboard.contacts.SetSearch",
    UpdateInState: "dashboard.contacts.UpdateInState",
    RemoveFromState: "dashboard.contacts.RemoveFromState",
    AddToState: "dashboard.contacts.AddToState"
  }
};

export const requestBudgetsAction = createAction<null>(ActionType.Budgets.Request);
export const loadingBudgetsAction = createAction<boolean>(ActionType.Budgets.Loading);
export const responseBudgetsAction = createAction<Http.ListResponse<Model.SimpleBudget>>(ActionType.Budgets.Response);
export const setBudgetsSearchAction = createAction<string>(ActionType.Budgets.SetSearch);
export const updateBudgetInStateAction = createAction<Redux.UpdateActionPayload<Model.Budget>>(
  ActionType.Budgets.UpdateInState
);
export const addBudgetToStateAction = createAction<Model.SimpleBudget>(ActionType.Budgets.AddToState);
export const removeBudgetFromStateAction = createAction<number>(ActionType.Budgets.RemoveFromState);

export const requestTemplatesAction = createAction<null>(ActionType.Templates.Request);
export const loadingTemplatesAction = createAction<boolean>(ActionType.Templates.Loading);
export const responseTemplatesAction = createAction<Http.ListResponse<Model.SimpleTemplate>>(
  ActionType.Templates.Response
);
export const setTemplatesSearchAction = createAction<string>(ActionType.Templates.SetSearch);
export const updateTemplateInStateAction = createAction<Redux.UpdateActionPayload<Model.Template>>(
  ActionType.Templates.UpdateInState
);
export const addTemplateToStateAction = createAction<Model.SimpleTemplate>(ActionType.Templates.AddToState);
export const removeTemplateFromStateAction = createAction<number>(ActionType.Templates.RemoveFromState);

export const requestCommunityTemplatesAction = createAction<null>(ActionType.Community.Request);
export const loadingCommunityTemplatesAction = createAction<boolean>(ActionType.Community.Loading);
export const responseCommunityTemplatesAction = createAction<Http.ListResponse<Model.SimpleTemplate>>(
  ActionType.Community.Response
);
export const setCommunityTemplatesSearchAction = createAction<string>(ActionType.Community.SetSearch);
export const updateCommunityTemplateInStateAction = createAction<Redux.UpdateActionPayload<Model.Template>>(
  ActionType.Community.UpdateInState
);
export const addCommunityTemplateToStateAction = createAction<Model.SimpleTemplate>(ActionType.Community.AddToState);
export const removeCommunityTemplateFromStateAction = createAction<number>(ActionType.Community.RemoveFromState);

export const handleContactsTableChangeEventAction = createAction<
  Table.ChangeEvent<Tables.ContactRowData, Model.Contact>
>(ActionType.Contacts.TableChanged);
export const savingContactsTableAction = createAction<boolean>(ActionType.Contacts.Saving);
export const setContactsSearchAction = createAction<string>(ActionType.Contacts.SetSearch);
export const requestContactsAction = createAction<null>(ActionType.Contacts.Request);
export const clearContactsAction = createAction<null>(ActionType.Contacts.Clear);
export const addContactModelsToStateAction = createAction<Redux.AddModelsToTablePayload<Model.Contact>>(
  ActionType.Contacts.AddToState
);
export const loadingContactsAction = createAction<boolean>(ActionType.Contacts.Loading);
export const responseContactsAction = createAction<Http.TableResponse<Model.Contact>>(ActionType.Contacts.Response);
export const removeContactFromStateAction = createAction<number>(ActionType.Contacts.RemoveFromState);
export const updateContactInStateAction = createAction<Redux.UpdateActionPayload<Model.Contact>>(
  ActionType.Contacts.UpdateInState
);
