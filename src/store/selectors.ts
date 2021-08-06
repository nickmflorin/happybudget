export const selectApplicationLoading = (state: Modules.ApplicationStore) => state.loading;
export const selectContactsStore = (state: Modules.ApplicationStore) => state.user.contacts;
export const selectContacts = (state: Modules.ApplicationStore) => state.user.contacts.data;
