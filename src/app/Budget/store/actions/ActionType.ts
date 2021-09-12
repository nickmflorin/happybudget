const ActionType = {
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
  Fringes: {
    TableChanged: "budget.fringes.TableChanged",
    Saving: "budget.fringes.Saving",
    Loading: "budget.fringes.Loading",
    Request: "budget.fringes.Request",
    Response: "budget.fringes.Response",
    AddToState: "budget.fringes.AddToState",
    SetSearch: "budget.fringes.SetSearch"
  },
  FringeColors: {
    Response: "budget.fringecolors.Response"
  },
  SubAccountUnits: {
    Response: "budget.subaccountunits.Response"
  },
  Accounts: {
    TableChanged: "budget.accounts.TableChanged",
    Saving: "budget.accounts.Saving",
    SetSearch: "budget.accounts.SetSearch",
    Loading: "budget.accounts.Loading",
    Response: "budget.accounts.Response",
    Request: "budget.accounts.Request",
    AddToState: "budget.accounts.AddToState"
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
      TableChanged: "budget.subaccount.subaccounts.TableChanged",
      Saving: "budget.subaccount.subaccounts.Saving",
      SetSearch: "budget.subaccount.subaccounts.SetSearch",
      Loading: "budget.subaccount.subaccounts.Loading",
      Response: "budget.subaccount.subaccounts.Response",
      Request: "budget.subaccount.subaccounts.Request",
      AddToState: "budget.subaccount.subaccounts.AddToState"
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
      TableChanged: "budget.account.subaccounts.TableChanged",
      Saving: "budget.account.subaccounts.Saving",
      Loading: "budget.account.subaccounts.Loading",
      Response: "budget.account.subaccounts.Response",
      Request: "budget.account.subaccounts.Request",
      SetSearch: "budget.account.subaccounts.SetSearch",
      AddToState: "budget.account.subaccounts.AddToState"
    },
    History: {
      Loading: "budget.account.history.Loading",
      Response: "budget.account.history.Response",
      Request: "budget.account.history.Request"
    }
  },
  SubAccountsTree: {
    Response: "budget.subaccountstree.Response",
    Loading: "budget.subaccountstree.Loading",
    SetSearch: "budget.subaccountstree.SetSearch",
    RestoreSearchCache: "budget.subaccountstree.RestoreSearchCache"
  },
  Actuals: {
    TableChanged: "budget.actuals.TableChanged",
    Saving: "budget.actuals.Saving",
    Loading: "budget.actuals.Loading",
    SetSearch: "budget.actuals.SetSearch",
    Response: "budget.actuals.Response",
    Request: "budget.actuals.Request",
    AddToState: "budget.actuals.AddToState"
  }
};

export default ActionType;
