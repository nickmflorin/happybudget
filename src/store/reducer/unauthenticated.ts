import { redux, tabling } from "lib";
import { UnauthenticatedActionTypes } from "store/actions";

export const subAccountUnitsReducer = redux.reducers.factories.createReadOnlyModelListResponseReducer<Model.Tag>({
  Response: UnauthenticatedActionTypes.SubAccountUnits.Response,
  Loading: UnauthenticatedActionTypes.SubAccountUnits.Loading
});

export const contactsReducer: Redux.Reducer<Redux.ReadOnlyTableStore<Model.Contact>> =
  tabling.reducers.createReadOnlyTableReducer(
    {
      Response: UnauthenticatedActionTypes.Contacts.Response,
      Request: UnauthenticatedActionTypes.Contacts.Request,
      Loading: UnauthenticatedActionTypes.Contacts.Loading,
      SetSearch: UnauthenticatedActionTypes.Contacts.SetSearch
    },
    redux.initialState.initialReadOnlyTableState
  );
