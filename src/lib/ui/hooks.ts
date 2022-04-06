import { RefObject, useRef, useEffect, useState, useMemo } from "react";
import { forEach, isNil, debounce, uniqueId } from "lodash";
import * as JsSearch from "js-search";
import { useMediaQuery } from "react-responsive";

import { Breakpoints } from "style/constants";

import { hooks, notifications } from "lib";

export * from "./tsxHooks";

export const useIsMounted = (): RefObject<boolean> => {
  const _isMounted = useRef(true);

  useEffect(() => {
    return () => {
      _isMounted.current = false;
    };
  }, []);

  return _isMounted;
};

export const useId = (prefix: string) => useMemo(() => uniqueId(prefix), []);

export type UseSizeConfig<
  T extends string = StandardSize,
  P extends UseSizeProps<T, string> = UseSizeProps<T, "size">
> = {
  readonly options?: T[];
  readonly default?: T;
  readonly sizeProp?: keyof P;
};

export const useSize = <T extends string = StandardSize, P extends UseSizeProps<T, string> = UseSizeProps<T, "size">>(
  props: P,
  config?: UseSizeConfig<T, P>
): T | undefined =>
  useMemo<T | undefined>((): T | undefined => {
    const sizeProp = config?.sizeProp || "size";
    if (props[sizeProp as keyof P] !== undefined) {
      return props[sizeProp as keyof P] as unknown as T;
    } else {
      const options = config?.options || (["xsmall", "small", "medium", "standard", "large", "xlarge"] as T[]);
      for (let i = 0; i < options.length; i++) {
        if (props[options[i]] === true) {
          return options[i];
        }
      }
    }
    return config?.default || ("standard" as T);
  }, [config, props]);

export const InitialModalRef: ModalInstance = {
  ...notifications.ui.InitialNotificationsManager,
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
