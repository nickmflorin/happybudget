const ActionType = {
  SetId: "share.SetId",
  Loading: "share.Loading",
  Response: "share.Response",
  Fringes: {
    Loading: "share.fringes.Loading",
    Response: "share.fringes.Response",
    Request: "share.fringes.Request",
    SetSearch: "share.fringes.SetSearch",
    Clear: "shares.fringes.Clear"
  },
  Accounts: {
    SetSearch: "share.accounts.SetSearch",
    Loading: "share.accounts.Loading",
    Response: "share.accounts.Response",
    Request: "share.accounts.Request",
    Clear: "share.accounts.Clear"
  },
  FringeColors: {
    Response: "share.fringecolors.Response"
  },
  SubAccountUnits: {
    Response: "share.subaccountunits.Response"
  },
  SubAccount: {
    SetId: "share.subaccount.SetId",
    Loading: "share.subaccount.Loading",
    Response: "share.subaccount.Response",
    Request: "share.subaccount.Request",
    SubAccounts: {
      SetSearch: "share.subaccount.subaccounts.SetSearch",
      Loading: "share.subaccount.subaccounts.Loading",
      Response: "share.subaccount.subaccounts.Response",
      Request: "share.subaccount.subaccounts.Request",
      Clear: "share.subaccount.subaccounts.Clear"
    }
  },
  Account: {
    SetId: "share.account.SetId",
    Loading: "share.account.Loading",
    Response: "share.account.Response",
    Request: "share.account.Request",
    SubAccounts: {
      Loading: "share.account.subaccounts.Loading",
      Response: "share.account.subaccounts.Response",
      Request: "share.account.subaccounts.Request",
      SetSearch: "share.account.subaccounts.SetSearch",
      Clear: "share.account.subaccounts.Clear"
    }
  }
};

export default ActionType;
