import { RefObject, useRef, useEffect, useState, useMemo } from "react";
import { forEach, isNil, debounce, find, reduce } from "lodash";
import * as JsSearch from "js-search";
import { useMediaQuery } from "react-responsive";
import { Form as RootForm } from "antd";

import { Breakpoints } from "style/constants";

import { util, hooks, notifications } from "lib";

export * from "./tsxHooks";

type UseSizeConfig<T extends string = string> = {
  readonly options: T[];
  readonly default?: T;
};

export const useSize = <T extends string = string, P extends UseSizeProps<T> = UseSizeProps<T>>(
  config: UseSizeConfig<T>,
  props: P
) =>
  useMemo(() => {
    if (props.size !== undefined) {
      return props.size;
    } else {
      for (let i = 0; i < config.options.length; i++) {
        if (props[config.options[i]] === true) {
          return config.options[i];
        }
      }
    }
    return config.default;
  }, [config.options, config.default, props]);

export const InitialLayoutRef: ILayoutRef = {
  /* eslint-disable-next-line @typescript-eslint/no-empty-function */
  setSidebarVisible: () => {},
  /* eslint-disable-next-line @typescript-eslint/no-empty-function */
  toggleSidebar: () => {},
  sidebarVisible: true
};

export const useLayout = (): NonNullRef<ILayoutRef> => {
  return useRef<ILayoutRef>(InitialLayoutRef);
};

export const useLayoutIfNotDefined = (layout?: NonNullRef<ILayoutRef>): NonNullRef<ILayoutRef> => {
  const ref = useRef<ILayoutRef>(InitialLayoutRef);
  const returnRef = useMemo(() => (!isNil(layout) ? layout : ref), [layout, ref.current]);
  return returnRef;
};

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const InitialMenuRef: IMenuRef<any, any> = {
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

export const InitialNotificationsManager: UINotificationsManager = {
  notifications: [],
  /* eslint-disable-next-line @typescript-eslint/no-empty-function */
  clearNotifications: () => {},
  notify: () => [],
  lookupAndNotify: () => [],
  handleRequestError: () => []
};

export const InitialContentMenuRef: ContentMenuInstance = {
  ...InitialNotificationsManager,
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

export const InitialModalRef: ModalInstance = {
  ...InitialNotificationsManager,
  /* eslint-disable-next-line @typescript-eslint/no-empty-function */
  setLoading: () => {},
  loading: false
};

export const useModal = (): NonNullRef<ModalInstance> => {
  const ref = useRef<ModalInstance>(InitialModalRef);

  return ref;
};

export const useModalIfNotDefined = (modal?: NonNullRef<ModalInstance>): NonNullRef<ModalInstance> => {
  const ref = useRef<ModalInstance>(InitialModalRef);
  const returnRef = useMemo(() => (!isNil(modal) ? modal : ref), [modal, ref.current]);
  return returnRef;
};

export const InitialDropdownRef: IDropdownRef = {
  /* eslint-disable-next-line @typescript-eslint/no-empty-function */
  setVisible: () => {}
};

export const useDropdown = (): NonNullRef<IDropdownRef> => {
  return useRef<IDropdownRef>(InitialDropdownRef);
};

export const useDropdownIfNotDefined = (dropdown?: NonNullRef<IDropdownRef>): NonNullRef<IDropdownRef> => {
  const ref = useRef<IDropdownRef>(InitialDropdownRef);
  const returnRef = useMemo(() => (!isNil(dropdown) ? dropdown : ref), [dropdown, ref.current]);
  return returnRef;
};

export const useForm = <T>(form?: Partial<FormInstance<T>> | undefined): FormInstance<T> => {
  const _useAntdForm = RootForm.useForm();
  const antdForm = _useAntdForm[0];

  const [loading, setLoading] = useState<boolean | undefined>(undefined);

  const handleFieldErrors = useMemo(
    () => (errors: UIFieldNotification[]) => {
      const fieldsWithErrors = reduce(
        errors,
        (curr: FieldWithErrors[], e: UIFieldNotification): FieldWithErrors[] => {
          const existing = find(curr, { name: e.field });
          if (!isNil(existing)) {
            return util.replaceInArray<FieldWithErrors>(
              curr,
              { name: e.field },
              { ...existing, errors: [...existing.errors, e.message] }
            );
          } else {
            return [...curr, { name: e.field, errors: [e.message] }];
          }
        },
        []
      );
      antdForm.setFields(fieldsWithErrors);
    },
    [antdForm.setFields]
  );

  const NotificationsHandler = notifications.ui.useNotificationsManager({
    handleFieldErrors,
    defaultBehavior: "replace",
    defaultClosable: false
  });

  const wrapForm = useMemo<FormInstance<T>>(() => {
    return {
      ...antdForm,
      autoFocusField: form?.autoFocusField,
      ...NotificationsHandler,
      submit: () => {
        NotificationsHandler.clearNotifications();
        antdForm.submit();
      },
      resetFields: () => {
        NotificationsHandler.clearNotifications();
        antdForm.resetFields();
      },
      setLoading,
      loading,
      ...form
    };
  }, [form, antdForm, loading, NotificationsHandler]);

  return wrapForm;
};

export const useFormIfNotDefined = <T>(
  options?: Partial<FormInstance<T>> | undefined,
  form?: FormInstance<T>
): FormInstance<T> => {
  const newForm = useForm(options);
  return useMemo(() => (!isNil(form) ? form : newForm), [form, newForm]);
};

export const useLessThanBreakpoint = (id: Style.BreakpointId): boolean => {
  return useMediaQuery({ query: `(max-width: ${Breakpoints[id]}px)` });
};

export const useGreaterThanBreakpoint = (id: Style.BreakpointId): boolean => {
  return useMediaQuery({ query: `(min-width: ${Breakpoints[id]}px)` });
};

const createRootElement = (id: string | number): HTMLElement => {
  const rootContainer = document.createElement("div");
  rootContainer.setAttribute("id", String(id));
  return rootContainer;
};

const addRootElement = (rootElem: Element): void => {
  if (!isNil(document.body.lastElementChild)) {
    document.body.insertBefore(rootElem, document.body.lastElementChild.nextElementSibling);
  }
};

/**
 * https://www.jayfreestone.com/writing/react-portals-with-hooks/
 */
export const usePortalReference = (id: string | number) => {
  const rootElemRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const existingParent = document.querySelector(`#${id}`);
    const parentElem = existingParent || createRootElement(id);

    if (!existingParent) {
      addRootElement(parentElem);
    }
    // Add the detached element to the parent
    if (!isNil(rootElemRef.current)) {
      parentElem.appendChild(rootElemRef.current);
    }

    return () => {
      if (!isNil(rootElemRef.current)) {
        rootElemRef.current.remove();
        if (!parentElem.childElementCount) {
          parentElem.remove();
        }
      }
    };
  }, [id]);

  /**
   * It's important we evaluate this lazily:
   * - We need first render to contain the DOM element, so it shouldn't happen
   *   in useEffect. We would normally put this in the constructor().
   * - We can't do 'const rootElemRef = useRef(document.createElement('div))',
   *   since this will run every single render (that's a lot).
   * - We want the ref to consistently point to the same DOM element and only
   *   ever run once.
   * @link
   * https://reactjs.org/docs/hooks-faq.html#how-to-create-expensive-objects
   * -lazily
   */
  const getRootElem = () => {
    if (!rootElemRef.current) {
      rootElemRef.current = document.createElement("div");
    }
    return rootElemRef.current;
  };

  return getRootElem();
};

