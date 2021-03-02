import { Reducer, combineReducers } from "redux";
import { createListResponseReducer } from "store/util";
import { ActionType } from "./actions";

const rootReducer: Reducer<Redux.Dashboard.IStore, Redux.IAction<any>> = combineReducers({
  budgets: createListResponseReducer<IBudget, Redux.IListResponseStore<IBudget>, Redux.IAction<any>>(
    {
      Response: ActionType.Budgets.Response,
      Loading: ActionType.Budgets.Loading,
      Select: ActionType.Budgets.Select,
      SetSearch: ActionType.Budgets.SetSearch,
      SetPage: ActionType.Budgets.SetPage,
      SetPageSize: ActionType.Budgets.SetPageSize,
      SetPageAndSize: ActionType.Budgets.SetPageAndSize,
      AddToState: ActionType.Budgets.AddToState,
      RemoveFromState: ActionType.Budgets.RemoveFromState,
      UpdateInState: ActionType.Budgets.UpdateInState
    },
    {
      referenceEntity: "budget"
    }
  )
});

export default rootReducer;
