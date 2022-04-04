import { redux } from "lib";

export const requestDataAction = redux.actions.createAction<null>("dashboard.Request");

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
export const updateBudgetInStateAction = redux.actions.createAction<Redux.UpdateModelPayload<Model.SimpleBudget>>(
  "dashboard.budgets.UpdateInState"
);
export const addBudgetToStateAction = redux.actions.createAction<Model.SimpleBudget>("dashboard.budgets.AddToState");
export const removeBudgetFromStateAction = redux.actions.createAction<number>("dashboard.budgets.RemoveFromState");

export const requestArchiveAction = redux.actions.createAction<null>("dashboard.archive.Request");
export const requestPermissioningArchiveAction = redux.actions.createAction<null>(
  "dashboard.archive.RequestPermissioned"
);
export const loadingArchiveAction = redux.actions.createAction<boolean>("dashboard.archive.Loading");
export const responsePermissionedArchiveAction = redux.actions.createAction<Http.ListResponse<Model.SimpleBudget>>(
  "dashboard.archive.ResponsePermissioned"
);
export const responseArchiveAction =
  redux.actions.createAction<Http.ListResponse<Model.SimpleBudget>>("dashboard.archive.Response");
export const setArchiveSearchAction = redux.actions.createTableAction<string, Table.Context>(
  "dashboard.archive.SetSearch"
);
export const setArchivePaginationAction = redux.actions.createAction<Pagination>("dashboard.archive.SetPagination");
export const updateArchiveOrderingAction = redux.actions.createAction<Redux.UpdateOrderingPayload>(
  "dashboard.archive.UpdateOrdering"
);
export const updateArchiveInStateAction = redux.actions.createAction<Redux.UpdateModelPayload<Model.SimpleBudget>>(
  "dashboard.archive.UpdateInState"
);
export const removeArchiveFromStateAction = redux.actions.createAction<number>("dashboard.archive.RemoveFromState");
export const addArchiveToStateAction = redux.actions.createAction<Model.SimpleBudget>("dashboard.archive.AddToState");

export const requestCollaboratingAction = redux.actions.createAction<null>("dashboard.collaborating.Request");
export const loadingCollaboratingAction = redux.actions.createAction<boolean>("dashboard.collaborating.Loading");
export const responseCollaboratingAction = redux.actions.createAction<
  Http.ListResponse<Model.SimpleCollaboratingBudget>
>("dashboard.collaborating.Response");
export const setCollaboratingSearchAction = redux.actions.createTableAction<string, Table.Context>(
  "dashboard.collaborating.SetSearch"
);
export const setCollaboratingPaginationAction = redux.actions.createAction<Pagination>(
  "dashboard.collaborating.SetPagination"
);
export const updateCollaboratingOrderingAction = redux.actions.createAction<Redux.UpdateOrderingPayload>(
  "dashboard.collaborating.UpdateOrdering"
);

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
export const updateTemplateInStateAction = redux.actions.createAction<Redux.UpdateModelPayload<Model.SimpleTemplate>>(
  "dashboard.templates.UpdateInState"
);
export const addTemplateToStateAction = redux.actions.createAction<Model.SimpleTemplate>(
  "dashboard.templates.AddToState"
);
export const removeTemplateFromStateAction = redux.actions.createAction<number>("dashboard.templates.RemoveFromState");

export const requestCommunityAction = redux.actions.createAction<null>("dashboard.community.Request");
export const loadingCommunityAction = redux.actions.createAction<boolean>("dashboard.community.Loading");
export const responseCommunityAction =
  redux.actions.createAction<Http.ListResponse<Model.SimpleTemplate>>("dashboard.community.Response");
export const setCommunitySearchAction = redux.actions.createTableAction<string, Table.Context>(
  "dashboard.community.SetSearch"
);
export const setCommunityPaginationAction = redux.actions.createAction<Pagination>("dashboard.community.SetPagination");
export const updateCommunityOrderingAction = redux.actions.createAction<Redux.UpdateOrderingPayload>(
  "dashboard.community.UpdateOrdering"
);
export const updateCommunityInStateAction = redux.actions.createAction<Redux.UpdateModelPayload<Model.SimpleTemplate>>(
  "dashboard.community.UpdateInState"
);
export const addCommunityToStateAction = redux.actions.createAction<Model.SimpleTemplate>(
  "dashboard.community.AddToState"
);
export const removeCommunityFromStateAction = redux.actions.createAction<number>("dashboard.community.RemoveFromState");

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
export const updateContactInStateAction = redux.actions.createAction<Redux.UpdateModelPayload<Model.Contact>>(
  "dashboard.contacts.UpdateInState"
);
