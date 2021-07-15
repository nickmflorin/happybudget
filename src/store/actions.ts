export const ApplicationActionTypes = {
  SetDrawerVisibility: "SetDrawerVisibility",
  SetApplicationLoading: "SetApplicationLoading",
  User: {
    UpdateInState: "user.UpdateInState",
    Contacts: {
      Loading: "user.contacts.Loading",
      Response: "user.contacts.Response",
      Request: "user.contacts.Request",
      Select: "user.contacts.Select",
      SetSearch: "user.contacts.SetSearch",
      SetPage: "user.contacts.SetPage",
      SetPageSize: "user.contacts.SetPageSize",
      SetPageAndSize: "user.contacts.SetPageAndSize",
      UpdateInState: "user.contacts.UpdateInState",
      RemoveFromState: "user.contacts.RemoveFromState",
      AddToState: "user.contacts.AddToState",
      Delete: "user.contacts.Delete",
      DeleteMultiple: "user.contacts.DeleteMultiple",
      Deleting: "user.contacts.Deleting",
      Update: "user.contacts.Update",
      Updating: "user.contacts.Updating",
      Create: "user.contacts.Create",
      Creating: "user.contacts.Creating"
    }
  }
};

export const createAction = <P = any>(type: string, payload: P, options?: Redux.ActionConfig): Redux.Action<P> => {
  return { type, payload, ...options };
};

export const simpleAction = <P = any, A extends Redux.Action<P> = Redux.Action<P>>(type: string) => {
  return (payload: P, options?: Redux.ActionConfig): A => {
    return { ...createAction<P>(type, payload, options) } as A;
  };
};

export const updateLoggedInUserAction = (user: Partial<Model.User>) => {
  return createAction<Partial<Model.User>>(ApplicationActionTypes.User.UpdateInState, user);
};
export const setDrawerVisibilityAction = simpleAction<boolean>(ApplicationActionTypes.SetDrawerVisibility);
export const setApplicationLoadingAction = simpleAction<boolean>(ApplicationActionTypes.SetApplicationLoading);

export const requestContactsAction = simpleAction<null>(ApplicationActionTypes.User.Contacts.Request);
export const loadingContactsAction = simpleAction<boolean>(ApplicationActionTypes.User.Contacts.Loading);
export const responseContactsAction = simpleAction<Http.ListResponse<Model.Contact>>(
  ApplicationActionTypes.User.Contacts.Response
);
export const selectContactsAction = simpleAction<number[]>(ApplicationActionTypes.User.Contacts.Select);
export const setContactsSearchAction = simpleAction<string>(ApplicationActionTypes.User.Contacts.SetSearch);
export const setContactsPageSizeAction = simpleAction<number>(ApplicationActionTypes.User.Contacts.SetPageSize);
export const setContactsPageAction = simpleAction<number>(ApplicationActionTypes.User.Contacts.SetPage);
export const setContactsPageAndSizeAction = simpleAction<PageAndSize>(
  ApplicationActionTypes.User.Contacts.SetPageAndSize
);
export const deleteContactAction = simpleAction<number>(ApplicationActionTypes.User.Contacts.Delete);
export const deleteContactsAction = simpleAction<number[]>(ApplicationActionTypes.User.Contacts.DeleteMultiple);
export const deletingContactAction = simpleAction<Redux.ModelListActionPayload>(
  ApplicationActionTypes.User.Contacts.Deleting
);
export const removeContactFromStateAction = simpleAction<number>(ApplicationActionTypes.User.Contacts.RemoveFromState);
export const updateContactInStateAction = simpleAction<Redux.UpdateModelActionPayload<Model.Contact>>(
  ApplicationActionTypes.User.Contacts.UpdateInState
);
export const addContactToStateAction = simpleAction<Model.Contact>(ApplicationActionTypes.User.Contacts.AddToState);

// Not currently used, because the updateContact service is used directly in the
// modal for editing a contact, but we might use in the future.
export const updateContactAction = simpleAction<Redux.UpdateModelActionPayload<Model.Contact>>(
  ApplicationActionTypes.User.Contacts.Update
);
export const updatingContactAction = simpleAction<Redux.ModelListActionPayload>(
  ApplicationActionTypes.User.Contacts.Updating
);

// Not currently used, because the createContact service is used directly in the
// modal for creating a contact, but we might use in the future.
export const createContactAction = simpleAction<Http.ContactPayload>(ApplicationActionTypes.User.Contacts.Create);
export const creatingContactAction = simpleAction<boolean>(ApplicationActionTypes.User.Contacts.Creating);
