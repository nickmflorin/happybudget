import { combineReducers } from "redux";
import {
  createDetailResponseReducer,
  createSimpleBooleanReducer,
  createModelListActionReducer,
  createSimplePayloadReducer,
  createCommentsListResponseReducer,
  createListResponseReducer,
  createTableReducer,
  createTablePlaceholdersReducer
} from "store/factories";
import { SubAccountMapping } from "model/tableMappings";
import { ActionType } from "./actions";

const rootReducer = combineReducers({
  id: createSimplePayloadReducer(ActionType.Account.SetId),
  detail: createDetailResponseReducer<IAccount, Redux.IDetailResponseStore<IAccount>, Redux.IAction>({
    Response: ActionType.Account.Response,
    Loading: ActionType.Account.Loading,
    Request: ActionType.Account.Request,
    UpdateInState: ActionType.Account.UpdateInState
  }),
  comments: createCommentsListResponseReducer({
    Response: ActionType.Comments.Response,
    Request: ActionType.Comments.Request,
    Loading: ActionType.Comments.Loading,
    AddToState: ActionType.Comments.AddToState,
    RemoveFromState: ActionType.Comments.RemoveFromState,
    UpdateInState: ActionType.Comments.UpdateInState,
    Submitting: ActionType.Comments.Submitting,
    Deleting: ActionType.Comments.Deleting,
    Editing: ActionType.Comments.Editing,
    Replying: ActionType.Comments.Replying
  }),
  subaccounts: createListResponseReducer<ISubAccount>(
    {
      Response: ActionType.SubAccounts.Response,
      Request: ActionType.SubAccounts.Request,
      Loading: ActionType.SubAccounts.Loading,
      SetSearch: ActionType.SubAccounts.SetSearch,
      UpdateInState: ActionType.SubAccounts.UpdateInState,
      RemoveFromState: ActionType.SubAccounts.RemoveFromState,
      AddToState: ActionType.SubAccounts.AddToState,
      Select: ActionType.SubAccounts.Select
    },
    {
      referenceEntity: "subaccount",
      keyReducers: {
        placeholders: createTablePlaceholdersReducer(
          {
            Add: ActionType.SubAccounts.AddPlaceholders,
            Activate: ActionType.SubAccounts.ActivatePlaceholder,
            Remove: ActionType.SubAccounts.RemovePlaceholder
          },
          SubAccountMapping,
          { referenceEntity: "subaccount" }
        ),
        groups: combineReducers({
          deleting: createModelListActionReducer(ActionType.SubAccounts.Groups.Deleting, {
            referenceEntity: "group"
          })
        }),
        deleting: createModelListActionReducer(ActionType.SubAccounts.Deleting, {
          referenceEntity: "subaccount"
        }),
        updating: createModelListActionReducer(ActionType.SubAccounts.Updating, {
          referenceEntity: "subaccount"
        }),
        history: createListResponseReducer<HistoryEvent>(
          {
            Response: ActionType.SubAccounts.History.Response,
            Request: ActionType.SubAccounts.History.Request,
            Loading: ActionType.SubAccounts.History.Loading
          },
          { referenceEntity: "event" }
        ),
        creating: createSimpleBooleanReducer(ActionType.SubAccounts.Creating),
        table: createTableReducer<Table.SubAccountRow, ISubAccount, Http.ISubAccountPayload, ISimpleSubAccount>(
          {
            // AddPlaceholders: ActionType.SubAccounts.Table.AddPlaceholders,
            // RemoveRow: ActionType.SubAccounts.Table.RemoveRow,
            UpdateRow: ActionType.SubAccounts.Table.UpdateRow,
            // SelectRow: ActionType.SubAccounts.Table.SelectRow,
            DeselectRow: ActionType.SubAccounts.Table.DeselectRow,
            SelectAllRows: ActionType.SubAccounts.Table.SelectAllRows,
            SetData: ActionType.SubAccounts.Response,
            ClearData: ActionType.SubAccounts.Request,
            Loading: ActionType.SubAccounts.Loading,
            AddErrors: ActionType.SubAccounts.Table.AddErrors,
            // AddToState: ActionType.SubAccounts.AddToState,
            // UpdateInState: ActionType.SubAccounts.UpdateInState,
            AddGroup: ActionType.SubAccounts.Groups.AddToTable,
            RemoveGroup: ActionType.SubAccounts.Groups.RemoveFromTable,
            UpdateGroup: ActionType.SubAccounts.Groups.UpdateInTable
          },
          SubAccountMapping,
          { referenceEntity: "subaccount" }
        )
      }
    }
  )
});

export default rootReducer;
