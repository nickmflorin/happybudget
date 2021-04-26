import { simpleAction } from "store/actions";

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
    Duplicate: "dashboard.templates.Duplicate",
    Duplicating: "dashboard.templates.Duplicating"
  },
  Contacts: {
    Loading: "dashboard.contacts.Loading",
    Response: "dashboard.contacts.Response",
    Request: "dashboard.contacts.Request",
    Select: "dashboard.contacts.Select",
    SetSearch: "dashboard.contacts.SetSearch",
    SetPage: "dashboard.contacts.SetPage",
    SetPageSize: "dashboard.contacts.SetPageSize",
    SetPageAndSize: "dashboard.contacts.SetPageAndSize",
    UpdateInState: "dashboard.contacts.UpdateInState",
    RemoveFromState: "dashboard.contacts.RemoveFromState",
    AddToState: "dashboard.contacts.AddToState",
    Delete: "dashboard.contacts.Delete",
    DeleteMultiple: "dashboard.contacts.DeleteMultiple",
    Deleting: "dashboard.contacts.Deleting",
    Update: "dashboard.contacts.Update",
    Updating: "dashboard.contacts.Updating",
    Create: "dashboard.contacts.Create",
    Creating: "dashboard.contacts.Creating"
  }
};

export const requestBudgetsAction = simpleAction<null>(ActionType.Budgets.Request);
export const loadingBudgetsAction = simpleAction<boolean>(ActionType.Budgets.Loading);
export const responseBudgetsAction = simpleAction<Http.ListResponse<Model.Budget>>(ActionType.Budgets.Response);
export const setBudgetsSearchAction = simpleAction<string>(ActionType.Budgets.SetSearch);
export const setBudgetsPageAction = simpleAction<number>(ActionType.Budgets.SetPage);
export const setBudgetsPageSizeAction = simpleAction<number>(ActionType.Budgets.SetPageSize);
export const setBudgetsPageAndSizeAction = simpleAction<PageAndSize>(ActionType.Budgets.SetPageAndSize);
export const updateBudgetInStateAction = simpleAction<Redux.UpdateModelActionPayload<Model.Budget>>(
  ActionType.Budgets.UpdateInState
);
export const addBudgetToStateAction = simpleAction<Model.Budget>(ActionType.Budgets.AddToState);
export const removeBudgetFromStateAction = simpleAction<number>(ActionType.Budgets.RemoveFromState);
export const deleteBudgetAction = simpleAction<number>(ActionType.Budgets.Delete);
export const deletingBudgetAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Budgets.Deleting);

export const requestTemplatesAction = simpleAction<null>(ActionType.Templates.Request);
export const loadingTemplatesAction = simpleAction<boolean>(ActionType.Templates.Loading);
export const responseTemplatesAction = simpleAction<Http.ListResponse<Model.Template>>(ActionType.Templates.Response);
export const setTemplatesSearchAction = simpleAction<string>(ActionType.Templates.SetSearch);
export const setTemplatesPageAction = simpleAction<number>(ActionType.Templates.SetPage);
export const setTemplatesPageSizeAction = simpleAction<number>(ActionType.Templates.SetPageSize);
export const setTemplatesPageAndSizeAction = simpleAction<PageAndSize>(ActionType.Templates.SetPageAndSize);
export const updateTemplateInStateAction = simpleAction<Redux.UpdateModelActionPayload<Model.Template>>(
  ActionType.Templates.UpdateInState
);
export const addTemplateToStateAction = simpleAction<Model.Template>(ActionType.Templates.AddToState);
export const removeTemplateFromStateAction = simpleAction<number>(ActionType.Templates.RemoveFromState);
export const deleteTemplateAction = simpleAction<number>(ActionType.Templates.Delete);
export const deletingTemplateAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Templates.Deleting);
export const moveTemplateToCommunityAction = simpleAction<number>(ActionType.Templates.MoveToCommunity);
export const movingTemplateToCommunityAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.Templates.MovingToCommunity
);
export const duplicateTemplateAction = simpleAction<number>(ActionType.Templates.Duplicate);
export const duplicatingTemplateAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Templates.Duplicating);

export const requestCommunityTemplatesAction = simpleAction<null>(ActionType.Community.Request);
export const loadingCommunityTemplatesAction = simpleAction<boolean>(ActionType.Community.Loading);
export const responseCommunityTemplatesAction = simpleAction<Http.ListResponse<Model.Template>>(
  ActionType.Community.Response
);
export const setCommunityTemplatesSearchAction = simpleAction<string>(ActionType.Community.SetSearch);
export const setCommunityTemplatesPageAction = simpleAction<number>(ActionType.Community.SetPage);
export const setCommunityTemplatesPageSizeAction = simpleAction<number>(ActionType.Community.SetPageSize);
export const setCommunityTemplatesPageAndSizeAction = simpleAction<PageAndSize>(ActionType.Community.SetPageAndSize);
export const updateCommunityTemplateInStateAction = simpleAction<Redux.UpdateModelActionPayload<Model.Template>>(
  ActionType.Community.UpdateInState
);
export const addCommunityTemplateToStateAction = simpleAction<Model.Template>(ActionType.Community.AddToState);
export const removeCommunityTemplateFromStateAction = simpleAction<number>(ActionType.Community.RemoveFromState);
export const deleteCommunityTemplateAction = simpleAction<number>(ActionType.Community.Delete);
export const deletingCommunityTemplateAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.Community.Deleting
);
export const duplicateCommunityTemplateAction = simpleAction<number>(ActionType.Community.Duplicate);
export const duplicatingCommunityTemplateAction = simpleAction<Redux.ModelListActionPayload>(
  ActionType.Community.Duplicating
);

export const requestContactsAction = simpleAction<null>(ActionType.Contacts.Request);
export const loadingContactsAction = simpleAction<boolean>(ActionType.Contacts.Loading);
export const responseContactsAction = simpleAction<Http.ListResponse<Model.Contact>>(ActionType.Contacts.Response);
export const selectContactsAction = simpleAction<number[]>(ActionType.Contacts.Select);
export const setContactsSearchAction = simpleAction<string>(ActionType.Contacts.SetSearch);
export const setContactsPageSizeAction = simpleAction<number>(ActionType.Contacts.SetPageSize);
export const setContactsPageAction = simpleAction<number>(ActionType.Contacts.SetPage);
export const setContactsPageAndSizeAction = simpleAction<PageAndSize>(ActionType.Contacts.SetPageAndSize);
export const deleteContactAction = simpleAction<number>(ActionType.Contacts.Delete);
export const deleteContactsAction = simpleAction<number[]>(ActionType.Contacts.DeleteMultiple);
export const deletingContactAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Contacts.Deleting);
export const removeContactFromStateAction = simpleAction<number>(ActionType.Contacts.RemoveFromState);
export const updateContactInStateAction = simpleAction<Redux.UpdateModelActionPayload<Model.Contact>>(
  ActionType.Contacts.UpdateInState
);
export const addContactToStateAction = simpleAction<Model.Contact>(ActionType.Contacts.AddToState);

// Not currently used, because the updateContact service is used directly in the
// modal for editing a contact, but we might use in the future.
export const updateContactAction = simpleAction<Redux.UpdateModelActionPayload<Model.Contact>>(
  ActionType.Contacts.Update
);
export const updatingContactAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Contacts.Updating);

// Not currently used, because the createContact service is used directly in the
// modal for creating a contact, but we might use in the future.
export const createContactAction = simpleAction<Http.ContactPayload>(ActionType.Contacts.Create);
export const creatingContactAction = simpleAction<boolean>(ActionType.Contacts.Creating);
