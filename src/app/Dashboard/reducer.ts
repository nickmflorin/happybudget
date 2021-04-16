import { Reducer, combineReducers } from "redux";
import { createListResponseReducer } from "lib/redux/factories";
import { ActionType } from "./actions";

const rootReducer: Reducer<Redux.Dashboard.Store, Redux.Action<any>> = combineReducers({
  contacts: createListResponseReducer<Model.Contact, Redux.ListResponseStore<Model.Contact>>({
    Response: ActionType.Contacts.Response,
    Request: ActionType.Contacts.Request,
    Loading: ActionType.Contacts.Loading,
    Select: ActionType.Contacts.Select,
    SetSearch: ActionType.Contacts.SetSearch,
    SetPage: ActionType.Contacts.SetPage,
    SetPageSize: ActionType.Contacts.SetPageSize,
    SetPageAndSize: ActionType.Contacts.SetPageAndSize,
    AddToState: ActionType.Contacts.AddToState,
    RemoveFromState: ActionType.Contacts.RemoveFromState,
    UpdateInState: ActionType.Contacts.UpdateInState,
    Creating: ActionType.Contacts.Creating,
    Updating: ActionType.Contacts.Updating,
    Deleting: ActionType.Contacts.Deleting
  }),
  templates: createListResponseReducer<Model.Template, Redux.ListResponseStore<Model.Template>, Redux.Action<any>>({
    Response: ActionType.Templates.Response,
    Loading: ActionType.Templates.Loading,
    Select: ActionType.Templates.Select,
    SetSearch: ActionType.Templates.SetSearch,
    SetPage: ActionType.Templates.SetPage,
    SetPageSize: ActionType.Templates.SetPageSize,
    SetPageAndSize: ActionType.Templates.SetPageAndSize,
    AddToState: ActionType.Templates.AddToState,
    RemoveFromState: ActionType.Templates.RemoveFromState,
    UpdateInState: ActionType.Templates.UpdateInState,
    Deleting: ActionType.Templates.Deleting
  }),
  budgets: createListResponseReducer<Model.Budget, Redux.ListResponseStore<Model.Budget>, Redux.Action<any>>({
    Response: ActionType.Budgets.Response,
    Loading: ActionType.Budgets.Loading,
    Select: ActionType.Budgets.Select,
    SetSearch: ActionType.Budgets.SetSearch,
    SetPage: ActionType.Budgets.SetPage,
    SetPageSize: ActionType.Budgets.SetPageSize,
    SetPageAndSize: ActionType.Budgets.SetPageAndSize,
    AddToState: ActionType.Budgets.AddToState,
    RemoveFromState: ActionType.Budgets.RemoveFromState,
    UpdateInState: ActionType.Budgets.UpdateInState,
    Deleting: ActionType.Budgets.Deleting
  })
});

export default rootReducer;
