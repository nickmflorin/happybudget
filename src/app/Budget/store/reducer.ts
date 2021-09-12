import { combineReducers } from "redux";

import { redux, budgeting } from "lib";
import { SubAccountsTable, FringesTable, ActualsTable } from "components/tabling";

import * as actions from "./actions";
import initialState, { initialHeaderTemplatesState } from "./initialState";

const headerTemplatesRootReducer: Redux.Reducer<Modules.Budget.HeaderTemplatesStore> = (
  state: Modules.Budget.HeaderTemplatesStore = initialHeaderTemplatesState,
  action: Redux.Action
): Modules.Budget.HeaderTemplatesStore => {
  const listResponseReducer = redux.reducers.createModelListResponseReducer<
    Model.SimpleHeaderTemplate,
    Pick<
      Redux.ModelListResponseActionMap<Model.SimpleHeaderTemplate>,
      "request" | "loading" | "response" | "addToState" | "removeFromState"
    >,
    Modules.Budget.HeaderTemplatesStore
  >({
    initialState: initialHeaderTemplatesState,
    actions: {
      request: actions.pdf.requestHeaderTemplatesAction,
      loading: actions.pdf.loadingHeaderTemplatesAction,
      response: actions.pdf.responseHeaderTemplatesAction,
      addToState: actions.pdf.addHeaderTemplateToStateAction,
      removeFromState: actions.pdf.removeHeaderTemplateFromStateAction
    }
  });
  let newState = listResponseReducer(state, action);
  if (action.type === actions.pdf.displayHeaderTemplateAction.toString()) {
    const template: Model.HeaderTemplate = action.payload;
    newState = { ...newState, displayedTemplate: template };
  } else if (action.type === actions.pdf.loadHeaderTemplateAction.toString()) {
    newState = { ...newState, loadingDetail: action.payload };
  } else if (action.type === actions.pdf.clearHeaderTemplateAction.toString()) {
    newState = { ...newState, displayedTemplate: null };
  }
  return newState;
};

