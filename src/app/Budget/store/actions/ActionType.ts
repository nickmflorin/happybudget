const ActionType = {
  SetId: "budget.SetId",
  Loading: "budget.Loading",
  Response: "budget.Response",
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
  Fringes: {
    TableChanged: "budget.fringes.TableChanged",
    Saving: "budget.fringes.Saving",
    Loading: "budget.fringes.Loading",
    Request: "budget.fringes.Request",
    Response: "budget.fringes.Response",
    AddToState: "budget.fringes.AddToState",
    SetSearch: "budget.fringes.SetSearch",
    Clear: "budget.fringes.Clear"
  },
  FringeColors: {
    Response: "budget.fringecolors.Response"
  },
  ActualTypes: {
    Response: "budget.actualtypes.Response"
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
    AddToState: "budget.accounts.AddToState",
    Clear: "budget.accounts.Clear"
  },
  SubAccount: {
    Request: "budget.subaccount.Request",
    SetId: "budget.subaccount.SetId",
    Loading: "budget.subaccount.Loading",
    Response: "budget.subaccount.Response",
    UpdateInState: "budget.subaccount.UpdateInState",
    SubAccounts: {
      Request: "budget.subaccount.subaccounts.Request",
      TableChanged: "budget.subaccount.subaccounts.TableChanged",
      Saving: "budget.subaccount.subaccounts.Saving",
      SetSearch: "budget.subaccount.subaccounts.SetSearch",
      Loading: "budget.subaccount.subaccounts.Loading",
      Response: "budget.subaccount.subaccounts.Response",
      AddToState: "budget.subaccount.subaccounts.AddToState",
      UpdateRowsInState: "budget.subaccount.subaccounts.UpdateRowsInState",
      Clear: "budget.subaccount.subaccounts.Clear"
    }
  },
  Account: {
    Request: "budget.account.Request",
    SetId: "budget.account.SetId",
    Loading: "budget.account.Loading",
    Response: "budget.account.Response",
    UpdateInState: "budget.account.UpdateInState",
    SubAccounts: {
      Request: "budget.account.subaccounts.Request",
      TableChanged: "budget.account.subaccounts.TableChanged",
      Saving: "budget.account.subaccounts.Saving",
      Loading: "budget.account.subaccounts.Loading",
      Response: "budget.account.subaccounts.Response",
      SetSearch: "budget.account.subaccounts.SetSearch",
      AddToState: "budget.account.subaccounts.AddToState",
      Clear: "budget.account.subaccounts.Clear",
      UpdateRowsInState: "budget.account.subaccounts.UpdateRowsInState"
    }
  },
  ActualOwners: {
    Response: "budget.actualowners.Response",
    Loading: "budget.actualowners.Loading",
    SetSearch: "budget.actualowners.SetSearch"
  },
  Actuals: {
    TableChanged: "budget.actuals.TableChanged",
    Saving: "budget.actuals.Saving",
    Loading: "budget.actuals.Loading",
    SetSearch: "budget.actuals.SetSearch",
    Response: "budget.actuals.Response",
    Request: "budget.actuals.Request",
    AddToState: "budget.actuals.AddToState",
    Clear: "budget.actuals.Clear",
    UpdateRowsInState: "budget.actuals.UpdateRowsInState"
  }
};

export default ActionType;
