import { combineReducers } from "redux";
import { filter, intersection } from "lodash";

import { redux, budgeting, tabling } from "lib";
import { AccountsTable, SubAccountsTable, FringesTable } from "tabling";

import * as actions from "../actions/template";
import { initialTemplateState } from "../initialState";

const SubAccountColumns = filter(
  SubAccountsTable.Columns,
  (c: Table.Column<Tables.SubAccountRowData, Model.SubAccount>) =>
    tabling.columns.isModelColumn(c) && intersection([c.field], ["variance", "actual", "contact"]).length === 0
) as Table.ModelColumn<Tables.SubAccountRowData, Model.SubAccount>[];

const AccountColumns = filter(
  AccountsTable.Columns,
  (c: Table.Column<Tables.AccountRowData, Model.Account>) =>
    tabling.columns.isModelColumn(c) && intersection([c.field], ["variance", "actual"]).length === 0
) as Table.ModelColumn<Tables.AccountRowData, Model.Account>[];

const FringesColumns = filter(FringesTable.Columns, (c: Table.Column<Tables.FringeRowData, Model.Fringe>) =>
  tabling.columns.isModelColumn(c)
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
    initialState: initialTemplateState.account.table,
    clearOn: [
      {
        action: actions.accounts.requestAction,
        payload: (p: Redux.TableRequestPayload) => !redux.typeguards.isListRequestIdsPayload(p)
      }
    ],
    actions: {
      handleEvent: actions.accounts.handleTableEventAction,
      loading: actions.accounts.loadingAction,
      response: actions.accounts.responseAction,
      setSearch: actions.accounts.setSearchAction
    },
    columns: AccountColumns,
    getModelRowChildren: (m: Model.Account) => m.children
  }),
  account: budgeting.reducers.createAccountDetailReducer({
    initialState: initialTemplateState.account,
    actions: {
      loading: actions.account.loadingAccountAction,
      response: actions.account.responseAccountAction,
      updateInState: actions.account.updateInStateAction
    },
    reducers: {
      table: budgeting.reducers.createAuthenticatedSubAccountsTableReducer({
        initialState: initialTemplateState.account.table,
        clearOn: [
          {
            action: actions.account.requestAction,
            payload: (p: Redux.TableRequestPayload) => !redux.typeguards.isListRequestIdsPayload(p)
          }
        ],
        actions: {
          handleEvent: actions.account.handleTableEventAction,
          loading: actions.account.loadingAction,
          response: actions.account.responseAction,
          responseSubAccountUnits: actions.responseSubAccountUnitsAction,
          setSearch: actions.account.setSearchAction
        },
        getModelRowChildren: (m: Model.SubAccount) => m.children,
        columns: SubAccountColumns,
        fringes: budgeting.reducers.createAuthenticatedFringesTableReducer({
          initialState: initialTemplateState.account.table.fringes,
          columns: FringesColumns,
          clearOn: [actions.requestFringesAction],
          actions: {
            responseFringeColors: actions.responseFringeColorsAction,
            handleEvent: actions.handleFringesTableEventAction,
            loading: actions.loadingFringesAction,
            response: actions.responseFringesAction,
            setSearch: actions.setFringesSearchAction
          }
        })
      })
    }
  }),
  subaccount: budgeting.reducers.createSubAccountDetailReducer({
    initialState: initialTemplateState.subaccount,
    actions: {
      loading: actions.subAccount.loadingSubAccountAction,
      response: actions.subAccount.responseSubAccountAction,
      updateInState: actions.subAccount.updateInStateAction
    },
    reducers: {
      table: budgeting.reducers.createAuthenticatedSubAccountsTableReducer({
        initialState: initialTemplateState.subaccount.table,
        clearOn: [
          {
            action: actions.subAccount.requestAction,
            payload: (p: Redux.TableRequestPayload) => !redux.typeguards.isListRequestIdsPayload(p)
          }
        ],
        actions: {
          handleEvent: actions.subAccount.handleTableEventAction,
          responseSubAccountUnits: actions.responseSubAccountUnitsAction,
          loading: actions.subAccount.loadingAction,
          response: actions.subAccount.responseAction,
          setSearch: actions.subAccount.setSearchAction
        },
        columns: SubAccountColumns,
        getModelRowChildren: (m: Model.SubAccount) => m.children,
        fringes: budgeting.reducers.createAuthenticatedFringesTableReducer({
          initialState: initialTemplateState.subaccount.table.fringes,
          columns: FringesColumns,
          clearOn: [actions.requestFringesAction],
          actions: {
            responseFringeColors: actions.responseFringeColorsAction,
            handleEvent: actions.handleFringesTableEventAction,
            loading: actions.loadingFringesAction,
            response: actions.responseFringesAction,
            setSearch: actions.setFringesSearchAction
          }
        })
      })
    }
  })
});

const rootReducer: Redux.Reducer<Modules.Template.Store> = (
  state: Modules.Template.Store = initialTemplateState,
  action: Redux.Action
): Modules.Template.Store => {
  return genericReducer(state, action);
};

export default rootReducer;
