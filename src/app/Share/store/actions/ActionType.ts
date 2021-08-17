const ActionType = {
  SubAccountUnits: {
    Response: "subaccountunits.Response",
    Loading: "subaccountunits.Loading"
  },
  Budget: {
    WipeState: "budget.WipeState",
    SetId: "budget.SetId",
    Loading: "budget.Loading",
    Response: "budget.Response",
    Request: "budget.Request",
    Accounts: {
      SetSearch: "budget.accounts.SetSearch",
      Loading: "budget.accounts.Loading",
      Response: "budget.accounts.Response",
      Request: "budget.accounts.Request"
    },
    Groups: {
      Response: "budget.groups.Response",
      Request: "budget.groups.Request",
      Loading: "budget.groups.Loading"
    },
    SubAccount: {
      SetId: "budget.subaccount.SetId",
      Loading: "budget.subaccount.Loading",
      Response: "budget.subaccount.Response",
      Request: "budget.subaccount.Request",
      Fringes: {
        Loading: "budget.subaccount.table.fringes.Loading",
        Response: "budget.subaccount.table.fringes.Response",
        Request: "budget.subaccount.table.fringes.Request"
      },
      SubAccounts: {
        SetSearch: "budget.subaccount.subaccounts.SetSearch",
        Loading: "budget.subaccount.subaccounts.Loading",
        Response: "budget.subaccount.subaccounts.Response",
        Request: "budget.subaccount.subaccounts.Request"
      },
      Groups: {
        Response: "budget.subaccount.groups.Response",
        Request: "budget.subaccount.groups.Request",
        Loading: "budget.subaccount.groups.Loading"
      }
    },
    Account: {
      SetId: "budget.account.SetId",
      Loading: "budget.account.Loading",
      Response: "budget.account.Response",
      Request: "budget.account.Request",
      Fringes: {
        Loading: "budget.account.table.fringes.Loading",
        Response: "budget.account.table.fringes.Response",
        Request: "budget.account.table.fringes.Request"
      },
      SubAccounts: {
        Loading: "budget.account.subaccounts.Loading",
        Response: "budget.account.subaccounts.Response",
        Request: "budget.account.subaccounts.Request",
        SetSearch: "budget.account.subaccounts.SetSearch"
      },
      Groups: {
        Response: "budget.account.groups.Response",
        Request: "budget.account.groups.Request",
        Loading: "budget.account.groups.Loading"
      }
    }
  }
};

export default ActionType;
