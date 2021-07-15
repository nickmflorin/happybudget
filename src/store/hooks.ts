import { useSelector } from "react-redux";
import { isNil } from "lodash";
import { selectContacts, selectContactsStore } from "./selectors";

export const useLoggedInUser = (): Model.User => {
  const value = useSelector((state: Modules.ApplicationStore) => {
    return state.user;
  });
  return value;
};

export const useContactsStore = (): Redux.ModelListResponseStore<Model.Contact> => {
  return useSelector(selectContactsStore);
};

export const useContacts = (): Model.Contact[] => {
  return useSelector(selectContacts);
};

export const useTimezone = (options: { defaultTz?: string | undefined } = {}): string => {
  const defaultTimezone = !isNil(options.defaultTz) ? options.defaultTz : "America/New_York";
  const value = useSelector((state: Modules.ApplicationStore) => {
    return !isNil(state.user.timezone) ? state.user.timezone : defaultTimezone;
  });
  return value;
};
