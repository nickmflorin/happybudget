import * as api from "api";
import { includes, isNil } from "lodash";
import { combineReducers } from "redux";

import { redux, budgeting, tabling, context } from "lib";
import { SubAccountsTable, FringesTable, ActualsTable, AccountsTable } from "components/tabling";

import * as actions from "../actions/budget";
import * as initialState from "../initialState";

const SubAccountColumns = tabling.columns.filterModelColumns(SubAccountsTable.Columns);
const ActualColumns = tabling.columns.filterModelColumns(ActualsTable.Columns);
const AccountColumns = tabling.columns.filterModelColumns(AccountsTable.Columns);
const FringesColumns = tabling.columns.filterModelColumns(FringesTable.Columns);

const analysisReducer: Redux.Reducer<Modules.Budget.AnalysisStore> = (
  state: Modules.Budget.AnalysisStore = initialState.initialBudgetState.analysis,
  action: Redux.Action,
): Modules.Budget.AnalysisStore => {
  if (action.type === actions.analysis.loadingAction.toString()) {
    return { ...state, loading: action.payload };
  } else if (action.type === actions.analysis.requestAction.toString()) {
    return { ...state, responseWasReceived: false };
  } else if (action.type === actions.analysis.responseAction.toString()) {
    const response: {
      groups: Http.ApiListResponse<Model.Group>;
      accounts: Http.ApiListResponse<Model.Account>;
      actuals: Http.ApiListResponse<Model.Actual>;
      error: api.RequestError | null;
    } = action.payload;
    return {
      ...state,
      responseWasReceived: true,
      accounts: response.accounts,
      groups: response.groups,
      actuals: response.actuals,
    };
  }
  return state;
};

const subaccountStoreReducer = budgeting.reducers.createAuthenticatedAccountSubAccountStoreReducer<
  Model.Budget,
  Model.SubAccount
>({
  initialState: initialState.initialSubAccountState,
  columns: SubAccountColumns,
  actions: {
    loading: actions.subAccount.loadingSubAccountAction,
    response: actions.subAccount.responseSubAccountAction,
    updateInState: actions.subAccount.updateInStateAction,
    invalidate: actions.subAccount.invalidateSubAccountAction,
  },
  tableActions: {
    request: actions.subAccount.requestAction,
    handleEvent: actions.subAccount.handleTableEventAction,
    loading: actions.subAccount.loadingAction,
    response: actions.subAccount.responseAction,
    setSearch: actions.subAccount.setSearchAction,
    invalidate: actions.subAccount.invalidateAction,
  },
});

const accountStoreReducer = budgeting.reducers.createAuthenticatedAccountSubAccountStoreReducer<
  Model.Budget,
  Model.Account
>({
  initialState: initialState.initialAccountState,
  columns: SubAccountColumns,
  actions: {
    loading: actions.account.loadingAccountAction,
    response: actions.account.responseAccountAction,
    updateInState: actions.account.updateInStateAction,
    invalidate: actions.account.invalidateAccountAction,
  },
  tableActions: {
    request: actions.account.requestAction,
    handleEvent: actions.account.handleTableEventAction,
    loading: actions.account.loadingAction,
    response: actions.account.responseAction,
    setSearch: actions.account.setSearchAction,
    invalidate: actions.account.invalidateAction,
  },
});

