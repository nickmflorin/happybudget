import { combineReducers } from "redux";
import {
  createSimpleBooleanReducer,
  createModelListActionReducer,
  createTableReducer,
  createCommentsListResponseReducer,
  createListResponseReducer
} from "store/factories";
import { AccountMapping } from "model/tableMappings";
import { ActionType } from "./actions";

const rootReducer = combineReducers({
  deleting: createModelListActionReducer(ActionType.Accounts.Deleting, { referenceEntity: "account" }),
  updating: createModelListActionReducer(ActionType.Accounts.Updating, { referenceEntity: "account" }),
  creating: createSimpleBooleanReducer(ActionType.Accounts.Creating),
  history: createListResponseReducer<HistoryEvent>(
    {
      Response: ActionType.Accounts.History.Response,
      Request: ActionType.Accounts.History.Request,
      Loading: ActionType.Accounts.History.Loading,
      AddToState: ActionType.Accounts.History.AddToState
    },
    { referenceEntity: "event" }
  ),
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
  accounts: createListResponseReducer<ISubAccount>(
    {
      Response: ActionType.Accounts.Response,
      Request: ActionType.Accounts.Request,
      Loading: ActionType.Accounts.Loading,
      SetSearch: ActionType.Accounts.SetSearch
      // UpdateInState: ActionType.Budget.UpdateInState
    },
    {
      referenceEntity: "subaccount",
      keyReducers: {
        deleting: createModelListActionReducer(ActionType.Accounts.Deleting, {
          referenceEntity: "account"
        }),
        updating: createModelListActionReducer(ActionType.Accounts.Updating, {
          referenceEntity: "account"
        }),
        history: createListResponseReducer<HistoryEvent>(
          {
            Response: ActionType.Accounts.History.Response,
            Request: ActionType.Accounts.History.Request,
            Loading: ActionType.Accounts.History.Loading,
            AddToState: ActionType.Accounts.History.AddToState
          },
          { referenceEntity: "event" }
        ),
        creating: createSimpleBooleanReducer(ActionType.Accounts.Creating),
        table: createTableReducer<Table.AccountRow, IAccount, Http.IAccountPayload>(
          {
            AddPlaceholders: ActionType.Accounts.AddPlaceholders,
            RemoveRow: ActionType.Accounts.RemoveRow,
            UpdateRow: ActionType.Accounts.UpdateRow,
            ActivatePlaceholder: ActionType.Accounts.ActivatePlaceholder,
            SelectRow: ActionType.Accounts.SelectRow,
            DeselectRow: ActionType.Accounts.DeselectRow,
            SelectAllRows: ActionType.Accounts.SelectAllRows,
            SetData: ActionType.Accounts.Response,
            ClearData: ActionType.Accounts.Request,
            Loading: ActionType.Accounts.Loading,
            AddErrors: ActionType.Accounts.AddErrors
            // UpdateInState: ActionType.Accounts.UpdateInState,
            // AddGroup: ActionType.Accounts.Groups.AddToTable,
            // RemoveGroup: ActionType.Accounts.Groups.RemoveFromTable,
            // UpdateGroup: ActionType.Accounts.Groups.UpdateInTable
          },
          AccountMapping,
          { referenceEntity: "account" }
        )
      }
    }
  )
});

export default rootReducer;
