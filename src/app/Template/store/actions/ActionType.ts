const ActionType = {
  WipeState: "template.WipeState",
  SetId: "template.SetId",
  SetAutoIndex: "template.SetAutoIndex",
  Loading: "template.Loading",
  Response: "template.Response",
  Request: "template.Request",
  UpdateInState: "template.UpdateInState",
  Accounts: {
    TableChanged: "template.accounts.TableChanged",
    Saving: "template.accounts.Saving",
    SetSearch: "template.accounts.SetSearch",
    Loading: "template.accounts.Loading",
    Response: "template.accounts.Response",
    Request: "template.accounts.Request",
    AddToState: "template.accounts.AddToState",
    AddPlaceholdersToState: "template.accounts.AddPlaceholdersToState"
  },
  Groups: {
    AddToState: "template.groups.AddToState",
    UpdateInState: "template.groups.UpdateInState"
  },
  Fringes: {
    TableChanged: "template.fringes.TableChanged",
    Saving: "template.fringes.Saving",
    Loading: "template.fringes.Loading",
    Response: "template.fringes.Response",
    Request: "template.fringes.Request",
    AddToState: "template.fringes.AddToState",
    AddPlaceholdersToState: "template.fringes.AddPlaceholdersToState",
    SetSearch: "template.fringes.SetSearch"
  },
  SubAccountUnits: {
    Response: "template.subaccountunits.Response"
  },
  FringeColors: {
    Response: "template.fringecolors.Response"
  },
  SubAccount: {
    SetId: "template.subaccount.SetId",
    Loading: "template.subaccount.Loading",
    Response: "template.subaccount.Response",
    Request: "template.subaccount.Request",
    UpdateInState: "template.subaccount.UpdateInState",
    SubAccounts: {
      TableChanged: "template.subaccount.subaccounts.TableChanged",
      Saving: "template.subaccount.subaccounts.Saving",
      SetSearch: "template.subaccount.subaccounts.SetSearch",
      Loading: "template.subaccount.subaccounts.Loading",
      Response: "template.subaccount.subaccounts.Response",
      Request: "template.subaccount.subaccounts.Request",
      AddToState: "template.subaccount.subaccounts.AddToState",
      AddPlaceholdersToState: "template.subaccount.subaccounts.AddPlaceholdersToState"
    },
    Groups: {
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
    SubAccounts: {
      TableChanged: "template.account.subaccounts.TableChanged",
      Loading: "template.account.subaccounts.Loading",
      Response: "template.account.subaccounts.Response",
      Request: "template.account.subaccounts.Request",
      Saving: "template.account.subaccounts.Saving",
      SetSearch: "template.account.subaccounts.SetSearch",
      AddToState: "template.account.subaccounts.AddToState",
      AddPlaceholdersToState: "template.account.subaccounts.AddPlaceholdersToState"
    },
    Groups: {
      AddToState: "template.account.groups.AddToState",
      UpdateInState: "template.account.groups.UpdateInState"
    }
  }
};

export default ActionType;