const genericReducer: Redux.Reducer<Modules.Budget.Store> = combineReducers({
  /*
	The account and subaccount keys of the reducer are handled separately, but
	they are still in parallel to the other keys of the store - so we just use
	the identity.
	*/
  account: redux.reducers.identityReducer<Redux.ModelIndexedStore<Modules.AccountStore>>({}),
  subaccount: redux.reducers.identityReducer<Redux.ModelIndexedStore<Modules.SubAccountStore>>({}),
  detail: redux.reducers.createDetailReducer<
    Model.Budget,
    BudgetActionContext<Model.Budget, false>
  >({
    initialState: redux.initialDetailResponseState,
    actions: {
      loading: actions.loadingBudgetAction,
      response: actions.responseBudgetAction,
      updateInState: actions.updateBudgetInStateAction,
    },
  }),
  analysis: analysisReducer,
  fringes: budgeting.reducers.createAuthenticatedFringesTableReducer<Model.Budget>({
    initialState: redux.initialTableState,
    columns: FringesColumns,
    actions: {
      handleEvent: actions.handleFringesTableEventAction,
      loading: actions.loadingFringesAction,
      response: actions.responseFringesAction,
      setSearch: actions.setFringesSearchAction,
    },
  }),
  accounts: budgeting.reducers.createAuthenticatedAccountsTableReducer<Model.Budget>({
    initialState: initialState.initialBudgetState.accounts,
    columns: AccountColumns,
    actions: {
      handleEvent: actions.handleTableEventAction,
      loading: actions.loadingAction,
      response: actions.responseAction,
      setSearch: actions.setSearchAction,
    },
  }),
  actuals: budgeting.reducers.createAuthenticatedActualsTableReducer({
    initialState: initialState.initialBudgetState.actuals,
    actions: {
      handleEvent: actions.actuals.handleTableEventAction,
      loading: actions.actuals.loadingAction,
      response: actions.actuals.responseAction,
      setSearch: actions.actuals.setSearchAction,
    },
    columns: ActualColumns,
    owners: redux.reducers.createAuthenticatedModelListReducer<
      Model.ActualOwner,
      ActualsTableActionContext
    >({
      initialState: redux.initialAuthenticatedApiModelListResponseState,
      actions: {
        loading: actions.actuals.loadingActualOwnersAction,
        response: actions.actuals.responseActualOwnersAction,
        setSearch: actions.actuals.setActualOwnersSearchAction,
      },
    }),
  }),
});

const rootReducer: Redux.Reducer<Modules.Budget.Store> = (
  state: Modules.Budget.Store = initialState.initialBudgetState,
  action: Redux.Action,
): Modules.Budget.Store => {
  let newState = { ...state, ...genericReducer(state, action) };
  if (includes(["budget.account", "budget.subaccount"], action.label)) {
    if (action.label === "budget.account") {
      const a = action as Redux.AnyPayloadAction<
        | SubAccountActionContext<Model.Budget, false>
        | SubAccountsTableActionContext<Model.Budget, Model.Account, false>
      >;
      const id = context.isSubAccountsTableActionContext(a.context)
        ? a.context.parentId
        : a.context.id;
      /*
			Even though this should not happen, and it is typed to not happen, it
			has happened - and can lead to strange behavior without a clear
			indication of what the root cause was. */
      if (typeof id !== "number") {
        console.error(
          `Invalid ID ${String(id)} received for budget account indexed store reducer!`,
        );
        return newState;
      }
      if (isNil(newState.account[id])) {
        newState = {
          ...newState,
          account: { ...newState.account, [id]: initialState.initialAccountState },
        };
      }
      newState = {
        ...newState,
        account: {
          ...newState.account,
          [id]: accountStoreReducer(newState.account[id], a, newState.fringes),
        },
      };
    } else {
      const a = action as Redux.AnyPayloadAction<
        | SubAccountActionContext<Model.Budget, false>
        | SubAccountsTableActionContext<Model.Budget, Model.SubAccount, false>
      >;
      const id = context.isSubAccountsTableActionContext(a.context)
        ? a.context.parentId
        : a.context.id;
      /*
			Even though this should not happen, and it is typed to not happen, it
			has happened - and can lead to strange behavior without a clear
			indication of what the root cause was. */
      if (typeof id !== "number") {
        console.error(
          `Invalid ID ${String(id)} received for budget subaccount indexed store reducer!`,
        );
        return newState;
      }
      if (isNil(newState.subaccount[id])) {
        newState = {
          ...newState,
          subaccount: { ...newState.subaccount, [id]: initialState.initialSubAccountState },
        };
      }
      newState = {
        ...newState,
        subaccount: {
          ...newState.subaccount,
          [id]: subaccountStoreReducer(newState.subaccount[id], a, newState.fringes),
        },
      };
    }
  }
  return newState;
};

export default rootReducer;
