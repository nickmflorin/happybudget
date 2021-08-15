import { Reducer, combineReducers } from "redux";
import { redux } from "lib";
import { ApplicationActionTypes } from "store/actions";

const genericTableReducer: Reducer<
  Redux.TableStore<Model.Contact>,
  Redux.Action<any>
> = redux.reducers.factories.createTableReducer({
  Response: ApplicationActionTypes.User.Contacts.Response,
  Request: ApplicationActionTypes.User.Contacts.Request,
  Loading: ApplicationActionTypes.User.Contacts.Loading,
  SetSearch: ApplicationActionTypes.User.Contacts.SetSearch,
  AddToState: ApplicationActionTypes.User.Contacts.AddToState,
  RemoveFromState: ApplicationActionTypes.User.Contacts.RemoveFromState,
  UpdateInState: ApplicationActionTypes.User.Contacts.UpdateInState,
  Creating: ApplicationActionTypes.User.Contacts.Creating,
  Updating: ApplicationActionTypes.User.Contacts.Updating,
  Deleting: ApplicationActionTypes.User.Contacts.Deleting
});

const contactsTableEventReducer: Reducer<Redux.TableStore<Model.Contact>, Redux.Action<any>> = (
  state: Redux.TableStore<Model.Contact> = redux.initialState.initialTableState,
  action: Redux.Action<Table.ChangeEvent<Tables.ContactRow, Model.Contact>>
): Redux.TableStore<Model.Contact> => {
  let newState: Redux.TableStore<Model.Contact> = { ...state };
  return newState;
};

const contactsTableReducer: Reducer<Redux.TableStore<Model.Contact>, Redux.Action<any>> = (
  state: Redux.TableStore<Model.Contact> = redux.initialState.initialTableState,
  action: Redux.Action<any>
): Redux.TableStore<Model.Contact> => {
  let newState: Redux.TableStore<Model.Contact> = { ...state };
  newState = genericTableReducer(state, action);

  if (action.type === ApplicationActionTypes.User.Contacts.TableChanged) {
    newState = contactsTableEventReducer(newState, action);
  }
  return newState;
};

const contactsReducer: Reducer<Modules.ContactsStore, Redux.Action<any>> = combineReducers({
  table: contactsTableReducer
});

export default contactsReducer;
