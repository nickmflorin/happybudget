import * as api from "api";

import ActionType, { loadingBudgetAction } from "../actions";
import * as actions from "../actions/accounts";
import { createStandardSaga, createAccountsTaskSet } from "./factories";

const tasks = createAccountsTaskSet(
  {
    loading: actions.loadingAccountsAction,
    request: actions.requestAccountsAction,
    response: actions.responseAccountsAction,

    budget: { loading: loadingBudgetAction },
    groups: {
      loading: actions.loadingGroupsAction,
      response: actions.responseGroupsAction,
      request: actions.requestGroupsAction
    }
  },
  {
    getAccounts: api.getBudgetAccounts,
    getGroups: api.getBudgetAccountGroups
  },
  (state: Modules.Unauthenticated.StoreObj) => state.share.budget.id
);

export default createStandardSaga(
  {
    Request: ActionType.Budget.Accounts.Request,
    Groups: { Request: ActionType.Budget.Groups.Request }
  },
  tasks
);
