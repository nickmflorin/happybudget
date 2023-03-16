import { useSelector, useDispatch } from "react-redux";

import * as actions from "./actions";
import * as selectors from "./selectors";

export const useContacts = (): Model.Contact[] => useSelector(selectors.selectContacts);

export const useContactsLoaded = (): boolean => useSelector(selectors.selectContactsLoaded);

export const useContactsLoading = (): boolean => useSelector(selectors.selectContactsLoading);

export const useFilteredContacts = (): Model.Contact[] =>
  useSelector(selectors.selectFilteredContacts);

export const useFilteredContactsLoading = (): boolean =>
  useSelector(selectors.selectFilteredContactsLoading);

export const useUser = (): Model.User | null => useSelector(selectors.selectUser);

export const useLoggedInUser = (): [Model.User, (user: Model.User) => void] => {
  const user = useSelector(selectors.selectLoggedInUser);
  const dispatch = useDispatch();
  return [user, (u: Model.User) => dispatch(actions.updateLoggedInUserAction(u, {}))];
};

export const useTimezone = (): string => {
  const [user, _] = useLoggedInUser();
  return user.timezone;
};
