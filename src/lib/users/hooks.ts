import { useSelector } from "react-redux";
import { isNil } from "lodash";

export const useLoggedInUser = (): Model.User => useSelector((state: Application.AuthenticatedStore) => state.user);

export const useTimezone = (options: { defaultTz?: string | undefined } = {}): string => {
  const defaultTimezone = !isNil(options.defaultTz) ? options.defaultTz : "America/New_York";
  return useSelector((state: Application.AuthenticatedStore) => {
    return !isNil(state.user.timezone) ? state.user.timezone : defaultTimezone;
  });
};
