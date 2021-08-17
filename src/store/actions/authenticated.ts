import { redux } from "lib";

const ActionTypes = {
  SubAccountUnits: {
    Response: "subaccountunits.Response",
    Loading: "subaccountunits.Loading"
  },
  User: {
    UpdateInState: "user.UpdateInState",
    Contacts: {
      TableChanged: "user.contacts.TableChanged",
      Loading: "user.contacts.Loading",
      Response: "user.contacts.Response",
      Request: "user.contacts.Request",
      SetSearch: "user.contacts.SetSearch",
      UpdateInState: "user.contacts.UpdateInState",
      RemoveFromState: "user.contacts.RemoveFromState",
      AddToState: "user.contacts.AddToState",
      Deleting: "user.contacts.Deleting",
      Updating: "user.contacts.Updating",
      Creating: "user.contacts.Creating"
    }
  }
};

export const updateLoggedInUserAction = (user: Partial<Model.User>) => {
  return redux.actions.createAction<Partial<Model.User>>(ActionTypes.User.UpdateInState, user);
};
export const requestContactsAction = redux.actions.simpleAction<null>(ActionTypes.User.Contacts.Request);
export const loadingContactsAction = redux.actions.simpleAction<boolean>(ActionTypes.User.Contacts.Loading);
export const responseContactsAction = redux.actions.simpleAction<Http.ListResponse<Model.Contact>>(
  ActionTypes.User.Contacts.Response
);
export const handleContactsTableChangeEventAction = redux.actions.simpleAction<
  Table.ChangeEvent<Tables.ContactRow, Model.Contact>
>(ActionTypes.User.Contacts.TableChanged);
export const setContactsSearchAction = redux.actions.simpleAction<string>(ActionTypes.User.Contacts.SetSearch);
export const deletingContactAction = redux.actions.simpleAction<Redux.ModelListActionPayload>(
  ActionTypes.User.Contacts.Deleting
);
export const removeContactFromStateAction = redux.actions.simpleAction<number>(
  ActionTypes.User.Contacts.RemoveFromState
);
export const updateContactInStateAction = redux.actions.simpleAction<Redux.UpdateModelActionPayload<Model.Contact>>(
  ActionTypes.User.Contacts.UpdateInState
);
export const addContactToStateAction = redux.actions.simpleAction<Model.Contact>(ActionTypes.User.Contacts.AddToState);
export const updatingContactAction = redux.actions.simpleAction<Redux.ModelListActionPayload>(
  ActionTypes.User.Contacts.Updating
);
export const creatingContactAction = redux.actions.simpleAction<boolean>(ActionTypes.User.Contacts.Creating);
export const responseSubAccountUnitsAction = redux.actions.simpleAction<Http.ListResponse<Model.Tag>>(
  ActionTypes.SubAccountUnits.Response
);
export const loadingSubAccountUnitsAction = redux.actions.simpleAction<boolean>(ActionTypes.SubAccountUnits.Loading);

export default ActionTypes;
