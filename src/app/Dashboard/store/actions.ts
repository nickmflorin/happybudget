import { redux } from "lib";

export const ActionType = {
  Budgets: {
    Loading: "dashboard.budgets.Loading",
    Response: "dashboard.budgets.Response",
    Request: "dashboard.budgets.Request",
    SetSearch: "dashboard.budgets.SetSearch",
    UpdateInState: "dashboard.budgets.UpdateInState",
    RemoveFromState: "dashboard.budgets.RemoveFromState",
    AddToState: "dashboard.budgets.AddToState",
    SetPagination: "dashboard.budgets.SetPagination",
    UpdateOrdering: "dashboard.budgets.UpdateOrdering"
  },
  Templates: {
    Loading: "dashboard.templates.Loading",
    Response: "dashboard.templates.Response",
    Request: "dashboard.templates.Request",
    SetSearch: "dashboard.templates.SetSearch",
    UpdateInState: "dashboard.templates.UpdateInState",
    RemoveFromState: "dashboard.templates.RemoveFromState",
    AddToState: "dashboard.templates.AddToState",
    SetPagination: "dashboard.templates.SetPagination",
    UpdateOrdering: "dashboard.templates.UpdateOrdering"
  },
  Community: {
    Loading: "dashboard.community.Loading",
    Response: "dashboard.community.Response",
    Request: "dashboard.community.Request",
    SetSearch: "dashboard.community.SetSearch",
    UpdateInState: "dashboard.community.UpdateInState",
    RemoveFromState: "dashboard.community.RemoveFromState",
    AddToState: "dashboard.community.AddToState",
    SetPagination: "dashboard.community.SetPagination",
    UpdateOrdering: "dashboard.community.UpdateOrdering"
  },
  Contacts: {
    TableChanged: "dashboard.contacts.TableChanged",
    Saving: "dashboard.contacts.Saving",
    Request: "dashboard.contacts.Request",
    Loading: "dashboard.contacts.Loading",
    Response: "dashboard.contacts.Response",
    SetSearch: "dashboard.contacts.SetSearch",
    UpdateInState: "dashboard.contacts.UpdateInState",
    RemoveFromState: "dashboard.contacts.RemoveFromState",
    AddToState: "dashboard.contacts.AddToState",
    UpdateRowsInState: "dashboard.contacts.UpdateRowsInState"
  }
};

export const requestBudgetsAction = redux.actions.createAction<null>(ActionType.Budgets.Request);
export const loadingBudgetsAction = redux.actions.createAction<boolean>(ActionType.Budgets.Loading);
export const responseBudgetsAction = redux.actions.createAction<Http.ListResponse<Model.SimpleBudget>>(
  ActionType.Budgets.Response
);
export const setBudgetsSearchAction = redux.actions.createContextAction<string, Table.Context>(
  ActionType.Budgets.SetSearch
);
export const setBudgetsPaginationAction = redux.actions.createAction<Pagination>(ActionType.Budgets.SetPagination);
export const updateBudgetsOrderingAction = redux.actions.createAction<Redux.UpdateOrderingPayload>(
  ActionType.Budgets.UpdateOrdering
);
export const updateBudgetInStateAction = redux.actions.createAction<Redux.UpdateActionPayload<Model.Budget>>(
  ActionType.Budgets.UpdateInState
);
export const addBudgetToStateAction = redux.actions.createAction<Model.SimpleBudget>(ActionType.Budgets.AddToState);
export const removeBudgetFromStateAction = redux.actions.createAction<number>(ActionType.Budgets.RemoveFromState);

export const requestTemplatesAction = redux.actions.createAction<null>(ActionType.Templates.Request);
export const loadingTemplatesAction = redux.actions.createAction<boolean>(ActionType.Templates.Loading);
export const responseTemplatesAction = redux.actions.createAction<Http.ListResponse<Model.SimpleTemplate>>(
  ActionType.Templates.Response
);
export const setTemplatesSearchAction = redux.actions.createContextAction<string, Table.Context>(
  ActionType.Templates.SetSearch
);
export const setTemplatesPaginationAction = redux.actions.createAction<Pagination>(ActionType.Templates.SetPagination);
export const updateTemplatesOrderingAction = redux.actions.createAction<Redux.UpdateOrderingPayload>(
  ActionType.Templates.UpdateOrdering
);
export const updateTemplateInStateAction = redux.actions.createAction<Redux.UpdateActionPayload<Model.Template>>(
  ActionType.Templates.UpdateInState
);
export const addTemplateToStateAction = redux.actions.createAction<Model.SimpleTemplate>(
  ActionType.Templates.AddToState
);
export const removeTemplateFromStateAction = redux.actions.createAction<number>(ActionType.Templates.RemoveFromState);

export const requestCommunityTemplatesAction = redux.actions.createAction<null>(ActionType.Community.Request);
export const loadingCommunityTemplatesAction = redux.actions.createAction<boolean>(ActionType.Community.Loading);
export const responseCommunityTemplatesAction = redux.actions.createAction<Http.ListResponse<Model.SimpleTemplate>>(
  ActionType.Community.Response
);
export const setCommunityTemplatesSearchAction = redux.actions.createContextAction<string, Table.Context>(
  ActionType.Community.SetSearch
);
export const setCommunityTemplatesPaginationAction = redux.actions.createAction<Pagination>(
  ActionType.Community.SetPagination
);
export const updateCommunityTemplatesOrderingAction = redux.actions.createAction<Redux.UpdateOrderingPayload>(
  ActionType.Community.UpdateOrdering
);
export const updateCommunityTemplateInStateAction = redux.actions.createAction<
  Redux.UpdateActionPayload<Model.Template>
>(ActionType.Community.UpdateInState);
export const addCommunityTemplateToStateAction = redux.actions.createAction<Model.SimpleTemplate>(
  ActionType.Community.AddToState
);
export const removeCommunityTemplateFromStateAction = redux.actions.createAction<number>(
  ActionType.Community.RemoveFromState
);

export const handleContactsTableChangeEventAction = redux.actions.createContextAction<
  Table.ChangeEvent<Tables.ContactRowData, Model.Contact>,
  Tables.ContactTableContext
>(ActionType.Contacts.TableChanged);

export const savingContactsTableAction = redux.actions.createAction<boolean>(ActionType.Contacts.Saving);
export const setContactsSearchAction = redux.actions.createContextAction<string, Tables.ContactTableContext>(
  ActionType.Contacts.SetSearch
);

export const requestContactsAction = redux.actions.createContextAction<
  Redux.TableRequestPayload,
  Tables.ContactTableContext
>(ActionType.Contacts.Request);

export const addContactModelsToStateAction = redux.actions.createAction<Redux.AddModelsToTablePayload<Model.Contact>>(
  ActionType.Contacts.AddToState
);
export const loadingContactsAction = redux.actions.createAction<boolean>(ActionType.Contacts.Loading);
export const responseContactsAction = redux.actions.createAction<Http.TableResponse<Model.Contact>>(
  ActionType.Contacts.Response
);
export const removeContactFromStateAction = redux.actions.createAction<number>(ActionType.Contacts.RemoveFromState);
export const updateContactInStateAction = redux.actions.createAction<Redux.UpdateActionPayload<Model.Contact>>(
  ActionType.Contacts.UpdateInState
);
export const updateContactRowsInStateAction = redux.actions.createAction<
  Redux.UpdateRowsInTablePayload<Tables.ContactRowData>
>(ActionType.Contacts.UpdateRowsInState);
