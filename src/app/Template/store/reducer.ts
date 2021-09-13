import { combineReducers } from "redux";
import { filter } from "lodash";

import { redux, budgeting } from "lib";
import { SubAccountsTable, FringesTable } from "components/tabling";

import * as actions from "./actions";
import initialState from "./initialState";
import { includes } from "lodash";

// const createAccountSubAccountReducer = <M extends Model.Account | Model.SubAccount>(
//   /* eslint-disable indent */
//   config: Redux.ReducerConfig<Modules.Budget.AccountOrSubAccountStore<M>>,
//   channel: string
// ): Redux.Reducer<Modules.Budget.AccountOrSubAccountStore<M>> => {
//   const genericReducer: Redux.Reducer<Modules.Budget.AccountOrSubAccountStore<M>> = combineReducers({
//     id: redux.reducers.createSimplePayloadReducer<ID | null>({
//       filterFn: config.filterFn.extend({ type: "SetId", channel }),
//       initialState: null
//     }),
//     detail: redux.reducers.createDetailResponseReducer<M, Redux.ModelDetailResponseStore<M>>({
//       filterFn: config.filterFn.extend({ module: "budget", channel: `${channel}-detail` }),
//       initialState: redux.initialState.initialDetailResponseState
//     }),
//     comments: redux.reducers.createCommentsListResponseReducer({
//       filterFn: config.filterFn.extend({ module: "budget", channel: `${channel}-comments` })
//     }),
//     history: redux.reducers.createModelListResponseReducer<Model.HistoryEvent>({
//       filterFn: config.filterFn.extend({ module: "budget", channel: `${channel}-history` }),
//       initialState: redux.initialState.initialModelListResponseState
//     })
//   });

//   type GenericEvent = Table.ChangeEvent<Tables.FringeRowData | Tables.SubAccountRowData>;

//   return (state: Modules.Budget.AccountOrSubAccountStore<M> = config.initialState, action: Redux.Action) => {
//     let newState: Modules.Budget.AccountOrSubAccountStore<M> = genericReducer(state, action);

//     // When an Account's underlying subaccounts are removed, updated or added,
//     // or the Fringes are changed, we need to update/recalculate the Account.
//     // if (
//     //   redux.actions.ActionFilter({ type: "TableChanged", asyncId: tableAsyncId }) ||
//     //   redux.actions.ActionFilter({ type: "TableChanged", asyncId: fringesTableAsyncId })
//     // ) {
//     //   const e: GenericEvent = action.payload;
//     //   if (!tabling.typeguards.isGroupEvent(e) && tabling.events.eventWarrantsRecalculation(e)) {
//     //     // Update the overall Account based on the underlying SubAccount(s) present.
//     //     let subAccountRows: Tables.SubAccountRowData[] = newState.table.data;
//     //     let newData: { estimated: ID; actual?: ID; variance?: ID } = {
//     //       estimated: reduce(subAccounts, (sum: ID, s: Model.SubAccount) => sum + (s.estimated || 0), 0)
//     //     };
//     //     // If we are dealing with the Budget case (and not the Template case) we need to also update
//     //     // the overall Account's actual and variance values.
//     //     const actual = reduce(subAccounts, (sum: ID, s: Model.SubAccount) => sum + (s.actual || 0), 0);
//     //     newData = { ...newData, actual, variance: newData.estimated - actual };
//     //     if (!isNil(newState.detail.data)) {
//     //       newState = {
//     //         ...newState,
//     //         detail: {
//     //           ...newState.detail,
//     //           data: {
//     //             ...newState.detail.data,
//     //             ...newData
//     //           }
//     //         }
//     //       };
//     //     }
//     //   }
//     // }

//     return newState;
//   };
// };

