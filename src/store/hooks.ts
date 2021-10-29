import { useSelector } from "react-redux";
import { isNil } from "lodash";
import {
  selectContacts,
  selectContactsLoading,
  selectFilteredContacts,
  selectFilteredContactsLoading,
  selectContactsLoaded
} from "./selectors";

export const useLoggedInUser = (): Model.User => {
  const value = useSelector((state: Application.Authenticated.Store) => {
    return state.user;
  });
  return value;
};

export const useContacts = (): Model.Contact[] => {
  return useSelector(selectContacts);
};

export const useContactsLoaded = (): boolean => {
  return useSelector(selectContactsLoaded);
};

export const useContactsLoading = (): boolean => {
  return useSelector(selectContactsLoading);
};

export const useFilteredContacts = (): Model.Contact[] => {
  return useSelector(selectFilteredContacts);
};

export const useFilteredContactsLoading = (): boolean => {
  return useSelector(selectFilteredContactsLoading);
};

export const useTimezone = (options: { defaultTz?: string | undefined } = {}): string => {
  const defaultTimezone = !isNil(options.defaultTz) ? options.defaultTz : "America/New_York";
  const value = useSelector((state: Application.Authenticated.Store) => {
    return !isNil(state.user.timezone) ? state.user.timezone : defaultTimezone;
  });
  return value;
};
