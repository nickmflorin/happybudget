import { useRef, useMemo } from "react";
import { isNil } from "lodash";

import { notifications } from "lib";

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const InitialMenuRef: IMenuRef<any, any> = {
  /* eslint-disable-next-line @typescript-eslint/no-empty-function */
  setItemLoading: () => {},
  getState: () => [],
  getSearchValue: () => "",
  /* eslint-disable-next-line @typescript-eslint/no-empty-function */
  incrementFocusedIndex: () => {},
  /* eslint-disable-next-line @typescript-eslint/no-empty-function */
  decrementFocusedIndex: () => {},
  getModelAtFocusedIndex: () => null,
  /* eslint-disable-next-line @typescript-eslint/no-empty-function */
  performActionAtFocusedIndex: () => {},
  /* eslint-disable-next-line @typescript-eslint/no-empty-function */
  focus: () => {},
  /* eslint-disable-next-line @typescript-eslint/no-empty-function */
  focusSearch: () => {}
};

export const useMenu = <
  S extends Record<string, unknown> = MenuItemSelectedState,
  M extends MenuItemModel<S> = MenuItemModel<S>
>(): NonNullRef<IMenuRef<S, M>> => {
  return useRef<IMenuRef<S, M>>(InitialMenuRef);
};

export const useMenuIfNotDefined = <
  S extends Record<string, unknown> = MenuItemSelectedState,
  M extends MenuItemModel<S> = MenuItemModel<S>
>(
  menu?: NonNullRef<IMenuRef<S, M>>
): NonNullRef<IMenuRef<S, M>> => {
  const ref = useRef<IMenuRef<S, M>>(InitialMenuRef);
  const returnRef = useMemo(() => (!isNil(menu) ? menu : ref), [menu, ref.current]);
  return returnRef;
};

export const InitialContentMenuRef: ContentMenuInstance = {
  ...notifications.ui.InitialNotificationsManager,
  /* eslint-disable-next-line @typescript-eslint/no-empty-function */
  setLoading: () => {},
  loading: false
};

export const useContentMenu = (): NonNullRef<ContentMenuInstance> => {
  const ref = useRef<ContentMenuInstance>(InitialContentMenuRef);
  return ref;
};

export const useContentMenuIfNotDefined = (menu?: NonNullRef<ContentMenuInstance>): NonNullRef<ContentMenuInstance> => {
  const ref = useRef<ContentMenuInstance>(InitialContentMenuRef);
  const returnRef = useMemo(() => (!isNil(menu) ? menu : ref), [menu, ref.current]);
  return returnRef;
};