const genericReducer = combineReducers({
  id: redux.reducers.createSimplePayloadReducer<ID | null>({
    initialState: null,
    actions: { set: actions.setTemplateIdAction }
  }),
  detail: redux.reducers.createDetailResponseReducer<Model.Template>({
    initialState: redux.initialState.initialDetailResponseState,
    actions: {
      loading: actions.loadingTemplateAction,
      response: actions.responseTemplateAction,
      updateInState: actions.updateTemplateInStateAction
    }
  }),
  autoIndex: redux.reducers.createSimpleBooleanReducer({
    actions: { set: actions.setTemplateAutoIndex }
  }),
  account: combineReducers({
    id: redux.reducers.createSimplePayloadReducer<ID | null>({
      initialState: null,
      actions: { set: actions.account.setAccountIdAction }
    }),
    detail: redux.reducers.createDetailResponseReducer<
      Model.Account,
      Omit<Redux.ModelDetailResponseActionMap<Model.Account>, "updateInState">
    >({
      initialState: redux.initialState.initialDetailResponseState,
      actions: {
        loading: actions.account.loadingAccountAction,
        response: actions.account.responseAccountAction
      }
    }),
    table: budgeting.reducers.createAuthenticatedSubAccountsTableReducer({
      tableId: "account-subaccounts-table",
      initialState: initialState.account.table,
      actions: {
        tableChanged: actions.account.handleTableChangeEventAction,
        loading: actions.account.loadingAction,
        response: actions.account.responseAction,
        responseSubAccountUnits: actions.responseSubAccountUnitsAction,
        saving: actions.account.savingTableAction,
        addModelsToState: actions.account.addModelsToStateAction,
        setSearch: actions.account.setSearchAction,
        clear: actions.account.clearAction
      },
      getModelRowLabel: (r: Tables.SubAccountRowData) => r.identifier || r.description,
      getPlaceholderRowLabel: (r: Tables.SubAccountRowData) => r.identifier || r.description,
      getModelRowChildren: (m: Model.SubAccount) => m.subaccounts,
      getModelRowName: "Sub Account",
      getPlaceholderRowName: "Sub Account",
      columns: filter(
        SubAccountsTable.Columns,
        (c: Table.Column<Tables.SubAccountRowData, Model.SubAccount>) =>
          !includes(["contact", "actual", "variance"], c.field)
      ),
      fringesTableChangedAction: actions.handleFringesTableChangeEventAction,
      fringes: budgeting.reducers.createAuthenticatedFringesTableReducer({
        tableId: "fringes-table",
        initialState: initialState.account.table.fringes,
        columns: FringesTable.Columns,
        actions: {
          responseFringeColors: actions.responseFringeColorsAction,
          tableChanged: actions.handleFringesTableChangeEventAction,
          request: actions.requestFringesAction,
          loading: actions.loadingFringesAction,
          response: actions.responseFringesAction,
          saving: actions.savingFringesTableAction,
          addModelsToState: actions.addFringeModelsToStateAction,
          setSearch: actions.setFringesSearchAction,
          clear: actions.clearFringesAction
        }
      })
    })
  }),
  subaccount: combineReducers({
    id: redux.reducers.createSimplePayloadReducer<ID | null>({
      initialState: null,
      actions: { set: actions.account.setAccountIdAction }
    }),
    detail: redux.reducers.createDetailResponseReducer<
      Model.SubAccount,
      Omit<Redux.ModelDetailResponseActionMap<Model.SubAccount>, "updateInState">
    >({
      initialState: redux.initialState.initialDetailResponseState,
      actions: {
        loading: actions.subAccount.loadingSubAccountAction,
        response: actions.subAccount.responseSubAccountAction
      }
    }),
    table: budgeting.reducers.createAuthenticatedSubAccountsTableReducer({
      tableId: "subaccount-subaccounts-table",
      initialState: initialState.subaccount.table,
      actions: {
        tableChanged: actions.subAccount.handleTableChangeEventAction,
        responseSubAccountUnits: actions.responseSubAccountUnitsAction,
        loading: actions.subAccount.loadingAction,
        response: actions.subAccount.responseAction,
        saving: actions.subAccount.savingTableAction,
        addModelsToState: actions.subAccount.addModelsToStateAction,
        setSearch: actions.subAccount.setSearchAction,
        clear: actions.subAccount.clearAction
      },
      columns: filter(
        SubAccountsTable.Columns,
        (c: Table.Column<Tables.SubAccountRowData, Model.SubAccount>) =>
          !includes(["contact", "actual", "variance"], c.field)
      ),
      getModelRowLabel: (r: Tables.SubAccountRowData) => r.identifier || r.description,
      getPlaceholderRowLabel: (r: Tables.SubAccountRowData) => r.identifier || r.description,
      getModelRowChildren: (m: Model.SubAccount) => m.subaccounts,
      getModelRowName: "Sub Account",
      getPlaceholderRowName: "Sub Account",
      fringesTableChangedAction: actions.handleFringesTableChangeEventAction,
      fringes: budgeting.reducers.createAuthenticatedFringesTableReducer({
        tableId: "fringes-table",
        initialState: initialState.subaccount.table.fringes,
        columns: FringesTable.Columns,
        actions: {
          responseFringeColors: actions.responseFringeColorsAction,
          tableChanged: actions.handleFringesTableChangeEventAction,
          request: actions.requestFringesAction,
          loading: actions.loadingFringesAction,
          response: actions.responseFringesAction,
          saving: actions.savingFringesTableAction,
          addModelsToState: actions.addFringeModelsToStateAction,
          setSearch: actions.setFringesSearchAction,
          clear: actions.clearFringesAction
        }
      })
    })
  })
});

const rootReducer: Redux.Reducer<Modules.Template.Store> = (
  state: Modules.Template.Store = initialState,
  action: Redux.Action
): Modules.Template.Store => {
  let newState = { ...state };
  if (action.type === actions.wipeStateAction.toString()) {
    newState = initialState;
  }
  return genericReducer(newState, action);
};

export default rootReducer;
