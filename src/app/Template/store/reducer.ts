import { combineReducers } from "redux";
import { filter, intersection } from "lodash";

import { redux, budgeting, tabling } from "lib";
import { AccountsTable, SubAccountsTable, FringesTable } from "tabling";

import * as actions from "./actions";
import initialState from "./initialState";

const SubAccountColumns = filter(
  SubAccountsTable.Columns,
  (c: Table.Column<Tables.SubAccountRowData, Model.SubAccount>) =>
    tabling.typeguards.isModelColumn(c) && intersection([c.field], ["variance", "actual", "contact"]).length === 0
) as Table.ModelColumn<Tables.SubAccountRowData, Model.SubAccount>[];

const AccountColumns = filter(
  AccountsTable.Columns,
  (c: Table.Column<Tables.AccountRowData, Model.Account>) =>
    tabling.typeguards.isModelColumn(c) && intersection([c.field], ["variance", "actual"]).length === 0
) as Table.ModelColumn<Tables.AccountRowData, Model.Account>[];

const FringesColumns = filter(FringesTable.Columns, (c: Table.Column<Tables.FringeRowData, Model.Fringe>) =>
  tabling.typeguards.isModelColumn(c)
) as Table.ModelColumn<Tables.FringeRowData, Model.Fringe>[];

const genericReducer = combineReducers({
  detail: redux.reducers.createDetailResponseReducer<Model.Template>({
    initialState: redux.initialState.initialDetailResponseState,
    actions: {
      loading: actions.loadingBudgetAction,
      response: actions.responseBudgetAction,
      updateInState: actions.updateBudgetInStateAction
    }
  }),
  accounts: budgeting.reducers.createAuthenticatedAccountsTableReducer({
    initialState: initialState.account.table,
    clearOn: [
      {
        action: actions.accounts.requestAction,
        payload: (p: Redux.TableRequestPayload) => !redux.typeguards.isListRequestIdsPayload(p)
      }
    ],
    actions: {
      tableChanged: actions.accounts.handleTableChangeEventAction,
      loading: actions.accounts.loadingAction,
      response: actions.accounts.responseAction,
      saving: actions.accounts.savingTableAction,
      addModelsToState: actions.accounts.addModelsToStateAction,
      setSearch: actions.accounts.setSearchAction
    },
    columns: AccountColumns,
    getModelRowChildren: (m: Model.Account) => m.children
  }),
  account: budgeting.reducers.createAccountDetailReducer({
    initialState: initialState.account,
    actions: {
      loading: actions.account.loadingAccountAction,
      response: actions.account.responseAccountAction,
      updateInState: actions.account.updateInStateAction
    },
    reducers: {
      table: budgeting.reducers.createAuthenticatedSubAccountsTableReducer({
        initialState: initialState.account.table,
        clearOn: [
          {
            action: actions.account.requestAction,
            payload: (p: Redux.TableRequestPayload) => !redux.typeguards.isListRequestIdsPayload(p)
          }
        ],
        actions: {
          tableChanged: actions.account.handleTableChangeEventAction,
          loading: actions.account.loadingAction,
          response: actions.account.responseAction,
          responseSubAccountUnits: actions.responseSubAccountUnitsAction,
          saving: actions.account.savingTableAction,
          addModelsToState: actions.account.addModelsToStateAction,
          setSearch: actions.account.setSearchAction
        },
        getModelRowChildren: (m: Model.SubAccount) => m.children,
        columns: SubAccountColumns,
        fringes: budgeting.reducers.createAuthenticatedFringesTableReducer({
          initialState: initialState.account.table.fringes,
          columns: FringesColumns,
          clearOn: [actions.requestFringesAction],
          actions: {
            responseFringeColors: actions.responseFringeColorsAction,
            tableChanged: actions.handleFringesTableChangeEventAction,
            loading: actions.loadingFringesAction,
            response: actions.responseFringesAction,
            saving: actions.savingFringesTableAction,
            addModelsToState: actions.addFringeModelsToStateAction,
            setSearch: actions.setFringesSearchAction
          }
        })
      })
    }
  }),
  subaccount: budgeting.reducers.createSubAccountDetailReducer({
    initialState: initialState.subaccount,
    actions: {
      loading: actions.subAccount.loadingSubAccountAction,
      response: actions.subAccount.responseSubAccountAction,
      updateInState: actions.subAccount.updateInStateAction
    },
    reducers: {
      table: budgeting.reducers.createAuthenticatedSubAccountsTableReducer({
        initialState: initialState.subaccount.table,
        clearOn: [
          {
            action: actions.subAccount.requestAction,
            payload: (p: Redux.TableRequestPayload) => !redux.typeguards.isListRequestIdsPayload(p)
          }
        ],
        actions: {
          tableChanged: actions.subAccount.handleTableChangeEventAction,
          responseSubAccountUnits: actions.responseSubAccountUnitsAction,
          loading: actions.subAccount.loadingAction,
          response: actions.subAccount.responseAction,
          saving: actions.subAccount.savingTableAction,
          addModelsToState: actions.subAccount.addModelsToStateAction,
          setSearch: actions.subAccount.setSearchAction
        },
        columns: SubAccountColumns,
        getModelRowChildren: (m: Model.SubAccount) => m.children,
        fringes: budgeting.reducers.createAuthenticatedFringesTableReducer({
          initialState: initialState.subaccount.table.fringes,
          columns: FringesColumns,
          clearOn: [actions.requestFringesAction],
          actions: {
            responseFringeColors: actions.responseFringeColorsAction,
            tableChanged: actions.handleFringesTableChangeEventAction,
            loading: actions.loadingFringesAction,
            response: actions.responseFringesAction,
            saving: actions.savingFringesTableAction,
            addModelsToState: actions.addFringeModelsToStateAction,
            setSearch: actions.setFringesSearchAction
          }
        })
      })
    }
  })
});

const rootReducer: Redux.Reducer<Modules.Template.Store> = (
  state: Modules.Template.Store = initialState,
  action: Redux.Action
): Modules.Template.Store => {
  return genericReducer(state, action);
};

export default rootReducer;
