import { redux } from "lib";

export const selectApplicationLoading = (state: Modules.ApplicationStore) => state.loading;
export const selectContactsStore = (state: Modules.ApplicationStore) => state.user.contacts;
export const selectContacts = redux.selectors.simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.user.contacts.table.data
);
export const selectContactsLoading = (state: Modules.ApplicationStore) => state.user.contacts.table.loading;
export const selectContactsSearch = (state: Modules.ApplicationStore) => state.user.contacts.table.search;
