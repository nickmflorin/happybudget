import { combineReducers } from "redux";
import { redux } from "lib";
import { ActionType } from "./actions";

const rootReducer: Redux.Reducer<Modules.Authenticated.Dashboard.StoreObj> = combineReducers({
  templates: redux.reducers.factories.createModelListResponseReducer<
    Model.SimpleTemplate,
    Redux.ModelListResponseStore<Model.SimpleTemplate>
  >({
    Response: ActionType.Templates.Response,
    Loading: ActionType.Templates.Loading,
    SetSearch: ActionType.Templates.SetSearch,
    AddToState: ActionType.Templates.AddToState,
    RemoveFromState: ActionType.Templates.RemoveFromState,
    UpdateInState: ActionType.Templates.UpdateInState
  }),
  community: redux.reducers.factories.createModelListResponseReducer<
    Model.SimpleTemplate,
    Redux.ModelListResponseStore<Model.SimpleTemplate>
  >({
    Response: ActionType.Community.Response,
    Loading: ActionType.Community.Loading,
    SetSearch: ActionType.Community.SetSearch,
    AddToState: ActionType.Community.AddToState,
    RemoveFromState: ActionType.Community.RemoveFromState,
    UpdateInState: ActionType.Community.UpdateInState
  }),
  budgets: redux.reducers.factories.createModelListResponseReducer<
    Model.SimpleBudget,
    Redux.ModelListResponseStore<Model.SimpleBudget>
  >({
    Response: ActionType.Budgets.Response,
    Loading: ActionType.Budgets.Loading,
    SetSearch: ActionType.Budgets.SetSearch,
    AddToState: ActionType.Budgets.AddToState,
    RemoveFromState: ActionType.Budgets.RemoveFromState,
    UpdateInState: ActionType.Budgets.UpdateInState
  })
});

export default rootReducer;
