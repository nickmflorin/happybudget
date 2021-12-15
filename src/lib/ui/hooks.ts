import { RefObject, useRef, useEffect, useState, useMemo, useReducer } from "react";
import { forEach, isNil, debounce, find, reduce, filter } from "lodash";
import * as JsSearch from "js-search";
import axios from "axios";
import { useMediaQuery } from "react-responsive";
import { Form as RootForm } from "antd";

import { Breakpoints } from "style/constants";

import * as api from "api";
import { util, hooks, notifications } from "lib";

export * from "./tsxHooks";

export const InitialLayoutRef: ILayoutRef = {
  setSidebarVisible: (visible: boolean) => {},
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

export const InitialMenuRef: IMenuRef<any, any> = {
  getState: () => [],
  getSearchValue: () => "",
  incrementFocusedIndex: () => {},
  decrementFocusedIndex: () => {},
  getModelAtFocusedIndex: () => null,
  performActionAtFocusedIndex: (e: KeyboardEvent) => {},
  focus: (value: boolean) => {},
  focusSearch: (value: boolean, search?: string) => {}
};

export const useMenu = <
  S extends object = MenuItemSelectedState,
  M extends MenuItemModel<S> = MenuItemModel<S>
>(): NonNullRef<IMenuRef<S, M>> => {
  return useRef<IMenuRef<S, M>>(InitialMenuRef);
};

/* eslint-disable indent */
export const useMenuIfNotDefined = <
  S extends object = MenuItemSelectedState,
  M extends MenuItemModel<S> = MenuItemModel<S>
>(
  menu?: NonNullRef<IMenuRef<S, M>>
): NonNullRef<IMenuRef<S, M>> => {
  const ref = useRef<IMenuRef<S, M>>(InitialMenuRef);
  const returnRef = useMemo(() => (!isNil(menu) ? menu : ref), [menu, ref.current]);
  return returnRef;
};

export const InitialDropdownRef: IDropdownRef = {
  setVisible: (visible: boolean) => {}
};

export const useDropdown = (): NonNullRef<IDropdownRef> => {
  return useRef<IDropdownRef>(InitialDropdownRef);
};

export const useDropdownIfNotDefined = (dropdown?: NonNullRef<IDropdownRef>): NonNullRef<IDropdownRef> => {
  const ref = useRef<IDropdownRef>(InitialDropdownRef);
  const returnRef = useMemo(() => (!isNil(dropdown) ? dropdown : ref), [dropdown, ref.current]);
  return returnRef;
};

type FormNotifyAction = {
  readonly notifications: SingleOrArray<FormNotification | Error | string>;
  readonly append?: boolean;
};

const formNotificationReducer = (
  state: FormNotification[] = [],
  action: FormNotifyAction | undefined
): FormNotification[] => {
  if (!isNil(action)) {
    const ns = Array.isArray(action.notifications) ? action.notifications : [];
    return reduce(
      ns,
      (curr: FormNotification[], n: FormNotification | NotificationDetail): FormNotification[] => {
        if (notifications.typeguards.isNotificationDetail(n)) {
          return [
            ...curr,
            {
              message: notifications.notificationDetailToString(n),
              level: "error"
            }
          ];
        }
        return [...curr, n];
      },
      action.append === true ? state : []
    );
  } else {
    return [];
  }
};

type FieldWithErrors = { readonly name: string; readonly errors: string[] };

const isFieldNotification = (
  e: FormNotification | Http.Error | Error | string
): e is FormFieldNotification | Http.FieldError => {
  if (api.typeguards.isHttpError(e)) {
    return e.error_type === "field";
  }
  return (
    typeof e === "object" && !(e instanceof Error) && notifications.typeguards.formNotificationIsFieldNotification(e)
  );
};

export const useForm = <T>(form?: Partial<FormInstance<T>> | undefined): FormInstance<T> => {
  const _useAntdForm = RootForm.useForm();
  const antdForm = _useAntdForm[0];

  const [ns, dispatchNotification] = useReducer(formNotificationReducer, []);
  const [loading, setLoading] = useState<boolean | undefined>(undefined);

  const renderFieldErrors = useMemo(
    () => (errors: (Http.FieldError | FormFieldNotification)[]) => {
      let fieldsWithErrors = reduce(
        errors,
        (curr: FieldWithErrors[], e: Http.FieldError | FormFieldNotification): FieldWithErrors[] => {
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

  const notify = useMemo(
    () => (notes: SingleOrArray<FormNotification | Http.Error | Error | string>, opts?: AppNotificationOptions) => {
      const notices = Array.isArray(notes) ? notes : [notes];
      /* For the notification sources that pertain to field type errors, render
				 those next to the individual fields of the form. */
      renderFieldErrors(
        filter(notices, (n: FormNotification) => isFieldNotification(n)) as (Http.FieldError | FormFieldNotification)[]
      );
      /* Filter out the notifications that do not pertain to individual fields
				 of the form and dispatch them to the notifications store. */
      dispatchNotification({
        notifications: filter(notices, (n: FormNotification) => !isFieldNotification(n)) as FormNotification[],
        append: opts?.append
      });
    },
    [renderFieldErrors]
  );

  const wrapForm = useMemo<FormInstance<T>>(() => {
    return {
      ...antdForm,
      autoFocusField: form?.autoFocusField,
      notifications: ns,
      clearNotifications: () => dispatchNotification(undefined),
      submit: () => {
        dispatchNotification(undefined);
        antdForm.submit();
      },
      resetFields: () => {
        dispatchNotification(undefined);
        antdForm.resetFields();
      },
      notify,
      setLoading,
      handleRequestError: (e: Error, opts?: AppNotificationOptions) => {
        if (!axios.isCancel(e) && !(e instanceof api.ForceLogout)) {
          notifications.requestError(e, { notifyUser: false });
          if (e instanceof api.ClientError) {
            notify(e.errors, opts);
          } else if (e instanceof api.NetworkError) {
            notify("There was a problem communicating with the server.", opts);
          } else if (e instanceof api.ServerError) {
            notify("There was a problem communicating with the server.", opts);
          } else {
            throw e;
          }
        }
      },
      loading,
      ...form
    };
  }, [form, antdForm, loading, ns, notify]);

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
   * 	https://reactjs.org/docs/hooks-faq.html#how-to-create-expensive-objects
   * 		-lazily
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
