import { useSelector } from "react-redux";
import { isNil } from "lodash";
import { selectContacts, selectSubAccountUnits } from "./selectors";

export const useLoggedInUser = (): Model.User => {
  const value = useSelector((state: Modules.Authenticated.StoreObj) => {
    return state.user;
  });
  return value;
};

export const useContacts = (): Model.Contact[] => {
  return useSelector(selectContacts);
};

export const useSubAccountUnits = (): Model.Tag[] => {
  return useSelector(selectSubAccountUnits);
};

export const useTimezone = (options: { defaultTz?: string | undefined } = {}): string => {
  const defaultTimezone = !isNil(options.defaultTz) ? options.defaultTz : "America/New_York";
  const value = useSelector((state: Modules.Authenticated.StoreObj) => {
    return !isNil(state.user.timezone) ? state.user.timezone : defaultTimezone;
  });
  return value;
};
