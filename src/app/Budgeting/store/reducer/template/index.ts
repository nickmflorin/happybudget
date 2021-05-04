import { Reducer, combineReducers } from "redux";
import { isNil, reduce } from "lodash";
import { createDetailResponseReducer, createSimplePayloadReducer } from "lib/redux/factories";

import { ActionType } from "../../actions";
import initialState from "../../initialState";

import accountRootReducer from "./account";
import accountsRootReducer from "./accounts";
import createFringesReducer from "../fringes";
import subAccountRootReducer from "./subAccount";

const genericReducer = combineReducers({
  instance: createSimplePayloadReducer<Model.TemplateAccount | Model.TemplateSubAccount | null>(
    ActionType.Template.SetInstance,
    null
  ),
  account: accountRootReducer,
  subaccount: subAccountRootReducer,
  accounts: accountsRootReducer,
  fringes: createFringesReducer("Template"),
  template: combineReducers({
    id: createSimplePayloadReducer<number | null>(ActionType.Template.SetId, null),
    detail: createDetailResponseReducer<Model.Template, Redux.ModelDetailResponseStore<Model.Template>, Redux.Action>({
      Response: ActionType.Template.Response,
      Loading: ActionType.Template.Loading,
      Request: ActionType.Template.Request
    })
  })
});

const rootReducer: Reducer<Redux.Budgeting.Template.Store, Redux.Action<any>> = (
  state: Redux.Budgeting.Template.Store = initialState.template,
  action: Redux.Action<any>
): Redux.Budgeting.Template.Store => {
  let newState = genericReducer(state, action);

  if (!isNil(action.payload)) {
    if (
      action.type === ActionType.Template.SubAccount.SubAccounts.UpdateInState ||
      action.type === ActionType.Template.SubAccount.SubAccounts.RemoveFromState ||
      action.type === ActionType.Template.SubAccount.SubAccounts.AddToState
    ) {
      // Update the overall SubAccount based on the underlying SubAccount(s) present.
      const subAccounts: Model.TemplateSubAccount[] = newState.subaccount.subaccounts.data;
      let payload: Partial<Model.TemplateSubAccount> = {
        estimated: reduce(subAccounts, (sum: number, s: Model.TemplateSubAccount) => sum + (s.estimated || 0), 0)
      };
      if (!isNil(newState.subaccount.detail.data)) {
        if (!isNil(newState.subaccount.detail.data)) {
          newState = {
            ...newState,
            subaccount: {
              ...newState.subaccount,
              detail: {
                ...newState.subaccount.detail,
                data: { ...newState.subaccount.detail.data, ...payload }
              }
            }
          };
        }
      }
    } else if (
      action.type === ActionType.Template.Account.SubAccounts.UpdateInState ||
      action.type === ActionType.Template.Account.SubAccounts.RemoveFromState ||
      action.type === ActionType.Template.Account.SubAccounts.AddToState
    ) {
      // Update the overall Account based on the underlying SubAccount(s) present.
      const subAccounts: Model.TemplateSubAccount[] = newState.account.subaccounts.data;
      const estimated = reduce(subAccounts, (sum: number, s: Model.TemplateSubAccount) => sum + (s.estimated || 0), 0);
      if (!isNil(newState.account.detail.data)) {
        newState = {
          ...newState,
          account: {
            ...newState.account,
            detail: {
              ...newState.account.detail,
              data: { ...newState.account.detail.data, estimated }
            }
          }
        };
      }
    }
  }
  return newState;
};

export default rootReducer;
