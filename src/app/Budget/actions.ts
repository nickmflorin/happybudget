import { simpleAction } from "store/actions";

export const ActionType = {
  SetInstance: "budget.SetInstance",
  SetCommentsHistoryDrawerVisibility: "budget.SetCommentsHistoryDrawerVisibility",
  Budget: {
    SetId: "budget.budget.SetId",
    Loading: "budget.budget.Loading",
    Response: "budget.budget.Response",
    Request: "budget.budget.Request",
    BulkUpdateAccounts: "budget.budget.BulkUpdateAccounts",
    BulkUpdateActuals: "budget.budget.BulkUpdateActuals",
    Comments: {
      Loading: "budget.budget.comments.Loading",
      Response: "budget.budget.comments.Response",
      Request: "budget.budget.comments.Request",
      Delete: "budget.budget.comments.Delete",
      Update: "budget.budget.comments.Update",
      Create: "budget.budget.comments.Create",
      Creating: "budget.budget.comments.Creating",
      Deleting: "budget.budget.comments.Deleting",
      Updating: "budget.budget.comments.Updating",
      Replying: "budget.budget.comments.Replying",
      AddToState: "budget.budget.comments.AddToState",
      RemoveFromState: "budget.budget.comments.RemoveFromState",
      UpdateInState: "budget.budget.comments.UpdateInState"
    },
    Fringes: {
      Deleting: "budget.budget.fringes.Deleting",
      Creating: "budget.budget.fringes.Creating",
      Updating: "budget.budget.fringes.Updating",
      Loading: "budget.budget.fringes.Loading",
      Response: "budget.budget.fringes.Response",
      Request: "budget.budget.fringes.Request",
      Remove: "budget.budget.fringes.Remove",
      Update: "budget.budget.fringes.Update",
      AddToState: "budget.budget.fringes.AddToState",
      RemoveFromState: "budget.budget.fringes.RemoveFromState",
      UpdateInState: "budget.budget.fringes.UpdateInState",
      SetSearch: "budget.budget.fringes.SetSearch",
      Select: "budget.budget.fringes.Select",
      Deselect: "budget.budget.fringes.Deselect",
      SelectAll: "budget.budget.fringes.SelectAll",
      // Errors Functionality Needs to be Built Back In
      AddErrors: "budget.budget.fringes.AddErrors",
      Placeholders: {
        AddToState: "budget.budget.fringes.placeholders.AddToState",
        Activate: "budget.budget.fringes.placeholders.Activate",
        UpdateInState: "budget.budget.fringes.placeholders.UpdateInState",
        RemoveFromState: "budget.budget.fringes.placeholders.RemoveFromState"
      }
    },
    Accounts: {
      Deleting: "budget.budget.accounts.Deleting",
      Creating: "budget.budget.accounts.Creating",
      Updating: "budget.budget.accounts.Updating",
      Update: "budget.budget.accounts.Update",
      Remove: "budget.budget.accounts.Remove",
      SetSearch: "budget.budget.accounts.SetSearch",
      Loading: "budget.budget.accounts.Loading",
      Select: "budget.budget.accounts.Select",
      Deselect: "budget.budget.accounts.Deselect",
      SelectAll: "budget.budget.accounts.SelectAll",
      Response: "budget.budget.accounts.Response",
      Request: "budget.budget.accounts.Request",
      UpdateInState: "budget.budget.accounts.UpdateInState",
      RemoveFromState: "budget.budget.accounts.RemoveFromState",
      AddToState: "budget.budget.accounts.AddToState",
      RemoveFromGroup: "budget.budget.accounts.RemoveFromGroup",
      // Errors Functionality Needs to be Built Back In
      AddErrors: "budget.budget.accounts.AddErrors",
      Placeholders: {
        AddToState: "budget.budget.accounts.placeholders.AddToState",
        Activate: "budget.budget.accounts.placeholders.Activate",
        UpdateInState: "budget.budget.accounts.placeholders.UpdateInState",
        RemoveFromState: "budget.budget.accounts.placeholders.RemoveFromState"
      },
      Groups: {
        Response: "budget.budget.accounts.groups.Response",
        Request: "budget.budget.accounts.groups.Request",
        Loading: "budget.budget.accounts.groups.Loading",
        Delete: "budget.budget.accounts.groups.Delete",
        Deleting: "budget.budget.accounts.groups.Deleting",
        AddToState: "budget.budget.accounts.groups.AddToState",
        RemoveFromState: "budget.budget.accounts.groups.RemoveFromState",
        UpdateInState: "budget.budget.accounts.groups.UpdateInState"
      },
      History: {
        Loading: "budget.budget.accounts.history.Loading",
        Response: "budget.budget.accounts.history.Response",
        Request: "budget.budget.accounts.history.Request",
        AddToState: "budget.budget.accounts.history.AddToState"
      }
    }
  },
  SubAccount: {
    SetId: "budget.subaccount.SetId",
    Loading: "budget.subaccount.Loading",
    Response: "budget.subaccount.Response",
    Request: "budget.subaccount.Request",
    UpdateInState: "budget.subaccount.UpdateInState",
    BulkUpdate: "budget.subaccount.BulkUpdate",
    Comments: {
      Loading: "budget.subaccount.comments.Loading",
      Response: "budget.subaccount.comments.Response",
      Request: "budget.subaccount.comments.Request",
      Delete: "budget.subaccount.comments.Delete",
      Update: "budget.subaccount.comments.Update",
      Creating: "budget.subaccount.comments.Creating",
      Deleting: "budget.subaccount.comments.Deleting",
      Replying: "budget.subaccount.comments.Replying",
      Updating: "budget.subaccount.comments.Updating",
      Create: "budget.subaccount.comments.Create",
      AddToState: "budget.subaccount.comments.AddToState",
      RemoveFromState: "budget.subaccount.comments.RemoveFromState",
      UpdateInState: "budget.subaccount.comments.UpdateInState"
    },
    SubAccounts: {
      Deleting: "budget.subaccount.subaccounts.Deleting",
      Creating: "budget.subaccount.subaccounts.Creating",
      Updating: "budget.subaccount.subaccounts.Updating",
      Update: "budget.subaccount.subaccounts.Update",
      Remove: "budget.subaccount.subaccounts.Remove",
      SetSearch: "budget.subaccount.subaccounts.SetSearch",
      Loading: "budget.subaccount.subaccounts.Loading",
      Select: "budget.subaccount.subaccounts.Select",
      Deselect: "budget.subaccount.subaccounts.Deselect",
      SelectAll: "budget.subaccount.subaccounts.SelectAll",
      Response: "budget.subaccount.subaccounts.Response",
      Request: "budget.subaccount.subaccounts.Request",
      UpdateInState: "budget.subaccount.subaccounts.UpdateInState",
      RemoveFromState: "budget.subaccount.subaccounts.RemoveFromState",
      AddToState: "budget.subaccount.subaccounts.AddToState",
      RemoveFromGroup: "budget.subaccount.subaccounts.RemoveFromGroup",
      // Errors Functionality Needs to be Built Back In
      AddErrors: "budget.subaccount.subaccounts.AddErrors",
      Placeholders: {
        AddToState: "budget.subaccount.subaccounts.placeholders.AddToState",
        Activate: "budget.subaccount.subaccounts.placeholders.Activate",
        UpdateInState: "budget.subaccount.subaccounts.placeholders.UpdateInState",
        RemoveFromState: "budget.subaccount.subaccounts.placeholders.RemoveFromState"
      },
      Groups: {
        Response: "budget.subaccount.subaccounts.groups.Response",
        Request: "budget.subaccount.subaccounts.groups.Request",
        Loading: "budget.subaccount.subaccounts.groups.Loading",
        Delete: "budget.subaccount.subaccounts.groups.Delete",
        Deleting: "budget.subaccount.subaccounts.groups.Deleting",
        AddToState: "budget.subaccount.subaccounts.groups.AddToState",
        RemoveFromState: "budget.subaccount.subaccounts.groups.RemoveFromState",
        UpdateInState: "budget.subaccount.subaccounts.groups.UpdateInState"
      },
      History: {
        Loading: "budget.subaccount.subaccounts.history.Loading",
        Response: "budget.subaccount.subaccounts.history.Response",
        Request: "budget.subaccount.subaccounts.history.Request"
      }
    }
  },
  Account: {
    SetId: "budget.account.SetId",
    Loading: "budget.account.Loading",
    Response: "budget.account.Response",
    Request: "budget.account.Request",
    UpdateInState: "budget.account.UpdateInState",
    BulkUpdate: "budget.account.BulkUpdate",
    Comments: {
      Loading: "budget.account.comments.Loading",
      Response: "budget.account.comments.Response",
      Request: "budget.account.comments.Request",
      Creating: "budget.account.comments.Creating",
      Deleting: "budget.account.comments.Deleting",
      Updating: "budget.account.comments.Updating",
      Replying: "budget.account.comments.Replying",
      Delete: "budget.account.comments.Delete",
      Update: "budget.account.comments.Update",
      Create: "budget.account.comments.Create",
      AddToState: "budget.account.comments.AddToState",
      RemoveFromState: "budget.account.comments.RemoveFromState",
      UpdateInState: "budget.account.comments.UpdateInState"
    },
    SubAccounts: {
      Loading: "budget.account.subaccounts.Loading",
      Response: "budget.account.subaccounts.Response",
      Request: "budget.account.subaccounts.Request",
      Select: "budget.account.subaccounts.Select",
      Deselect: "budget.account.subaccounts.Deselect",
      SelectAll: "budget.account.subaccounts.SelectAll",
      Deleting: "budget.account.subaccounts.Deleting",
      Creating: "budget.account.subaccounts.Creating",
      Updating: "budget.account.subaccounts.Updating",
      Update: "budget.account.subaccounts.Update",
      Remove: "budget.account.subaccounts.Remove",
      SetSearch: "budget.account.subaccounts.SetSearch",
      UpdateInState: "budget.account.subaccounts.UpdateInState",
      RemoveFromState: "budget.account.subaccounts.RemoveFromState",
      AddToState: "budget.account.subaccounts.AddToState",
      RemoveFromGroup: "budget.account.subaccounts.RemoveFromGroup",
      // Errors Functionality Needs to be Built Back In
      AddErrors: "budget.account.subaccounts.AddErrors",
      Placeholders: {
        AddToState: "budget.account.subaccounts.placeholders.AddToState",
        Activate: "budget.account.subaccounts.placeholders.Activate",
        UpdateInState: "budget.account.subaccounts.placeholders.UpdateInState",
        RemoveFromState: "budget.account.subaccounts.placeholders.RemoveFromState"
      },
      Groups: {
        Response: "budget.account.subaccounts.groups.Response",
        Request: "budget.account.subaccounts.groups.Request",
        Loading: "budget.account.subaccounts.groups.Loading",
        Delete: "budget.account.subaccounts.groups.Delete",
        Deleting: "budget.account.subaccounts.groups.Deleting",
        AddToState: "budget.account.subaccounts.groups.AddToState",
        RemoveFromState: "budget.account.subaccounts.groups.RemoveFromState",
        UpdateInState: "budget.account.subaccounts.groups.UpdateInState"
      },
      History: {
        Loading: "budget.account.subaccounts.history.Loading",
        Response: "budget.account.subaccounts.history.Response",
        Request: "budget.account.subaccounts.history.Request"
      }
    }
  },
  BudgetItems: {
    Loading: "budget.budgetitems.Loading",
    Response: "budget.budgetitems.Response",
    Request: "budget.budgetitems.Request"
  },
  BudgetItemsTree: {
    Loading: "budget.budgetitemstree.Loading",
    Response: "budget.budgetitemstree.Response",
    Request: "budget.budgetitemstree.Request"
  },
  Actuals: {
    Deleting: "budget.actuals.Deleting",
    Creating: "budget.actuals.Creating",
    Updating: "budget.actuals.Updating",
    Update: "budget.actuals.Update",
    Remove: "budget.actuals.Remove",
    Select: "budget.actuals.Select",
    Deselect: "budget.actuals.Deselect",
    SelectAll: "budget.actuals.SelectAll",
    Loading: "budget.actuals.Loading",
    SetSearch: "budget.actuals.SetSearch",
    Response: "budget.actuals.Response",
    Request: "budget.actuals.Request",
    UpdateInState: "budget.actuals.UpdateInState",
    RemoveFromState: "budget.actuals.RemoveFromState",
    AddToState: "budget.actuals.AddToState",
    // Errors Functionality Needs to be Built Back In
    AddErrors: "budget.actuals.AddErrors",
    Placeholders: {
      AddToState: "budget.actuals.placeholders.AddToState",
      Activate: "budget.actuals.placeholders.Activate",
      UpdateInState: "budget.actuals.placeholders.UpdateInState",
      RemoveFromState: "budget.actuals.placeholders.RemoveFromState"
    }
  }
};

