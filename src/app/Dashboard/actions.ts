import { createAction, simpleAction } from "store/actions";

export const ActionDomains: { [key: string]: Redux.Dashboard.ActionDomain } = {
  TRASH: "trash",
  ACTIVE: "active"
};

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
    PermanentlyDelete: "dashboard.budgets.PermanentlyDelete",
    Restore: "dashboard.budgets.Restore",
    Deleting: "dashboard.budgets.Deleting",
    PermanentlyDeleting: "dashboard.budgets.PermanentlyDeleting",
    Restoring: "dashboard.budgets.Restoring"
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

export const simpleDomainAction = <P = any>(type: string) => {
  return (
    domain: Redux.Dashboard.ActionDomain,
    payload: P,
    options?: Redux.IActionConfig
  ): Redux.Dashboard.IAction<P> => {
    return { ...createAction<P>(type, payload, options), domain };
  };
};

export const requestBudgetsAction = (domain: Redux.Dashboard.ActionDomain): Redux.Dashboard.IAction<null> => {
  return { ...createAction(ActionType.Budgets.Request), domain };
};
export const loadingBudgetsAction = simpleDomainAction<boolean>(ActionType.Budgets.Loading);
export const responseBudgetsAction = simpleDomainAction<Http.IListResponse<IBudget>>(ActionType.Budgets.Response);
export const selectBudgetsAction = simpleDomainAction<number[]>(ActionType.Budgets.Select);
export const setBudgetsSearchAction = simpleDomainAction<string>(ActionType.Budgets.SetSearch);
export const setBudgetsPageAction = simpleDomainAction<number>(ActionType.Budgets.SetPage);
export const setBudgetsPageSizeAction = simpleDomainAction<number>(ActionType.Budgets.SetPageSize);
export const setBudgetsPageAndSizeAction = simpleDomainAction<PageAndSize>(ActionType.Budgets.SetPageAndSize);
export const updateBudgetInStateAction = simpleDomainAction<Redux.UpdateModelActionPayload<IBudget>>(
  ActionType.Budgets.UpdateInState
);
export const addBudgetToStateAction = simpleDomainAction<IBudget>(ActionType.Budgets.AddToState);
export const removeBudgetFromStateAction = simpleDomainAction<number>(ActionType.Budgets.RemoveFromState);

export const deleteBudgetAction = simpleAction<number>(ActionType.Budgets.Delete);
export const deletingBudgetAction = simpleAction<{ id: number; value: boolean }>(ActionType.Budgets.Deleting);

export const permanentlyDeleteBudgetAction = simpleAction<number>(ActionType.Budgets.PermanentlyDelete);
export const permanentlyDeletingBudgetAction = simpleAction<{ id: number; value: boolean }>(
  ActionType.Budgets.PermanentlyDeleting
);

export const restoreBudgetAction = simpleAction<number>(ActionType.Budgets.Restore);
export const restoringBudgetAction = simpleAction<{ id: number; value: boolean }>(ActionType.Budgets.Restoring);

export const requestContactsAction = simpleAction<null>(ActionType.Contacts.Request);
export const loadingContactsAction = simpleAction<boolean>(ActionType.Contacts.Loading);
export const responseContactsAction = simpleAction<Http.IListResponse<IContact>>(ActionType.Contacts.Response);
export const selectContactsAction = simpleAction<number[]>(ActionType.Contacts.Select);
export const setContactsSearchAction = simpleAction<string>(ActionType.Contacts.SetSearch);
export const setContactsPageSizeAction = simpleAction<number>(ActionType.Contacts.SetPageSize);
export const setContactsPageAction = simpleAction<number>(ActionType.Contacts.SetPage);
export const setContactsPageAndSizeAction = simpleAction<PageAndSize>(ActionType.Contacts.SetPageAndSize);
export const deleteContactAction = simpleAction<number>(ActionType.Contacts.Delete);
export const deleteContactsAction = simpleAction<number[]>(ActionType.Contacts.DeleteMultiple);
export const deletingContactAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Contacts.Deleting);
export const updateContactAction = simpleAction<Redux.UpdateModelActionPayload<IContact>>(ActionType.Contacts.Update);
export const updatingContactAction = simpleAction<Redux.ModelListActionPayload>(ActionType.Contacts.Updating);
export const removeContactFromStateAction = simpleAction<number>(ActionType.Contacts.RemoveFromState);
export const updateContactInStateAction = simpleAction<Redux.UpdateModelActionPayload<IContact>>(
  ActionType.Contacts.UpdateInState
);
export const addContactToStateAction = simpleAction<IContact>(ActionType.Contacts.AddToState);

// Not currently used, because the createContact service is used directly in the
// modal for creating a contact, but we might use in the future.
export const createContactAction = simpleAction<Http.IContactPayload>(ActionType.Contacts.Create);
export const creatingContactAction = simpleAction<boolean>(ActionType.Contacts.Creating);
