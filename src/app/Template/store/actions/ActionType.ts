const ActionType = {
  Loading: "template.Loading",
  Response: "template.Response",
  Request: "template.Request",
  UpdateInState: "template.UpdateInState",
  Accounts: {
    TableChanged: "template.accounts.TableChanged",
    SetSearch: "template.accounts.SetSearch",
    Loading: "template.accounts.Loading",
    Response: "template.accounts.Response",
    Request: "template.accounts.Request",
    AddToState: "template.accounts.AddToState"
  },
  Fringes: {
    TableChanged: "template.fringes.TableChanged",
    Loading: "template.fringes.Loading",
    Response: "template.fringes.Response",
    Request: "template.fringes.Request",
    AddToState: "template.fringes.AddToState",
    SetSearch: "template.fringes.SetSearch"
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
    Loading: "template.subaccount.Loading",
    Response: "template.subaccount.Response",
    SubAccounts: {
      Request: "template.subaccount.subaccounts.Request",
      TableChanged: "template.subaccount.subaccounts.TableChanged",
      SetSearch: "template.subaccount.subaccounts.SetSearch",
      Loading: "template.subaccount.subaccounts.Loading",
      Response: "template.subaccount.subaccounts.Response",
      AddToState: "template.subaccount.subaccounts.AddToState"
    }
  },
  Account: {
    UpdateInState: "template.account.UpdateInState",
    Loading: "template.account.Loading",
    Response: "template.account.Response",
    Request: "template.account.Request",
    SubAccounts: {
      Request: "template.account.subaccounts.Request",
      TableChanged: "template.account.subaccounts.TableChanged",
      Loading: "template.account.subaccounts.Loading",
      Response: "template.account.subaccounts.Response",
      SetSearch: "template.account.subaccounts.SetSearch",
      AddToState: "template.account.subaccounts.AddToState"
    }
  }
};

export default ActionType;
