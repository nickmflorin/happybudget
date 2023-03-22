import { filter, intersection, includes, isNil } from "lodash";
import { combineReducers } from "redux";

import { redux, budgeting, tabling, context } from "lib";
import { AccountsTable, SubAccountsTable, FringesTable } from "components/tabling";

import * as actions from "../actions/template";
import * as initialState from "../initialState";

const SubAccountColumns = filter(
  SubAccountsTable.Columns,
  (c: Table.Column<Tables.SubAccountRowData, Model.SubAccount>) =>
    tabling.columns.isModelColumn(c) &&
    intersection([c.field], ["variance", "actual", "contact"]).length === 0,
) as Table.ModelColumn<Tables.SubAccountRowData, Model.SubAccount>[];

const AccountColumns = filter(
  AccountsTable.Columns,
  (c: Table.Column<Tables.AccountRowData, Model.Account>) =>
    tabling.columns.isModelColumn(c) &&
    intersection([c.field], ["variance", "actual"]).length === 0,
) as Table.ModelColumn<Tables.AccountRowData, Model.Account>[];

const FringesColumns = filter(
  FringesTable.Columns,
  (c: Table.Column<Tables.FringeRowData, Model.Fringe>) => tabling.columns.isModelColumn(c),
) as Table.ModelColumn<Tables.FringeRowData, Model.Fringe>[];

const subaccountStoreReducer = budgeting.reducers.createAuthenticatedAccountSubAccountStoreReducer<
  Model.Template,
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
  Model.Template,
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

const genericReducer: Redux.Reducer<Modules.Template.Store> = combineReducers({
  /*
	The account and subaccount keys of the reducer are handled separately, but
	they are still in parallel to the other keys of the store - so we just use
	the identity.
	*/
  account: redux.reducers.identityReducer<Redux.ModelIndexedStore<Modules.AccountStore>>({}),
  subaccount: redux.reducers.identityReducer<Redux.ModelIndexedStore<Modules.SubAccountStore>>({}),
  detail: redux.reducers.createDetailReducer<
    Model.Template,
    BudgetActionContext<Model.Template, false>
  >({
    initialState: redux.initialDetailResponseState,
    actions: {
      loading: actions.loadingBudgetAction,
      response: actions.responseBudgetAction,
      updateInState: actions.updateBudgetInStateAction,
    },
  }),
  fringes: budgeting.reducers.createAuthenticatedFringesTableReducer<Model.Template>({
    initialState: redux.initialTableState,
    columns: FringesColumns,
    actions: {
      handleEvent: actions.handleFringesTableEventAction,
      loading: actions.loadingFringesAction,
      response: actions.responseFringesAction,
      setSearch: actions.setFringesSearchAction,
    },
  }),
  accounts: budgeting.reducers.createAuthenticatedAccountsTableReducer<Model.Template>({
    initialState: initialState.initialBudgetState.accounts,
    columns: AccountColumns,
    actions: {
      handleEvent: actions.handleTableEventAction,
      loading: actions.loadingAction,
      response: actions.responseAction,
      setSearch: actions.setSearchAction,
    },
  }),
});

const rootReducer: Redux.Reducer<Modules.Template.Store> = (
  state: Modules.Template.Store = initialState.initialTemplateState,
  action: Redux.Action,
): Modules.Template.Store => {
  let newState = { ...state, ...genericReducer(state, action) };
  if (includes(["template.account", "template.subaccount"], action.label)) {
    if (action.label === "template.account") {
      const a = action as Redux.AnyPayloadAction<
        | SubAccountActionContext<Model.Template, false>
        | SubAccountsTableActionContext<Model.Template, Model.Account, false>
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
          `Invalid ID ${String(id)} received for template account indexed store reducer!`,
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
        | SubAccountActionContext<Model.Template, false>
        | SubAccountsTableActionContext<Model.Template, Model.SubAccount, false>
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
          `Invalid ID ${String(id)} received for template subaccount indexed store reducer!`,
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
