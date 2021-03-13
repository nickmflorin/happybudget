import { combineReducers } from "redux";
import { find, isNil } from "lodash";
import {
  createDetailResponseReducer,
  createSimpleBooleanReducer,
  createModelListActionReducer,
  createTableReducer,
  createSimplePayloadReducer,
  createListResponseReducer
} from "store/reducerFactories";
import { replaceInArray } from "util/arrays";
import { ActionType } from "./actions";
import { initialCommentsState } from "./initialState";
import {
  createSubAccountRowPlaceholder,
  createAccountRowPlaceholder,
  initializeRowFromAccount,
  initializeRowFromSubAccount
} from "./util";

const rootReducer = combineReducers({
  accounts: combineReducers({
    deleting: createModelListActionReducer(ActionType.Accounts.Deleting, { referenceEntity: "account" }),
    updating: createModelListActionReducer(ActionType.Accounts.Updating, { referenceEntity: "account" }),
    creating: createSimpleBooleanReducer(ActionType.Accounts.Creating),
    comments: createListResponseReducer<IComment, Redux.Calculator.ICommentsStore>(
      {
        Response: ActionType.Comments.Response,
        Request: ActionType.Comments.Request,
        Loading: ActionType.Comments.Loading,
        AddToState: ActionType.Comments.AddToState,
        RemoveFromState: ActionType.Comments.RemoveFromState,
        UpdateInState: ActionType.Comments.UpdateInState
      },
      {
        referenceEntity: "comment",
        initialState: initialCommentsState,
        extensions: {
          [ActionType.Comments.UpdateWithChildInState]: (
            payload: { id: number; data: IComment },
            st: Redux.Calculator.ICommentsStore
          ) => {
            // NOTE: This will only work for replies to top level comments.  For subsequent
            // comments, we will have to figure out a way to do this recursively.  The other
            // option is to create a comments reducer for the nested sets of comments.
            const existing = find(st.data, { id: payload.id });
            if (isNil(existing)) {
              /* eslint-disable no-console */
              console.error(
                `Inconsistent State!:  Inconsistent state noticed when updating comment in state...
                the comment with ID ${payload.id} does not exist in state when it is expected to.`
              );
            } else {
              return {
                data: replaceInArray<IComment>(
                  st.data,
                  { id: payload.id },
                  { ...existing, comments: [...existing.comments, payload.data] }
                )
              };
            }
          }
        },
        keyReducers: {
          submitting: createSimpleBooleanReducer(ActionType.Comments.Submitting),
          deleting: createModelListActionReducer(ActionType.Comments.Deleting),
          editing: createModelListActionReducer(ActionType.Comments.Editing),
          replying: createModelListActionReducer(ActionType.Comments.Replying)
        }
      }
    ),
    table: createTableReducer<Table.AccountRowField, Table.IBudgetRowMeta, Table.IAccountRow, IAccount>(
      {
        AddPlaceholders: ActionType.AccountsTable.AddPlaceholders,
        RemoveRow: ActionType.AccountsTable.RemoveRow,
        UpdateRow: ActionType.AccountsTable.UpdateRow,
        ActivatePlaceholder: ActionType.AccountsTable.ActivatePlaceholder,
        SelectRow: ActionType.AccountsTable.SelectRow,
        DeselectRow: ActionType.AccountsTable.DeselectRow,
        SelectAllRows: ActionType.AccountsTable.SelectAllRows,
        Request: ActionType.AccountsTable.Request,
        Response: ActionType.AccountsTable.Response,
        Loading: ActionType.AccountsTable.Loading,
        SetSearch: ActionType.AccountsTable.SetSearch,
        AddErrors: ActionType.AccountsTable.AddErrors
      },
      createAccountRowPlaceholder,
      initializeRowFromAccount,
      { referenceEntity: "account" }
    )
  }),
  account: combineReducers({
    id: createSimplePayloadReducer(ActionType.Account.SetId),
    detail: createDetailResponseReducer<IAccount, Redux.IDetailResponseStore<IAccount>, Redux.IAction>({
      Response: ActionType.Account.Response,
      Loading: ActionType.Account.Loading,
      Request: ActionType.Account.Request
    }),
    comments: createListResponseReducer<IComment, Redux.Calculator.ICommentsStore>(
      {
        Response: ActionType.Account.Comments.Response,
        Request: ActionType.Account.Comments.Request,
        Loading: ActionType.Account.Comments.Loading,
        AddToState: ActionType.Account.Comments.AddToState,
        RemoveFromState: ActionType.Account.Comments.RemoveFromState,
        UpdateInState: ActionType.Account.Comments.UpdateInState
      },
      {
        referenceEntity: "comment",
        initialState: initialCommentsState,
        extensions: {
          [ActionType.Account.Comments.UpdateWithChildInState]: (
            payload: { id: number; data: IComment },
            st: Redux.Calculator.ICommentsStore
          ) => {
            // NOTE: This will only work for replies to top level comments.  For subsequent
            // comments, we will have to figure out a way to do this recursively.  The other
            // option is to create a comments reducer for the nested sets of comments.
            const existing = find(st.data, { id: payload.id });
            if (isNil(existing)) {
              /* eslint-disable no-console */
              console.error(
                `Inconsistent State!:  Inconsistent state noticed when updating comment in state...
                the comment with ID ${payload.id} does not exist in state when it is expected to.`
              );
            } else {
              return {
                data: replaceInArray<IComment>(
                  st.data,
                  { id: payload.id },
                  { ...existing, comments: [...existing.comments, payload.data] }
                )
              };
            }
          }
        },
        keyReducers: {
          submitting: createSimpleBooleanReducer(ActionType.Account.Comments.Submitting),
          deleting: createModelListActionReducer(ActionType.Account.Comments.Deleting),
          editing: createModelListActionReducer(ActionType.Account.Comments.Editing),
          replying: createModelListActionReducer(ActionType.Account.Comments.Replying)
        }
      }
    ),
    subaccounts: combineReducers({
      deleting: createModelListActionReducer(ActionType.Account.SubAccounts.Deleting, {
        referenceEntity: "subaccount"
      }),
      updating: createModelListActionReducer(ActionType.Account.SubAccounts.Updating, {
        referenceEntity: "subaccount"
      }),
      creating: createSimpleBooleanReducer(ActionType.Account.SubAccounts.Creating),
      table: createTableReducer<Table.SubAccountRowField, Table.IBudgetRowMeta, Table.ISubAccountRow, ISubAccount>(
        {
          AddPlaceholders: ActionType.Account.SubAccountsTable.AddPlaceholders,
          RemoveRow: ActionType.Account.SubAccountsTable.RemoveRow,
          UpdateRow: ActionType.Account.SubAccountsTable.UpdateRow,
          ActivatePlaceholder: ActionType.Account.SubAccountsTable.ActivatePlaceholder,
          SelectRow: ActionType.Account.SubAccountsTable.SelectRow,
          DeselectRow: ActionType.Account.SubAccountsTable.DeselectRow,
          SelectAllRows: ActionType.Account.SubAccountsTable.SelectAllRows,
          Response: ActionType.Account.SubAccountsTable.Response,
          Request: ActionType.Account.SubAccountsTable.Request,
          Loading: ActionType.Account.SubAccountsTable.Loading,
          SetSearch: ActionType.Account.SubAccountsTable.SetSearch,
          AddErrors: ActionType.Account.SubAccountsTable.AddErrors
        },
        createSubAccountRowPlaceholder,
        initializeRowFromSubAccount,
        { referenceEntity: "subaccount" }
      )
    })
  }),
  subaccount: combineReducers({
    id: createSimplePayloadReducer(ActionType.SubAccount.SetId),
    detail: createDetailResponseReducer<ISubAccount, Redux.IDetailResponseStore<ISubAccount>, Redux.IAction>({
      Response: ActionType.SubAccount.Response,
      Loading: ActionType.SubAccount.Loading,
      Request: ActionType.SubAccount.Request
    }),
    comments: createListResponseReducer<IComment, Redux.Calculator.ICommentsStore>(
      {
        Response: ActionType.SubAccount.Comments.Response,
        Request: ActionType.SubAccount.Comments.Request,
        Loading: ActionType.SubAccount.Comments.Loading,
        AddToState: ActionType.SubAccount.Comments.AddToState,
        RemoveFromState: ActionType.SubAccount.Comments.RemoveFromState,
        UpdateInState: ActionType.SubAccount.Comments.UpdateInState
      },
      {
        referenceEntity: "comment",
        initialState: initialCommentsState,
        extensions: {
          [ActionType.SubAccount.Comments.UpdateWithChildInState]: (
            payload: { id: number; data: IComment },
            st: Redux.Calculator.ICommentsStore
          ) => {
            // NOTE: This will only work for replies to top level comments.  For subsequent
            // comments, we will have to figure out a way to do this recursively.  The other
            // option is to create a comments reducer for the nested sets of comments.
            const existing = find(st.data, { id: payload.id });
            if (isNil(existing)) {
              /* eslint-disable no-console */
              console.error(
                `Inconsistent State!:  Inconsistent state noticed when updating comment in state...
                the comment with ID ${payload.id} does not exist in state when it is expected to.`
              );
            } else {
              return {
                data: replaceInArray<IComment>(
                  st.data,
                  { id: payload.id },
                  { ...existing, comments: [...existing.comments, payload.data] }
                )
              };
            }
          }
        },
        keyReducers: {
          submitting: createSimpleBooleanReducer(ActionType.SubAccount.Comments.Submitting),
          deleting: createModelListActionReducer(ActionType.SubAccount.Comments.Deleting),
          editing: createModelListActionReducer(ActionType.SubAccount.Comments.Editing),
          replying: createModelListActionReducer(ActionType.SubAccount.Comments.Replying)
        }
      }
    ),
    subaccounts: combineReducers({
      deleting: createModelListActionReducer(ActionType.SubAccount.SubAccounts.Deleting, {
        referenceEntity: "subaccount"
      }),
      updating: createModelListActionReducer(ActionType.SubAccount.SubAccounts.Updating, {
        referenceEntity: "subaccount"
      }),
      creating: createSimpleBooleanReducer(ActionType.SubAccount.SubAccounts.Creating),
      table: createTableReducer<Table.SubAccountRowField, Table.IBudgetRowMeta, Table.ISubAccountRow, ISubAccount>(
        {
          AddPlaceholders: ActionType.SubAccount.SubAccountsTable.AddPlaceholders,
          RemoveRow: ActionType.SubAccount.SubAccountsTable.RemoveRow,
          UpdateRow: ActionType.SubAccount.SubAccountsTable.UpdateRow,
          ActivatePlaceholder: ActionType.SubAccount.SubAccountsTable.ActivatePlaceholder,
          SelectRow: ActionType.SubAccount.SubAccountsTable.SelectRow,
          DeselectRow: ActionType.SubAccount.SubAccountsTable.DeselectRow,
          SelectAllRows: ActionType.SubAccount.SubAccountsTable.SelectAllRows,
          Response: ActionType.SubAccount.SubAccountsTable.Response,
          Request: ActionType.SubAccount.SubAccountsTable.Request,
          Loading: ActionType.SubAccount.SubAccountsTable.Loading,
          SetSearch: ActionType.SubAccount.SubAccountsTable.SetSearch,
          AddErrors: ActionType.SubAccount.SubAccountsTable.AddErrors
        },
        createSubAccountRowPlaceholder,
        initializeRowFromSubAccount,
        { referenceEntity: "subaccount" }
      )
    })
  })
});

export default rootReducer;