export const usePortal = (id: string | number | undefined): Element | null => {
  const [parent, setParent] = useState<Element | null>(null);

  useEffect(() => {
    if (!isNil(id)) {
      const existingParent = document.querySelector(`#${id}`);
      const parentElem = existingParent || createRootElement(id);
      setParent(parentElem);
    }
  }, [id]);

  return parent;
};

export interface SearchOptions {
  readonly indices: SearchIndicies;
  readonly debounceTime?: number;
  readonly idField?: string;
  readonly disabled?: boolean;
}

export const useDebouncedJSSearch = <T>(search: string | undefined, models: T[], options: SearchOptions): T[] => {
  const [jsSearch, setJsSearch] = useState<JsSearch.Search | undefined>(undefined);
  const [filteredModels, setFilteredModels] = useState<T[]>(models);

  useEffect(() => {
    const jssearch = new JsSearch.Search(options.idField || "id");
    jssearch.indexStrategy = new JsSearch.PrefixIndexStrategy();
    forEach(options.indices, (indice: SearchIndex) => {
      jssearch.addIndex(indice);
    });
    jssearch.addDocuments(models);
    setJsSearch(jssearch);
  }, []);

  const doSearch = (searchValue: string) => {
    if (!isNil(jsSearch)) {
      const values = jsSearch.search(searchValue) as T[];
      setFilteredModels(values);
    }
  };
  const debouncedSearch = debounce(doSearch, options.debounceTime || 300);

  useEffect(() => {
    if (options.disabled !== true) {
      if (!isNil(search) && search !== "") {
        debouncedSearch(search);
      } else {
        setFilteredModels(models);
      }
      return () => {
        debouncedSearch.cancel();
      };
    } else {
      setFilteredModels(models);
    }
  }, [search, hooks.useDeepEqualMemo(models)]);

  return filteredModels;
};

export const useTrackFirstRender = (): boolean => {
  const isFirstRender = useRef(true);
  useEffect(() => {
    isFirstRender.current = false;
  }, []);
  return isFirstRender.current;
};

export const useIsMounted = (): RefObject<boolean> => {
  const _isMounted = useRef(true);

  useEffect(() => {
    return () => {
      _isMounted.current = false;
    };
  }, []);

  return _isMounted;
};
