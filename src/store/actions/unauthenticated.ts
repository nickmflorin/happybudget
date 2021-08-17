import { redux } from "lib";

const ActionTypes = {
  SubAccountUnits: {
    Response: "subaccountunits.Response",
    Loading: "subaccountunits.Loading"
  },
  Contacts: {
    Loading: "user.contacts.Loading",
    Response: "user.contacts.Response",
    Request: "user.contacts.Request",
    SetSearch: "user.contacts.SetSearch"
  }
};

export const requestContactsAction = redux.actions.simpleAction<null>(ActionTypes.Contacts.Request);
export const loadingContactsAction = redux.actions.simpleAction<boolean>(ActionTypes.Contacts.Loading);
export const responseContactsAction = redux.actions.simpleAction<Http.ListResponse<Model.Contact>>(
  ActionTypes.Contacts.Response
);
export const setContactsSearchAction = redux.actions.simpleAction<string>(ActionTypes.Contacts.SetSearch);
export const responseSubAccountUnitsAction = redux.actions.simpleAction<Http.ListResponse<Model.Tag>>(
  ActionTypes.SubAccountUnits.Response
);
export const loadingSubAccountUnitsAction = redux.actions.simpleAction<boolean>(ActionTypes.SubAccountUnits.Loading);

export default ActionTypes;
