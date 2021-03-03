import { Reducer, combineReducers } from "redux";
import { createListResponseReducer } from "store/util";
import { ActionType, ActionDomains } from "./actions";

const createBudgetsReducer = (domain: Redux.Dashboard.ActionDomain) =>
  createListResponseReducer<IBudget, Redux.IListResponseStore<IBudget>, Redux.Dashboard.IAction<any>>(
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
      referenceEntity: "budget",
      excludeActions: (action: Redux.Dashboard.IAction<any>) => {
        return domain !== action.domain;
      }
    }
  );

const rootReducer: Reducer<Redux.Dashboard.IStore, Redux.Dashboard.IAction<any>> = combineReducers({
  budgets: combineReducers({
    active: createBudgetsReducer(ActionDomains.ACTIVE),
    trash: createBudgetsReducer(ActionDomains.TRASH)
  })
});

export default rootReducer;
