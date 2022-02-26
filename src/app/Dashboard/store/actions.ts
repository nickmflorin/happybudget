import { redux } from "lib";

export const requestBudgetsAction = redux.actions.createAction<null>("dashboard.budgets.Request");
export const requestPermissioningBudgetsAction = redux.actions.createAction<null>(
  "dashboard.budgets.RequestPermissioned"
);
export const loadingBudgetsAction = redux.actions.createAction<boolean>("dashboard.budgets.Loading");
export const responsePermissionedBudgetsAction = redux.actions.createAction<Http.ListResponse<Model.SimpleBudget>>(
  "dashboard.budgets.ResponsePermissioned"
);
export const responseBudgetsAction =
  redux.actions.createAction<Http.ListResponse<Model.SimpleBudget>>("dashboard.budgets.Response");
export const setBudgetsSearchAction = redux.actions.createTableAction<string, Table.Context>(
  "dashboard.budgets.SetSearch"
);
export const setBudgetsPaginationAction = redux.actions.createAction<Pagination>("dashboard.budgets.SetPagination");
export const updateBudgetsOrderingAction = redux.actions.createAction<Redux.UpdateOrderingPayload>(
  "dashboard.budgets.UpdateOrdering"
);
export const updateBudgetInStateAction = redux.actions.createAction<Redux.UpdateActionPayload<Model.Budget>>(
  "dashboard.budgets.UpdateInState"
);
export const addBudgetToStateAction = redux.actions.createAction<Model.SimpleBudget>("dashboard.budgets.AddToState");
export const removeBudgetFromStateAction = redux.actions.createAction<number>("dashboard.budgets.RemoveFromState");

export const requestTemplatesAction = redux.actions.createAction<null>("dashboard.templates.Request");
export const loadingTemplatesAction = redux.actions.createAction<boolean>("dashboard.templates.Loading");
export const responseTemplatesAction =
  redux.actions.createAction<Http.ListResponse<Model.SimpleTemplate>>("dashboard.templates.Response");
export const setTemplatesSearchAction = redux.actions.createTableAction<string, Table.Context>(
  "dashboard.templates.SetSearch"
);
export const setTemplatesPaginationAction = redux.actions.createAction<Pagination>("dashboard.templates.SetPagination");
export const updateTemplatesOrderingAction = redux.actions.createAction<Redux.UpdateOrderingPayload>(
  "dashboard.templates.UpdateOrdering"
);
export const updateTemplateInStateAction = redux.actions.createAction<Redux.UpdateActionPayload<Model.Template>>(
  "dashboard.templates.UpdateInState"
);
export const addTemplateToStateAction = redux.actions.createAction<Model.SimpleTemplate>(
  "dashboard.templates.AddToState"
);
export const removeTemplateFromStateAction = redux.actions.createAction<number>("dashboard.templates.RemoveFromState");

export const requestCommunityTemplatesAction = redux.actions.createAction<null>("dashboard.community.Request");
export const loadingCommunityTemplatesAction = redux.actions.createAction<boolean>("dashboard.community.Loading");
export const responseCommunityTemplatesAction =
  redux.actions.createAction<Http.ListResponse<Model.SimpleTemplate>>("dashboard.community.Response");
export const setCommunityTemplatesSearchAction = redux.actions.createTableAction<string, Table.Context>(
  "dashboard.community.SetSearch"
);
export const setCommunityTemplatesPaginationAction = redux.actions.createAction<Pagination>(
  "dashboard.community.SetPagination"
);
export const updateCommunityTemplatesOrderingAction = redux.actions.createAction<Redux.UpdateOrderingPayload>(
  "dashboard.community.UpdateOrdering"
);
export const updateCommunityTemplateInStateAction = redux.actions.createAction<
  Redux.UpdateActionPayload<Model.Template>
>("dashboard.community.UpdateInState");
export const addCommunityTemplateToStateAction = redux.actions.createAction<Model.SimpleTemplate>(
  "dashboard.community.AddToState"
);
export const removeCommunityTemplateFromStateAction = redux.actions.createAction<number>(
  "dashboard.community.RemoveFromState"
);

export const handleContactsTableEventAction = redux.actions.createTableAction<
  Table.Event<Tables.ContactRowData, Model.Contact>,
  Tables.ContactTableContext
>("dashboard.contacts.TableChanged");

export const setContactsSearchAction = redux.actions.createTableAction<string, Tables.ContactTableContext>(
  "dashboard.contacts.SetSearch"
);

export const requestContactsAction = redux.actions.createTableAction<
  Redux.TableRequestPayload,
  Tables.ContactTableContext
>("dashboard.contacts.Request");

export const loadingContactsAction = redux.actions.createAction<boolean>("dashboard.contacts.Loading");
export const responseContactsAction =
  redux.actions.createAction<Http.TableResponse<Model.Contact>>("dashboard.contacts.Response");
export const removeContactFromStateAction = redux.actions.createAction<number>("dashboard.contacts.RemoveFromState");
export const updateContactInStateAction = redux.actions.createAction<Redux.UpdateActionPayload<Model.Contact>>(
  "dashboard.contacts.UpdateInState"
);
