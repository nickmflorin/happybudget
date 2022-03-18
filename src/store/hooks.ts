import { useSelector } from "react-redux";

import * as selectors from "./selectors";

export const useContacts = (): Model.Contact[] => useSelector(selectors.selectContacts);

export const useContactsLoaded = (): boolean => useSelector(selectors.selectContactsLoaded);

export const useContactsLoading = (): boolean => useSelector(selectors.selectContactsLoading);

export const useFilteredContacts = (): Model.Contact[] => useSelector(selectors.selectFilteredContacts);

export const useFilteredContactsLoading = (): boolean => useSelector(selectors.selectFilteredContactsLoading);

export const useUser = (): Model.User | null => useSelector(selectors.selectUser);

export const useLoggedInUser = (): Model.User => useSelector(selectors.selectLoggedInUser);

export const useTimezone = (): string => {
  const user = useLoggedInUser();
  return user.timezone;
};
