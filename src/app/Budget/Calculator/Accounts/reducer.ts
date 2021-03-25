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
  table: createTableReducer<Table.AccountRow, IAccount, Http.IAccountPayload>(
    {
      AddPlaceholders: ActionType.Accounts.AddPlaceholders,
      RemoveRow: ActionType.Accounts.RemoveRow,
      UpdateRow: ActionType.Accounts.UpdateRow,
      ActivatePlaceholder: ActionType.Accounts.ActivatePlaceholder,
      SelectRow: ActionType.Accounts.SelectRow,
      DeselectRow: ActionType.Accounts.DeselectRow,
      SelectAllRows: ActionType.Accounts.SelectAllRows,
      Request: ActionType.Accounts.Request,
      Response: ActionType.Accounts.Response,
      Loading: ActionType.Accounts.Loading,
      SetSearch: ActionType.Accounts.SetSearch,
      AddErrors: ActionType.Accounts.AddErrors,
      // TODO: This should be allowed to not be defined.
      AddGroupToRows: "",
      RemoveGroupFromRows: ""
    },
    AccountMapping,
    { referenceEntity: "account" }
  )
});

export default rootReducer;
