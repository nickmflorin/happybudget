import { combineReducers, Reducer } from "redux";
import { reduce, isNil } from "lodash";
import {
  createDetailResponseReducer,
  createSimplePayloadReducer,
  createCommentsListResponseReducer
} from "store/factories";
import { createSubAccountsReducer } from "../factories";
import { initialSubAccountState } from "../initialState";
import { ActionType } from "./actions";

const genericReducer: Reducer<Redux.Calculator.ISubAccountStore, Redux.IAction<any>> = combineReducers({
  id: createSimplePayloadReducer<number | null>(ActionType.SubAccount.SetId, null),
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
  subaccounts: createSubAccountsReducer({
    Response: ActionType.SubAccounts.Response,
    Request: ActionType.SubAccounts.Request,
    Loading: ActionType.SubAccounts.Loading,
    SetSearch: ActionType.SubAccounts.SetSearch,
    UpdateInState: ActionType.SubAccounts.UpdateInState,
    RemoveFromState: ActionType.SubAccounts.RemoveFromState,
    AddToState: ActionType.SubAccounts.AddToState,
    Select: ActionType.SubAccounts.Select,
    Deselect: ActionType.SubAccounts.Deselect,
    SelectAll: ActionType.SubAccounts.SelectAll,
    Deleting: ActionType.SubAccounts.Deleting,
    Creating: ActionType.SubAccounts.Creating,
    Updating: ActionType.SubAccounts.Updating,
    RemoveFromGroup: ActionType.SubAccounts.RemoveFromGroup,
    History: {
      Response: ActionType.SubAccounts.History.Response,
      Request: ActionType.SubAccounts.History.Request,
      Loading: ActionType.SubAccounts.History.Loading
    },
    Groups: {
      Response: ActionType.SubAccounts.Groups.Response,
      Request: ActionType.SubAccounts.Groups.Request,
      Loading: ActionType.SubAccounts.Groups.Loading,
      RemoveFromState: ActionType.SubAccounts.Groups.RemoveFromState,
      UpdateInState: ActionType.SubAccounts.Groups.UpdateInState,
      AddToState: ActionType.SubAccounts.Groups.AddToState,
      Deleting: ActionType.SubAccounts.Groups.Deleting
    },
    Placeholders: {
      AddToState: ActionType.SubAccounts.Placeholders.AddToState,
      Activate: ActionType.SubAccounts.Placeholders.Activate,
      RemoveFromState: ActionType.SubAccounts.Placeholders.RemoveFromState,
      UpdateInState: ActionType.SubAccounts.Placeholders.UpdateInState
    }
  })
});

const rootReducer: Reducer<Redux.Calculator.ISubAccountStore, Redux.IAction<any>> = (
  state: Redux.Calculator.ISubAccountStore = initialSubAccountState,
  action: Redux.IAction<any>
): Redux.Calculator.ISubAccountStore => {
  let newState = genericReducer(state, action);

  // NOTE: The above reducer handles updates to the Account itself or the SubAccount itself
  // via some of these same actions. However, it does not do any recalculation of the account values,
  // because it needs the state of the Account and the state of the SubAccount(s) to do so. This
  // means moving that logic/recalculation further up the reducer tree where we have access to both
  // the SubAccount(s) and the Account in the state.
  if (
    action.type === ActionType.SubAccounts.UpdateInState ||
    action.type === ActionType.SubAccounts.RemoveFromState ||
    action.type === ActionType.SubAccounts.AddToState ||
    action.type === ActionType.SubAccounts.Placeholders.UpdateInState
  ) {
    // Update the overall SubAccount based on the underlying SubAccount(s) present and any potential
    // placeholders present.
    const subAccounts: ISubAccount[] = newState.subaccounts.data;
    const placeholders: Table.SubAccountRow[] = newState.subaccounts.placeholders;
    // Right now, the backend is configured such that the Actual value for the overall SubAccount is
    // determined from the Actual values tied to that SubAccount, not the underlying SubAccount(s).
    // If that logic changes in the backend, we need to also make that adjustment here.
    let payload: Partial<ISubAccount> = {
      estimated:
        reduce(subAccounts, (sum: number, s: ISubAccount) => sum + (s.estimated || 0), 0) +
        reduce(placeholders, (sum: number, s: Table.SubAccountRow) => sum + (s.estimated || 0), 0)
    };
    if (!isNil(newState.detail.data)) {
      if (!isNil(newState.detail.data.actual) && !isNil(payload.estimated)) {
        payload = { ...payload, variance: payload.estimated - newState.detail.data.actual };
      }
      if (!isNil(newState.detail.data)) {
        newState = {
          ...newState,
          detail: {
            ...newState.detail,
            data: { ...newState.detail.data, ...payload }
          }
        };
      }
    }
  }
  return newState;
};

export default rootReducer;
