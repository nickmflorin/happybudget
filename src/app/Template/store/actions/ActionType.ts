const ActionType = {
  SetId: "template.SetId",
  Loading: "template.Loading",
  Response: "template.Response",
  UpdateInState: "template.UpdateInState",
  Accounts: {
    TableChanged: "template.accounts.TableChanged",
    Saving: "template.accounts.Saving",
    SetSearch: "template.accounts.SetSearch",
    Loading: "template.accounts.Loading",
    Response: "template.accounts.Response",
    Request: "template.accounts.Request",
    AddToState: "template.accounts.AddToState",
    Clear: "template.accounts.Clear"
  },
  Fringes: {
    TableChanged: "template.fringes.TableChanged",
    Saving: "template.fringes.Saving",
    Loading: "template.fringes.Loading",
    Response: "template.fringes.Response",
    Request: "template.fringes.Request",
    AddToState: "template.fringes.AddToState",
    SetSearch: "template.fringes.SetSearch",
    Clear: "template.fringes.Clear"
  },
  SubAccountUnits: {
    Response: "template.subaccountunits.Response"
  },
  FringeColors: {
    Response: "template.fringecolors.Response"
  },
  SubAccount: {
    Request: "template.subaccount.Request",
    UpdateInState: "template.subaccount.UpdateInState",
    SetId: "template.subaccount.SetId",
    Loading: "template.subaccount.Loading",
    Response: "template.subaccount.Response",
    SubAccounts: {
      Request: "template.subaccount.subaccounts.Request",
      TableChanged: "template.subaccount.subaccounts.TableChanged",
      Saving: "template.subaccount.subaccounts.Saving",
      SetSearch: "template.subaccount.subaccounts.SetSearch",
      Loading: "template.subaccount.subaccounts.Loading",
      Response: "template.subaccount.subaccounts.Response",
      AddToState: "template.subaccount.subaccounts.AddToState",
      UpdateInState: "template.subaccount.subaccounts.AddToState",
      Clear: "template.subaccount.subaccounts.Clear"
    }
  },
  Account: {
    UpdateInState: "template.account.UpdateInState",
    SetId: "template.account.SetId",
    Loading: "template.account.Loading",
    Response: "template.account.Response",
    Request: "template.account.Request",
    SubAccounts: {
      Request: "template.account.subaccounts.Request",
      TableChanged: "template.account.subaccounts.TableChanged",
      Loading: "template.account.subaccounts.Loading",
      Response: "template.account.subaccounts.Response",
      Saving: "template.account.subaccounts.Saving",
      SetSearch: "template.account.subaccounts.SetSearch",
      AddToState: "template.account.subaccounts.AddToState",
      UpdateInState: "template.account.subaccounts.UpdateInState",
      Clear: "template.account.subaccounts.Clear"
    }
  }
};

export default ActionType;
