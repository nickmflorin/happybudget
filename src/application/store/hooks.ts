import { useReducer, useMemo } from "react";

import { includes } from "lodash";
import { useSelector, useDispatch } from "react-redux";

import { model, SingleOrArray } from "lib";

import * as actions from "./actions";
import * as reducers from "./reducers";
import * as selectors from "./selectors";
import * as types from "./types";

type UseSelectionReturnType<M extends model.Model> = {
  readonly selected: M["id"][];
  readonly select: (id: SingleOrArray<M["id"]>) => void;
  readonly deselect: (id: SingleOrArray<M["id"]>) => void;
  readonly toggle: (id: SingleOrArray<M["id"]>) => void;
};

export const useSelection = <M extends model.Model>(
  mode: ModelSelectionMode,
  initialState?: M["id"][],
): UseSelectionReturnType<M> => {
  const [store, dispatch] = useReducer(
    reducers.createSelectionReducer<M>(mode, initialState || []),
    initialState || [],
  );
  return {
    selected: store,
    select: (id: SingleOrArray<M["id"]>) => dispatch({ type: "SELECT", payload: id }),
    deselect: (id: SingleOrArray<M["id"]>) => dispatch({ type: "DESELECT", payload: id }),
    toggle: (id: SingleOrArray<M["id"]>) => dispatch({ type: "TOGGLE", payload: id }),
  };
};

type UseTrackModelActionsReturnType<M extends model.Model = model.Model> = {
  readonly isActive: (id: M["id"]) => boolean;
  readonly hasFailed: (id: M["id"]) => boolean;
  readonly hasCompleted: (id: M["id"]) => boolean;
  readonly addToState: (id: M["id"]) => void;
  readonly removeFromState: (id: M["id"], success?: boolean) => void;
  readonly active: M["id"][];
  readonly completed: M["id"][];
  readonly failed: M["id"][];
};

export const useTrackModelActions = <M extends model.Model = model.Model>(
  initialState?: types.ModelListActionStore<M>["current"],
): UseTrackModelActionsReturnType<M> => {
  const [store, dispatch] = useReducer(reducers.modelListActionReducer, {
    completed: [],
    current: initialState || [],
    failed: [],
  });

  /* The reducer does not care about the action TYPE - just the payload.  So we can put jibberish
     here, and it wouldn't matter.  But we need to include it for TS to compile, because all of our
     actions expect a TYPE. */
  const addToState = (id: M["id"]) => dispatch({ id, value: true });
  const removeFromState = (id: M["id"], success?: boolean) =>
    dispatch({ id, value: false, success });

  const isActive = useMemo(() => (id: M["id"]) => includes(store.current, id), [store]);
  const hasFailed = useMemo(() => (id: M["id"]) => includes(store.failed, id), [store]);
  const hasCompleted = useMemo(() => (id: M["id"]) => includes(store.completed, id), [store]);

  return {
    isActive,
    hasFailed,
    hasCompleted,
    addToState,
    removeFromState,
    active: store.current,
    completed: store.completed,
    failed: store.failed,
  };
};

export const useContacts = (): model.Contact[] => useSelector(selectors.selectContacts);

export const useContactsLoaded = (): boolean => useSelector(selectors.selectContactsLoaded);

export const useContactsLoading = (): boolean => useSelector(selectors.selectContactsLoading);

export const useFilteredContacts = (): model.Contact[] =>
  useSelector(selectors.selectFilteredContacts);

export const useFilteredContactsLoading = (): boolean =>
  useSelector(selectors.selectFilteredContactsLoading);

export const useUser = (): model.User | null => useSelector(selectors.selectUser);

export const useLoggedInUser = (): [model.User, (user: model.User) => void] => {
  const user = useSelector(selectors.selectLoggedInUser);
  const dispatch = useDispatch();
  return [user, (u: model.User) => dispatch(actions.updateLoggedInUserAction(u, {}))];
};

export const useTimezone = (): string => {
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [user, _] = useLoggedInUser();
  return user.timezone;
};
