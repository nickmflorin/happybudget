import { tabling, redux } from "lib";
import { AuthenticatedActionTypes } from "store/actions";
import { createInitialUserState } from "../initialState";

const contactsReducer: Redux.Reducer<Redux.TableStore<Model.Contact>> = tabling.reducers.createTableReducer(
  {
    Response: AuthenticatedActionTypes.User.Contacts.Response,
    Request: AuthenticatedActionTypes.User.Contacts.Request,
    Loading: AuthenticatedActionTypes.User.Contacts.Loading,
    SetSearch: AuthenticatedActionTypes.User.Contacts.SetSearch,
    AddToState: AuthenticatedActionTypes.User.Contacts.AddToState,
    RemoveFromState: AuthenticatedActionTypes.User.Contacts.RemoveFromState,
    UpdateInState: AuthenticatedActionTypes.User.Contacts.UpdateInState,
    Creating: AuthenticatedActionTypes.User.Contacts.Creating,
    Updating: AuthenticatedActionTypes.User.Contacts.Updating,
    Deleting: AuthenticatedActionTypes.User.Contacts.Deleting,
    TableChanged: AuthenticatedActionTypes.User.Contacts.TableChanged
  },
  redux.initialState.initialTableState
);

export const subAccountUnitsReducer = redux.reducers.factories.createModelListResponseReducer<Model.Tag>({
  Response: AuthenticatedActionTypes.SubAccountUnits.Response,
  Loading: AuthenticatedActionTypes.SubAccountUnits.Loading
});

/**
 * Creates the reducer to handle state changes to the User in the Redux store.
 * The initial state for the reducer is constructed with the provided Organization
 * ID and User Role.
 *
 * @param user   The User object returned from the JWT token validation.
 */
export const createUserReducer = (user: Model.User): Redux.Reducer<Modules.Authenticated.UserStore> => {
  const initialUserState = createInitialUserState(user);

  return (
    state: Modules.Authenticated.UserStore = initialUserState,
    action: Redux.Action
  ): Modules.Authenticated.UserStore => {
    let newState = { ...state };
    if (action.type === AuthenticatedActionTypes.User.UpdateInState) {
      newState = { ...newState, ...action.payload };
    }
    newState = { ...newState, contacts: contactsReducer(newState.contacts, action) };
    return newState;
  };
};
