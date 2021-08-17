const ActionType = {
  SubAccountUnits: {
    Response: "subaccountunits.Response",
    Loading: "subaccountunits.Loading"
  },
  FringeColors: {
    Loading: "fringecolors.Loading",
    Response: "fringecolors.colors.Response"
  },
  Budget: {
    WipeState: "budget.WipeState",
    SetCommentsHistoryDrawerVisibility: "budget.SetCommentsHistoryDrawerVisibility",
    SetId: "budget.SetId",
    SetAutoIndex: "budget.SetAutoIndex",
    Loading: "budget.Loading",
    Response: "budget.Response",
    Request: "budget.Request",
    UpdateInState: "budget.UpdateInState",
    HeaderTemplates: {
      Loading: "budget.headertemplates.Loading",
      LoadingDetail: "budget.headertemplates.LoadingDetail",
      Request: "budget.headertemplates.Request",
      Response: "budget.headertemplates.Response",
      AddToState: "budget.headertemplates.AddToState",
      RemoveFromState: "budget.headertemplates.RemoveFromState",
      Load: "budget.headertemplates.Load",
      Display: "budget.headertemplates.Display",
      Clear: "budget.headertemplates.Clear"
    },
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
    Accounts: {
      TableChanged: "budget.accounts.TableChanged",
      Deleting: "budget.accounts.Deleting",
      Creating: "budget.accounts.Creating",
      Updating: "budget.accounts.Updating",
      SetSearch: "budget.accounts.SetSearch",
      Loading: "budget.accounts.Loading",
      Response: "budget.accounts.Response",
      Request: "budget.accounts.Request",
      AddToState: "budget.accounts.AddToState"
    },
    Groups: {
      Response: "budget.groups.Response",
      Request: "budget.groups.Request",
      Loading: "budget.groups.Loading",
      Delete: "budget.groups.Delete",
      Deleting: "budget.groups.Deleting",
      AddToState: "budget.groups.AddToState",
      UpdateInState: "budget.groups.UpdateInState"
    },
    History: {
      Loading: "budget.history.Loading",
      Response: "budget.history.Response",
      Request: "budget.history.Request",
      AddToState: "budget.history.AddToState"
    },
    SubAccount: {
      SetId: "budget.subaccount.SetId",
      Loading: "budget.subaccount.Loading",
      Response: "budget.subaccount.Response",
      Request: "budget.subaccount.Request",
      UpdateInState: "budget.subaccount.UpdateInState",
      TableChanged: "budget.subaccount.TableChanged",
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
      Fringes: {
        TableChanged: "budget.subaccount.table.fringes.TableChanged",
        Deleting: "budget.subaccount.table.fringes.Deleting",
        Creating: "budget.subaccount.table.fringes.Creating",
        Updating: "budget.subaccount.table.fringes.Updating",
        Loading: "budget.subaccount.table.fringes.Loading",
        Response: "budget.subaccount.table.fringes.Response",
        Request: "budget.subaccount.table.fringes.Request",
        AddToState: "budget.subaccount.table.fringes.AddToState",
        SetSearch: "budget.subaccount.table.fringes.SetSearch"
      },
      SubAccounts: {
        Deleting: "budget.subaccount.subaccounts.Deleting",
        Creating: "budget.subaccount.subaccounts.Creating",
        Updating: "budget.subaccount.subaccounts.Updating",
        SetSearch: "budget.subaccount.subaccounts.SetSearch",
        Loading: "budget.subaccount.subaccounts.Loading",
        Response: "budget.subaccount.subaccounts.Response",
        Request: "budget.subaccount.subaccounts.Request",
        AddToState: "budget.subaccount.subaccounts.AddToState"
      },
      Groups: {
        Response: "budget.subaccount.groups.Response",
        Request: "budget.subaccount.groups.Request",
        Loading: "budget.subaccount.groups.Loading",
        Delete: "budget.subaccount.groups.Delete",
        Deleting: "budget.subaccount.groups.Deleting",
        AddToState: "budget.subaccount.groups.AddToState",
        UpdateInState: "budget.subaccount.groups.UpdateInState"
      },
      History: {
        Loading: "budget.subaccount.history.Loading",
        Response: "budget.subaccount.history.Response",
        Request: "budget.subaccount.history.Request"
      }
    },
    Account: {
      SetId: "budget.account.SetId",
      Loading: "budget.account.Loading",
      Response: "budget.account.Response",
      Request: "budget.account.Request",
      UpdateInState: "budget.account.UpdateInState",
      TableChanged: "budget.account.TableChanged",
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
      Fringes: {
        TableChanged: "budget.account.table.fringes.TableChanged",
        Deleting: "budget.account.table.fringes.Deleting",
        Creating: "budget.account.table.fringes.Creating",
        Updating: "budget.account.table.fringes.Updating",
        Loading: "budget.account.table.fringes.Loading",
        Response: "budget.account.table.fringes.Response",
        Request: "budget.account.table.fringes.Request",
        AddToState: "budget.account.table.fringes.AddToState",
        SetSearch: "budget.account.table.fringes.SetSearch"
      },
      SubAccounts: {
        Deleting: "budget.account.subaccounts.Deleting",
        Creating: "budget.account.subaccounts.Creating",
        Updating: "budget.account.subaccounts.Updating",
        Loading: "budget.account.subaccounts.Loading",
        Response: "budget.account.subaccounts.Response",
        Request: "budget.account.subaccounts.Request",
        SetSearch: "budget.account.subaccounts.SetSearch",
        AddToState: "budget.account.subaccounts.AddToState"
      },
      Groups: {
        Response: "budget.account.groups.Response",
        Request: "budget.account.groups.Request",
        Loading: "budget.account.groups.Loading",
        Delete: "budget.account.groups.Delete",
        Deleting: "budget.account.groups.Deleting",
        AddToState: "budget.account.groups.AddToState",
        UpdateInState: "budget.account.groups.UpdateInState"
      },
      History: {
        Loading: "budget.account.history.Loading",
        Response: "budget.account.history.Response",
        Request: "budget.account.history.Request"
      }
    },
    SubAccountsTree: {
      Request: "budget.subaccountstree.Request",
      Loading: "budget.subaccountstree.Loading",
      Response: "budget.subaccountstree.Response",
      SetSearch: "budget.subaccountstree.SetSearch",
      RestoreSearchCache: "budget.subaccountstree.RestoreSearchCache"
    },
    Actuals: {
      TableChanged: "budget.actuals.TableChanged",
      Deleting: "budget.actuals.Deleting",
      Creating: "budget.actuals.Creating",
      Updating: "budget.actuals.Updating",
      Loading: "budget.actuals.Loading",
      SetSearch: "budget.actuals.SetSearch",
      Response: "budget.actuals.Response",
      Request: "budget.actuals.Request",
      AddToState: "budget.actuals.AddToState"
    }
  },
  Template: {
    WipeState: "template.WipeState",
    SetId: "template.SetId",
    SetAutoIndex: "template.SetAutoIndex",
    Loading: "template.Loading",
    Response: "template.Response",
    Request: "template.Request",
    UpdateInState: "template.UpdateInState",
    Accounts: {
      TableChanged: "template.accounts.TableChanged",
      Deleting: "template.accounts.Deleting",
      Creating: "template.accounts.Creating",
      Updating: "template.accounts.Updating",
      SetSearch: "template.accounts.SetSearch",
      Loading: "template.accounts.Loading",
      Response: "template.accounts.Response",
      Request: "template.accounts.Request",
      AddToState: "template.accounts.AddToState"
    },
    Groups: {
      Response: "template.groups.Response",
      Request: "template.groups.Request",
      Loading: "template.groups.Loading",
      Delete: "template.groups.Delete",
      Deleting: "template.groups.Deleting",
      AddToState: "template.groups.AddToState",
      UpdateInState: "template.groups.UpdateInState"
    },
    SubAccount: {
      SetId: "template.subaccount.SetId",
      Loading: "template.subaccount.Loading",
      Response: "template.subaccount.Response",
      Request: "template.subaccount.Request",
      UpdateInState: "template.subaccount.UpdateInState",
      TableChanged: "template.subaccount.TableChanged",
      Fringes: {
        TableChanged: "template.subaccount.table.fringes.TableChanged",
        Deleting: "template.subaccount.table.fringes.Deleting",
        Creating: "template.subaccount.table.fringes.Creating",
        Updating: "template.subaccount.table.fringes.Updating",
        Loading: "template.subaccount.table.fringes.Loading",
        Response: "template.subaccount.table.fringes.Response",
        Request: "template.subaccount.table.fringes.Request",
        AddToState: "template.subaccount.table.fringes.AddToState",
        SetSearch: "template.subaccount.table.fringes.SetSearch"
      },
      SubAccounts: {
        Deleting: "template.subaccount.subaccounts.Deleting",
        Creating: "template.subaccount.subaccounts.Creating",
        Updating: "template.subaccount.subaccounts.Updating",
        SetSearch: "template.subaccount.subaccounts.SetSearch",
        Loading: "template.subaccount.subaccounts.Loading",
        Response: "template.subaccount.subaccounts.Response",
        Request: "template.subaccount.subaccounts.Request",
        AddToState: "template.subaccount.subaccounts.AddToState"
      },
      Groups: {
        Response: "template.subaccount.groups.Response",
        Request: "template.subaccount.groups.Request",
        Loading: "template.subaccount.groups.Loading",
        Delete: "template.subaccount.groups.Delete",
        Deleting: "template.subaccount.groups.Deleting",
        AddToState: "template.subaccount.groups.AddToState",
        UpdateInState: "template.subaccount.groups.UpdateInState"
      }
    },
    Account: {
      SetId: "template.account.SetId",
      Loading: "template.account.Loading",
      Response: "template.account.Response",
      Request: "template.account.Request",
      UpdateInState: "template.account.UpdateInState",
      TableChanged: "template.account.TableChanged",
      Fringes: {
        TableChanged: "template.account.table.fringes.TableChanged",
        Deleting: "template.account.table.fringes.Deleting",
        Creating: "template.account.table.fringes.Creating",
        Updating: "template.account.table.fringes.Updating",
        Loading: "template.account.table.fringes.Loading",
        Response: "template.account.table.fringes.Response",
        Request: "template.account.table.fringes.Request",
        AddToState: "template.account.table.fringes.AddToState",
        SetSearch: "template.account.table.fringes.SetSearch"
      },
      SubAccounts: {
        Loading: "template.account.subaccounts.Loading",
        Response: "template.account.subaccounts.Response",
        Request: "template.account.subaccounts.Request",
        Deleting: "template.account.subaccounts.Deleting",
        Creating: "template.account.subaccounts.Creating",
        Updating: "template.account.subaccounts.Updating",
        SetSearch: "template.account.subaccounts.SetSearch",
        AddToState: "template.account.subaccounts.AddToState"
      },
      Groups: {
        Response: "template.account.groups.Response",
        Request: "template.account.groups.Request",
        Loading: "template.account.groups.Loading",
        Delete: "template.account.groups.Delete",
        Deleting: "template.account.groups.Deleting",
        AddToState: "template.account.groups.AddToState",
        UpdateInState: "template.account.groups.UpdateInState"
      }
    }
  }
};

export default ActionType;
