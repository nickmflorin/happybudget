import { useSelector } from "react-redux";
import { isNil } from "lodash";

import {
  selectContacts,
  selectContactsLoading,
  selectFilteredContacts,
  selectFilteredContactsLoading,
  selectContactsLoaded
} from "./selectors";

export const useLoggedInUser = (): Model.User => useSelector((state: Application.AuthenticatedStore) => state.user);

export const useContacts = (): Model.Contact[] => useSelector(selectContacts);

export const useContactsLoaded = (): boolean => useSelector(selectContactsLoaded);

export const useContactsLoading = (): boolean => useSelector(selectContactsLoading);

export const useFilteredContacts = (): Model.Contact[] => useSelector(selectFilteredContacts);

export const useFilteredContactsLoading = (): boolean => useSelector(selectFilteredContactsLoading);

export const useTimezone = (options: { defaultTz?: string | undefined } = {}): string => {
  const defaultTimezone = !isNil(options.defaultTz) ? options.defaultTz : "America/New_York";
  return useSelector((state: Application.AuthenticatedStore) => {
    return !isNil(state.user.timezone) ? state.user.timezone : defaultTimezone;
  });
};
