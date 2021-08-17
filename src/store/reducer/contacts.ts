import { Reducer } from "redux";

import { redux, tabling } from "lib";
import { ApplicationActionTypes } from "store/actions";

const contactsReducer: Reducer<
  Redux.TableStore<Model.Contact>,
  Redux.Action<any>
> = tabling.reducers.createTableReducer(
  {
    Response: ApplicationActionTypes.User.Contacts.Response,
    Request: ApplicationActionTypes.User.Contacts.Request,
    Loading: ApplicationActionTypes.User.Contacts.Loading,
    SetSearch: ApplicationActionTypes.User.Contacts.SetSearch,
    AddToState: ApplicationActionTypes.User.Contacts.AddToState,
    RemoveFromState: ApplicationActionTypes.User.Contacts.RemoveFromState,
    UpdateInState: ApplicationActionTypes.User.Contacts.UpdateInState,
    Creating: ApplicationActionTypes.User.Contacts.Creating,
    Updating: ApplicationActionTypes.User.Contacts.Updating,
    Deleting: ApplicationActionTypes.User.Contacts.Deleting,
    TableChanged: ApplicationActionTypes.User.Contacts.TableChanged
  },
  redux.initialState.initialTableState
);

export default contactsReducer;