// const createAccountSubAccountReducer = <M extends Model.Account | Model.SubAccount>(
//   /* eslint-disable indent */
//   config: Redux.ReducerConfig<Modules.Budget.AccountOrSubAccountStore<M>>,
//   channel: string
// ): Redux.Reducer<Modules.Budget.AccountOrSubAccountStore<M>> => {
//   const genericReducer: Redux.Reducer<Modules.Budget.AccountOrSubAccountStore<M>> = combineReducers({
//     id: redux.reducers.createSimplePayloadReducer<number | null>({
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
//     //     let newData: { estimated: number; actual?: number; variance?: number } = {
//     //       estimated: reduce(subAccounts, (sum: number, s: Model.SubAccount) => sum + (s.estimated || 0), 0)
//     //     };
//     //     // If we are dealing with the Budget case (and not the Template case) we need to also update
//     //     // the overall Account's actual and variance values.
//     //     const actual = reduce(subAccounts, (sum: number, s: Model.SubAccount) => sum + (s.actual || 0), 0);
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
    actions: { set: actions.setBudgetIdAction }
  }),
  detail: redux.reducers.createDetailResponseReducer<Model.Budget>({
    initialState: redux.initialState.initialDetailResponseState,
    actions: {
      request: actions.requestBudgetAction,
      loading: actions.loadingBudgetAction,
      response: actions.responseBudgetAction,
      updateInState: actions.updateBudgetInStateAction
    }
  }),
  comments: redux.reducers.createCommentsListResponseReducer({
    actions: {
      request: actions.accounts.requestCommentsAction,
      response: actions.accounts.responseCommentsAction,
      loading: actions.accounts.loadingCommentsAction,
      submit: actions.accounts.createCommentAction,
      delete: actions.accounts.deleteCommentAction,
      edit: actions.accounts.updateCommentAction,
      updating: actions.accounts.updatingCommentAction,
      deleting: actions.accounts.deletingCommentAction,
      creating: actions.accounts.creatingCommentAction,
      replying: actions.accounts.replyingToCommentAction,
      removeFromState: actions.accounts.removeCommentFromStateAction,
      updateInState: actions.accounts.updateCommentInStateAction,
      addToState: actions.accounts.addCommentToStateAction
    }
  }),
  history: redux.reducers.createListResponseReducer<Model.HistoryEvent>({
    initialState: redux.initialState.initialModelListResponseState,
    actions: {
      request: actions.accounts.requestHistoryAction,
      response: actions.accounts.responseHistoryAction,
      loading: actions.accounts.loadingHistoryAction
    }
  }),
  autoIndex: redux.reducers.createSimpleBooleanReducer({
    actions: { set: actions.setBudgetAutoIndex }
  }),
  commentsHistoryDrawerOpen: redux.reducers.createSimpleBooleanReducer({
    actions: { set: actions.setCommentsHistoryDrawerVisibilityAction }
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
        request: actions.account.requestAccountAction,
        loading: actions.account.loadingAccountAction,
        response: actions.account.responseAccountAction
      }
    }),
    table: budgeting.reducers.createAuthenticatedSubAccountsTableReducer({
      initialState: initialState.account.table,
      actions: {
        tableChanged: actions.account.handleTableChangeEventAction,
        request: actions.account.requestAction,
        loading: actions.account.loadingAction,
        response: actions.account.responseAction,
        responseSubAccountUnits: actions.responseSubAccountUnitsAction,
        saving: actions.account.savingTableAction,
        addModelsToState: actions.account.addModelsToStateAction,
        setSearch: actions.account.setSearchAction
      },
      getModelRowLabel: (r: Tables.SubAccountRowData) => r.identifier || r.description,
      getPlaceholderRowLabel: (r: Tables.SubAccountRowData) => r.identifier || r.description,
      getModelRowChildren: (m: Model.SubAccount) => m.subaccounts,
      getModelRowName: "Sub Account",
      getPlaceholderRowName: "Sub Account",
      columns: SubAccountsTable.AuthenticatedBudgetColumns,
      fringesTableChangedAction: actions.handleFringesTableChangeEventAction,
      fringes: budgeting.reducers.createAuthenticatedFringesTableReducer({
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
          setSearch: actions.setFringesSearchAction
        }
      })
    }),
    comments: redux.reducers.createCommentsListResponseReducer({
      actions: {
        request: actions.account.requestCommentsAction,
        response: actions.account.responseCommentsAction,
        loading: actions.account.loadingCommentsAction,
        submit: actions.account.createCommentAction,
        delete: actions.account.deleteCommentAction,
        edit: actions.account.updateCommentAction,
        updating: actions.account.updatingCommentAction,
        deleting: actions.account.deletingCommentAction,
        creating: actions.account.creatingCommentAction,
        replying: actions.account.replyingToCommentAction,
        removeFromState: actions.account.removeCommentFromStateAction,
        updateInState: actions.account.updateCommentInStateAction,
        addToState: actions.account.addCommentToStateAction
      }
    }),
    history: redux.reducers.createListResponseReducer<Model.HistoryEvent>({
      initialState: redux.initialState.initialModelListResponseState,
      actions: {
        request: actions.account.requestHistoryAction,
        response: actions.account.responseHistoryAction,
        loading: actions.account.loadingHistoryAction
      }
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
        request: actions.subAccount.requestSubAccountAction,
        loading: actions.subAccount.loadingSubAccountAction,
        response: actions.subAccount.responseSubAccountAction
      }
    }),
    table: budgeting.reducers.createAuthenticatedSubAccountsTableReducer({
      initialState: initialState.subaccount.table,
      actions: {
        tableChanged: actions.subAccount.handleTableChangeEventAction,
        responseSubAccountUnits: actions.responseSubAccountUnitsAction,
        request: actions.subAccount.requestAction,
        loading: actions.subAccount.loadingAction,
        response: actions.subAccount.responseAction,
        saving: actions.subAccount.savingTableAction,
        addModelsToState: actions.subAccount.addModelsToStateAction,
        setSearch: actions.subAccount.setSearchAction
      },
      columns: SubAccountsTable.AuthenticatedBudgetColumns,
      getModelRowLabel: (r: Tables.SubAccountRowData) => r.identifier || r.description,
      getPlaceholderRowLabel: (r: Tables.SubAccountRowData) => r.identifier || r.description,
      getModelRowChildren: (m: Model.SubAccount) => m.subaccounts,
      getModelRowName: "Sub Account",
      getPlaceholderRowName: "Sub Account",
      fringesTableChangedAction: actions.handleFringesTableChangeEventAction,
      fringes: budgeting.reducers.createAuthenticatedFringesTableReducer({
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
          setSearch: actions.setFringesSearchAction
        }
      })
    }),
    comments: redux.reducers.createCommentsListResponseReducer({
      actions: {
        request: actions.subAccount.requestCommentsAction,
        response: actions.subAccount.responseCommentsAction,
        loading: actions.subAccount.loadingCommentsAction,
        submit: actions.subAccount.createCommentAction,
        delete: actions.subAccount.deleteCommentAction,
        edit: actions.subAccount.updateCommentAction,
        updating: actions.subAccount.updatingCommentAction,
        deleting: actions.subAccount.deletingCommentAction,
        creating: actions.subAccount.creatingCommentAction,
        replying: actions.subAccount.replyingToCommentAction,
        removeFromState: actions.subAccount.removeCommentFromStateAction,
        updateInState: actions.subAccount.updateCommentInStateAction,
        addToState: actions.subAccount.addCommentToStateAction
      }
    }),
    history: redux.reducers.createListResponseReducer<Model.HistoryEvent>({
      initialState: redux.initialState.initialModelListResponseState,
      actions: {
        request: actions.subAccount.requestHistoryAction,
        response: actions.subAccount.responseHistoryAction,
        loading: actions.subAccount.loadingHistoryAction
      }
    })
  }),
  actuals: budgeting.reducers.createAuthenticatedActualsTableReducer({
    initialState: initialState.actuals,
    actions: {
      tableChanged: actions.actuals.handleTableChangeEventAction,
      request: actions.actuals.requestAction,
      loading: actions.actuals.loadingAction,
      response: actions.actuals.responseAction,
      saving: actions.actuals.savingTableAction,
      addModelsToState: actions.actuals.addModelsToStateAction,
      setSearch: actions.actuals.setSearchAction
    },
    columns: ActualsTable.Columns,
    getModelRowLabel: (r: Tables.ActualRowData) => r.description,
    getModelRowName: "Actual",
    getPlaceholderRowLabel: (r: Tables.ActualRowData) => r.description,
    getPlaceholderRowName: "Actual",
    subAccountsTree: redux.reducers.createModelListResponseReducer<
      Model.SubAccountTreeNode,
      Pick<
        Redux.ModelListResponseActionMap<Model.SubAccountTreeNode>,
        "loading" | "response" | "restoreSearchCache" | "setSearch"
      >
    >({
      initialState: redux.initialState.initialModelListResponseState,
      actions: {
        loading: actions.actuals.loadingSubAccountsTreeAction,
        response: actions.actuals.responseSubAccountsTreeAction,
        restoreSearchCache: actions.actuals.restoreSubAccountsTreeSearchCacheAction,
        setSearch: actions.actuals.setSubAccountsTreeSearchAction
      }
    })
  }),
  headerTemplates: headerTemplatesRootReducer
});

const rootReducer: Redux.Reducer<Modules.Budget.Store> = (
  state: Modules.Budget.Store = initialState,
  action: Redux.Action
): Modules.Budget.Store => {
  let newState = { ...state };
  if (action.type === actions.wipeStateAction.toString()) {
    newState = initialState;
  }
  return genericReducer(newState, action);
};

export default rootReducer;
