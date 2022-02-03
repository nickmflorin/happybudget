import { useSelector } from "react-redux";

import * as selectors from "./selectors";

export const useUser = (): Model.User | null => useSelector(selectors.selectUser);

export const useLoggedInUser = (): Model.User => useSelector(selectors.selectLoggedInUser);

export const useTimezone = (): string => {
  const user = useLoggedInUser();
  return user.timezone;
};
