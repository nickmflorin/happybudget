import { simpleAction } from "store/actions";

export const ActionType = {
  Budgets: {
    Loading: "dashboard.budgets.Loading",
    Response: "dashboard.budgets.Response",
    Request: "dashboard.budgets.Request",
    Select: "dashboard.budgets.Select",
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
    Select: "dashboard.templates.Select",
    SetSearch: "dashboard.templates.SetSearch",
    SetPage: "dashboard.templates.SetPage",
    SetPageSize: "dashboard.templates.SetPageSize",
    SetPageAndSize: "dashboard.templates.SetPageAndSize",
    UpdateInState: "dashboard.templates.UpdateInState",
    RemoveFromState: "dashboard.templates.RemoveFromState",
    AddToState: "dashboard.templates.AddToState",
    Delete: "dashboard.templates.Delete",
    Deleting: "dashboard.templates.Deleting"
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
export const selectBudgetsAction = simpleAction<number[]>(ActionType.Budgets.Select);
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
export const deletingBudgetAction = simpleAction<{ id: number; value: boolean }>(ActionType.Budgets.Deleting);

export const requestTemplatesAction = simpleAction<null>(ActionType.Templates.Request);
export const loadingTemplatesAction = simpleAction<boolean>(ActionType.Templates.Loading);
export const responseTemplatesAction = simpleAction<Http.ListResponse<Model.Template>>(ActionType.Templates.Response);
export const selectTemplatesAction = simpleAction<number[]>(ActionType.Templates.Select);
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
export const deletingTemplateAction = simpleAction<{ id: number; value: boolean }>(ActionType.Templates.Deleting);

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