export const setBudgetIdAction = simpleAction<number>(ActionType.Budget.SetId);
export const setInstanceAction = simpleAction<IAccount | ISubAccount | null>(ActionType.SetInstance);
export const requestBudgetAction = simpleAction<null>(ActionType.Budget.Request);
export const loadingBudgetAction = simpleAction<boolean>(ActionType.Budget.Loading);
export const responseBudgetAction = simpleAction<IBudget>(ActionType.Budget.Response);
export const setCommentsHistoryDrawerVisibilityAction = simpleAction<boolean>(
  ActionType.SetCommentsHistoryDrawerVisibility
);

export const requestBudgetItemsAction = simpleAction<null>(ActionType.BudgetItems.Request);
export const loadingBudgetItemsAction = simpleAction<boolean>(ActionType.BudgetItems.Loading);
export const responseBudgetItemsAction = simpleAction<Http.IListResponse<IBudgetItem>>(ActionType.BudgetItems.Response);

export const requestBudgetItemsTreeAction = simpleAction<null>(ActionType.BudgetItemsTree.Request);
export const loadingBudgetItemsTreeAction = simpleAction<boolean>(ActionType.BudgetItemsTree.Loading);
export const responseBudgetItemsTreeAction = simpleAction<Http.IListResponse<IBudgetItemNode>>(
  ActionType.BudgetItemsTree.Response
);

export const requestFringesAction = simpleAction<null>(ActionType.Budget.Fringes.Request);
export const loadingFringesAction = simpleAction<boolean>(ActionType.Budget.Fringes.Loading);
export const responseFringesAction = simpleAction<Http.IListResponse<IFringe>>(ActionType.Budget.Fringes.Response);
export const addFringesPlaceholdersToStateAction = simpleAction<number>(
  ActionType.Budget.Fringes.Placeholders.AddToState
);
