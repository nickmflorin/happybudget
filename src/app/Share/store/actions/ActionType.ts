const ActionType = {
  WipeState: "budget.WipeState",
  SetId: "budget.SetId",
  Loading: "budget.Loading",
  Response: "budget.Response",
  Request: "budget.Request",
  Fringes: {
    Loading: "budget.fringes.Loading",
    Response: "budget.fringes.Response",
    Request: "budget.fringes.Request",
    SetSearch: "budget.fringes.SetSearch"
  },
  Accounts: {
    SetSearch: "budget.accounts.SetSearch",
    Loading: "budget.accounts.Loading",
    Response: "budget.accounts.Response",
    Request: "budget.accounts.Request"
  },
  FringeColors: {
    Response: "budget.fringecolors.Response"
  },
  SubAccountUnits: {
    Response: "budget.subaccountunits.Response"
  },
  SubAccount: {
    SetId: "budget.subaccount.SetId",
    Loading: "budget.subaccount.Loading",
    Response: "budget.subaccount.Response",
    Request: "budget.subaccount.Request",
    SubAccounts: {
      SetSearch: "budget.subaccount.subaccounts.SetSearch",
      Loading: "budget.subaccount.subaccounts.Loading",
      Response: "budget.subaccount.subaccounts.Response",
      Request: "budget.subaccount.subaccounts.Request"
    }
  },
  Account: {
    SetId: "budget.account.SetId",
    Loading: "budget.account.Loading",
    Response: "budget.account.Response",
    Request: "budget.account.Request",
    SubAccounts: {
      Loading: "budget.account.subaccounts.Loading",
      Response: "budget.account.subaccounts.Response",
      Request: "budget.account.subaccounts.Request",
      SetSearch: "budget.account.subaccounts.SetSearch"
    }
  }
};

export default ActionType;
