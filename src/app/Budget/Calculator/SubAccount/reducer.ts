import { combineReducers } from "redux";
import {
  createDetailResponseReducer,
  createSimpleBooleanReducer,
  createModelListActionReducer,
  createTableReducer,
  createSimplePayloadReducer,
  createCommentsListResponseReducer,
  createListResponseReducer
} from "store/factories";
import { SubAccountMapping } from "model/tableMappings";
import { ActionType } from "./actions";

const rootReducer = combineReducers({
  id: createSimplePayloadReducer(ActionType.SubAccount.SetId),
  detail: createDetailResponseReducer<ISubAccount, Redux.IDetailResponseStore<ISubAccount>, Redux.IAction>({
    Response: ActionType.SubAccount.Response,
    Loading: ActionType.SubAccount.Loading,
    Request: ActionType.SubAccount.Request
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
      UpdateInState: ActionType.SubAccounts.UpdateInState
    },
    {
      referenceEntity: "subaccount",
      keyReducers: {
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
            AddPlaceholders: ActionType.SubAccounts.AddPlaceholders,
            RemoveRow: ActionType.SubAccounts.RemoveRow,
            UpdateRow: ActionType.SubAccounts.UpdateRow,
            AddToState: ActionType.SubAccounts.ActivatePlaceholder,
            SelectRow: ActionType.SubAccounts.SelectRow,
            DeselectRow: ActionType.SubAccounts.DeselectRow,
            SelectAllRows: ActionType.SubAccounts.SelectAllRows,
            SetData: ActionType.SubAccounts.Response,
            ClearData: ActionType.SubAccounts.Request,
            Loading: ActionType.SubAccounts.Loading,
            AddErrors: ActionType.SubAccounts.AddErrors,
            UpdateInState: ActionType.SubAccounts.UpdateInState,
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
