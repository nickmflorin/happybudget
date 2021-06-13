import { Reducer, combineReducers } from "redux";
import { createModelListActionReducer, createModelListResponseReducer } from "lib/redux/factories";
import { ActionType } from "./actions";

const rootReducer: Reducer<Modules.Dashboard.Store, Redux.Action<any>> = combineReducers({
  contacts: createModelListResponseReducer<Model.Contact, Redux.ModelListResponseStore<Model.Contact>>({
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
  templates: createModelListResponseReducer<Model.SimpleTemplate, Modules.Dashboard.TemplatesStore, Redux.Action<any>>(
    {
      Response: ActionType.Templates.Response,
      Loading: ActionType.Templates.Loading,
      SetSearch: ActionType.Templates.SetSearch,
      SetPage: ActionType.Templates.SetPage,
      SetPageSize: ActionType.Templates.SetPageSize,
      SetPageAndSize: ActionType.Templates.SetPageAndSize,
      AddToState: ActionType.Templates.AddToState,
      RemoveFromState: ActionType.Templates.RemoveFromState,
      UpdateInState: ActionType.Templates.UpdateInState,
      Deleting: ActionType.Templates.Deleting
    },
    {
      subReducers: {
        duplicating: createModelListActionReducer(ActionType.Templates.Duplicating),
        moving: createModelListActionReducer(ActionType.Templates.MovingToCommunity)
      }
    }
  ),
  community: createModelListResponseReducer<
    Model.SimpleTemplate,
    Modules.Dashboard.CommunityTemplatesStore,
    Redux.Action<any>
  >(
    {
      Response: ActionType.Community.Response,
      Loading: ActionType.Community.Loading,
      SetSearch: ActionType.Community.SetSearch,
      SetPage: ActionType.Community.SetPage,
      SetPageSize: ActionType.Community.SetPageSize,
      SetPageAndSize: ActionType.Community.SetPageAndSize,
      AddToState: ActionType.Community.AddToState,
      RemoveFromState: ActionType.Community.RemoveFromState,
      UpdateInState: ActionType.Community.UpdateInState,
      Deleting: ActionType.Community.Deleting
    },
    {
      subReducers: {
        duplicating: createModelListActionReducer(ActionType.Community.Duplicating),
        hiding: createModelListActionReducer(ActionType.Community.Hiding),
        showing: createModelListActionReducer(ActionType.Community.Showing)
      }
    }
  ),
  budgets: createModelListResponseReducer<
    Model.SimpleBudget,
    Redux.ModelListResponseStore<Model.SimpleBudget>,
    Redux.Action<any>
  >({
    Response: ActionType.Budgets.Response,
    Loading: ActionType.Budgets.Loading,
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
