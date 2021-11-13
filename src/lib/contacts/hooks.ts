import { useSelector } from "react-redux";

import {
  selectContacts,
  selectContactsLoading,
  selectFilteredContacts,
  selectFilteredContactsLoading,
  selectContactsLoaded
} from "./selectors";

export const useContacts = (): Model.Contact[] => useSelector(selectContacts);

export const useContactsLoaded = (): boolean => useSelector(selectContactsLoaded);

export const useContactsLoading = (): boolean => useSelector(selectContactsLoading);

export const useFilteredContacts = (): Model.Contact[] => useSelector(selectFilteredContacts);

export const useFilteredContactsLoading = (): boolean => useSelector(selectFilteredContactsLoading);
