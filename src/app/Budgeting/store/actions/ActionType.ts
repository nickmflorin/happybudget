const ActionType: { [key: string]: any } = {
  Budget: {
    SetInstance: "budget.SetInstance",
    SetCommentsHistoryDrawerVisibility: "budget.SetCommentsHistoryDrawerVisibility",
    SetId: "budget.budget.SetId",
    Loading: "budget.Loading",
    Response: "budget.Response",
    Request: "budget.Request",
    BulkUpdateAccounts: "budget.BulkUpdateAccounts",
    BulkUpdateActuals: "budget.BulkUpdateActuals",
    BulkUpdateFringes: "budget.BulkUpdateFringes",
    Comments: {
      Loading: "budget.comments.Loading",
      Response: "budget.comments.Response",
      Request: "budget.comments.Request",
      Delete: "budget.comments.Delete",
      Update: "budget.comments.Update",
      Create: "budget.comments.Create",
      Creating: "budget.comments.Creating",
      Deleting: "budget.comments.Deleting",
      Updating: "budget.comments.Updating",
      Replying: "budget.comments.Replying",
      AddToState: "budget.comments.AddToState",
      RemoveFromState: "budget.comments.RemoveFromState",
      UpdateInState: "budget.comments.UpdateInState"
    },
    Fringes: {
      Deleting: "budget.fringes.Deleting",
      Creating: "budget.fringes.Creating",
      Updating: "budget.fringes.Updating",
      Loading: "budget.fringes.Loading",
      Response: "budget.fringes.Response",
      Remove: "budget.fringes.Remove",
      Update: "budget.fringes.Update",
      AddToState: "budget.fringes.AddToState",
      RemoveFromState: "budget.fringes.RemoveFromState",
      UpdateInState: "budget.fringes.UpdateInState",
      SetSearch: "budget.fringes.SetSearch",
      Select: "budget.fringes.Select",
      Deselect: "budget.fringes.Deselect",
      SelectAll: "budget.fringes.SelectAll",
      // Errors Functionality Needs to be Built Back In
      AddErrors: "budget.fringes.AddErrors",
      Placeholders: {
        AddToState: "budget.fringes.placeholders.AddToState",
        Activate: "budget.fringes.placeholders.Activate",
        Clear: "budget.fringes.placeholders.Clear",
        UpdateInState: "budget.fringes.placeholders.UpdateInState",
        RemoveFromState: "budget.fringes.placeholders.RemoveFromState"
      }
    },
    Accounts: {
      Deleting: "budget.accounts.Deleting",
      Creating: "budget.accounts.Creating",
      Updating: "budget.accounts.Updating",
      Update: "budget.accounts.Update",
      Remove: "budget.accounts.Remove",
      SetSearch: "budget.accounts.SetSearch",
      Loading: "budget.accounts.Loading",
      Select: "budget.accounts.Select",
      Deselect: "budget.accounts.Deselect",
      SelectAll: "budget.accounts.SelectAll",
      Response: "budget.accounts.Response",
      Request: "budget.accounts.Request",
      UpdateInState: "budget.accounts.UpdateInState",
      RemoveFromState: "budget.accounts.RemoveFromState",
      AddToState: "budget.accounts.AddToState",
      RemoveFromGroup: "budget.accounts.RemoveFromGroup",
      // Errors Functionality Needs to be Built Back In
      AddErrors: "budget.accounts.AddErrors",
      Placeholders: {
        AddToState: "budget.accounts.placeholders.AddToState",
        Activate: "budget.accounts.placeholders.Activate",
        UpdateInState: "budget.accounts.placeholders.UpdateInState",
        RemoveFromState: "budget.accounts.placeholders.RemoveFromState"
      },
      Groups: {
        Response: "budget.accounts.groups.Response",
        Request: "budget.accounts.groups.Request",
        Loading: "budget.accounts.groups.Loading",
        Delete: "budget.accounts.groups.Delete",
        Deleting: "budget.accounts.groups.Deleting",
        AddToState: "budget.accounts.groups.AddToState",
        RemoveFromState: "budget.accounts.groups.RemoveFromState",
        UpdateInState: "budget.accounts.groups.UpdateInState"
      },
      History: {
        Loading: "budget.accounts.history.Loading",
        Response: "budget.accounts.history.Response",
        Request: "budget.accounts.history.Request",
        AddToState: "budget.accounts.history.AddToState"
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
      Response: "budget.budgetitems.Response"
    },
    BudgetItemsTree: {
      Loading: "budget.budgetitemstree.Loading",
      Response: "budget.budgetitemstree.Response"
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
  },
  Template: {
    SetInstance: "template.SetInstance",
    SetId: "template.SetId",
    Loading: "template.Loading",
    Response: "template.Response",
    Request: "template.Request",
    BulkUpdateAccounts: "template.BulkUpdateAccounts",
    BulkUpdateActuals: "template.BulkUpdateActuals",
    BulkUpdateFringes: "template.BulkUpdateFringes",
    Fringes: {
      Deleting: "template.fringes.Deleting",
      Creating: "template.fringes.Creating",
      Updating: "template.fringes.Updating",
      Loading: "template.fringes.Loading",
      Response: "template.fringes.Response",
      Remove: "template.fringes.Remove",
      Update: "template.fringes.Update",
      AddToState: "template.fringes.AddToState",
      RemoveFromState: "template.fringes.RemoveFromState",
      UpdateInState: "template.fringes.UpdateInState",
      SetSearch: "template.fringes.SetSearch",
      Select: "template.fringes.Select",
      Deselect: "template.fringes.Deselect",
      SelectAll: "template.fringes.SelectAll",
      // Errors Functionality Needs to be Built Back In
      AddErrors: "template.fringes.AddErrors",
      Placeholders: {
        AddToState: "template.fringes.placeholders.AddToState",
        Activate: "template.fringes.placeholders.Activate",
        Clear: "template.fringes.placeholders.Clear",
        UpdateInState: "template.fringes.placeholders.UpdateInState",
        RemoveFromState: "template.fringes.placeholders.RemoveFromState"
      }
    },
    Accounts: {
      Deleting: "template.accounts.Deleting",
      Creating: "template.accounts.Creating",
      Updating: "template.accounts.Updating",
      Update: "template.accounts.Update",
      Remove: "template.accounts.Remove",
      SetSearch: "template.accounts.SetSearch",
      Loading: "template.accounts.Loading",
      Select: "template.accounts.Select",
      Deselect: "template.accounts.Deselect",
      SelectAll: "template.accounts.SelectAll",
      Response: "template.accounts.Response",
      Request: "template.accounts.Request",
      UpdateInState: "template.accounts.UpdateInState",
      RemoveFromState: "template.accounts.RemoveFromState",
      AddToState: "template.accounts.AddToState",
      RemoveFromGroup: "template.accounts.RemoveFromGroup",
      // Errors Functionality Needs to be Built Back In
      AddErrors: "template.accounts.AddErrors",
      Placeholders: {
        AddToState: "template.accounts.placeholders.AddToState",
        Activate: "template.accounts.placeholders.Activate",
        UpdateInState: "template.accounts.placeholders.UpdateInState",
        RemoveFromState: "template.accounts.placeholders.RemoveFromState"
      },
      Groups: {
        Response: "template.accounts.groups.Response",
        Request: "template.accounts.groups.Request",
        Loading: "template.accounts.groups.Loading",
        Delete: "template.accounts.groups.Delete",
        Deleting: "template.accounts.groups.Deleting",
        AddToState: "template.accounts.groups.AddToState",
        RemoveFromState: "template.accounts.groups.RemoveFromState",
        UpdateInState: "template.accounts.groups.UpdateInState"
      }
    },
    SubAccount: {
      SetId: "template.subaccount.SetId",
      Loading: "template.subaccount.Loading",
      Response: "template.subaccount.Response",
      Request: "template.subaccount.Request",
      UpdateInState: "template.subaccount.UpdateInState",
      BulkUpdate: "template.subaccount.BulkUpdate",
      SubAccounts: {
        Deleting: "template.subaccount.subaccounts.Deleting",
        Creating: "template.subaccount.subaccounts.Creating",
        Updating: "template.subaccount.subaccounts.Updating",
        Update: "template.subaccount.subaccounts.Update",
        Remove: "template.subaccount.subaccounts.Remove",
        SetSearch: "template.subaccount.subaccounts.SetSearch",
        Loading: "template.subaccount.subaccounts.Loading",
        Select: "template.subaccount.subaccounts.Select",
        Deselect: "template.subaccount.subaccounts.Deselect",
        SelectAll: "template.subaccount.subaccounts.SelectAll",
        Response: "template.subaccount.subaccounts.Response",
        Request: "template.subaccount.subaccounts.Request",
        UpdateInState: "template.subaccount.subaccounts.UpdateInState",
        RemoveFromState: "template.subaccount.subaccounts.RemoveFromState",
        AddToState: "template.subaccount.subaccounts.AddToState",
        RemoveFromGroup: "template.subaccount.subaccounts.RemoveFromGroup",
        // Errors Functionality Needs to be Built Back In
        AddErrors: "template.subaccount.subaccounts.AddErrors",
        Placeholders: {
          AddToState: "template.subaccount.subaccounts.placeholders.AddToState",
          Activate: "template.subaccount.subaccounts.placeholders.Activate",
          UpdateInState: "template.subaccount.subaccounts.placeholders.UpdateInState",
          RemoveFromState: "template.subaccount.subaccounts.placeholders.RemoveFromState"
        },
        Groups: {
          Response: "template.subaccount.subaccounts.groups.Response",
          Request: "template.subaccount.subaccounts.groups.Request",
          Loading: "template.subaccount.subaccounts.groups.Loading",
          Delete: "template.subaccount.subaccounts.groups.Delete",
          Deleting: "template.subaccount.subaccounts.groups.Deleting",
          AddToState: "template.subaccount.subaccounts.groups.AddToState",
          RemoveFromState: "template.subaccount.subaccounts.groups.RemoveFromState",
          UpdateInState: "template.subaccount.subaccounts.groups.UpdateInState"
        }
      }
    },
    Account: {
      SetId: "template.account.SetId",
      Loading: "template.account.Loading",
      Response: "template.account.Response",
      Request: "template.account.Request",
      UpdateInState: "template.account.UpdateInState",
      BulkUpdate: "template.account.BulkUpdate",
      SubAccounts: {
        Loading: "template.account.subaccounts.Loading",
        Response: "template.account.subaccounts.Response",
        Request: "template.account.subaccounts.Request",
        Select: "template.account.subaccounts.Select",
        Deselect: "template.account.subaccounts.Deselect",
        SelectAll: "template.account.subaccounts.SelectAll",
        Deleting: "template.account.subaccounts.Deleting",
        Creating: "template.account.subaccounts.Creating",
        Updating: "template.account.subaccounts.Updating",
        Update: "template.account.subaccounts.Update",
        Remove: "template.account.subaccounts.Remove",
        SetSearch: "template.account.subaccounts.SetSearch",
        UpdateInState: "template.account.subaccounts.UpdateInState",
        RemoveFromState: "template.account.subaccounts.RemoveFromState",
        AddToState: "template.account.subaccounts.AddToState",
        RemoveFromGroup: "template.account.subaccounts.RemoveFromGroup",
        // Errors Functionality Needs to be Built Back In
        AddErrors: "template.account.subaccounts.AddErrors",
        Placeholders: {
          AddToState: "template.account.subaccounts.placeholders.AddToState",
          Activate: "template.account.subaccounts.placeholders.Activate",
          UpdateInState: "template.account.subaccounts.placeholders.UpdateInState",
          RemoveFromState: "template.account.subaccounts.placeholders.RemoveFromState"
        },
        Groups: {
          Response: "template.account.subaccounts.groups.Response",
          Request: "template.account.subaccounts.groups.Request",
          Loading: "template.account.subaccounts.groups.Loading",
          Delete: "template.account.subaccounts.groups.Delete",
          Deleting: "template.account.subaccounts.groups.Deleting",
          AddToState: "template.account.subaccounts.groups.AddToState",
          RemoveFromState: "template.account.subaccounts.groups.RemoveFromState",
          UpdateInState: "template.account.subaccounts.groups.UpdateInState"
        }
      }
    }
  }
};

export default ActionType;