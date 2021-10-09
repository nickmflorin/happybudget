import { useRef, useEffect, useState, useMemo } from "react";
import { forEach, isNil, debounce, find } from "lodash";
import * as JsSearch from "js-search";
import axios from "axios";
import { useMediaQuery } from "react-responsive";
import { Form as RootForm } from "antd";

import { Breakpoints } from "style/constants";

import * as api from "api";
import { util, hooks } from "lib";

export * from "./tsxHooks";

export const InitialMenuRef: IMenuRef<any> = {
  getState: () => [],
  getSearchValue: () => "",
  incrementFocusedIndex: () => {},
  decrementFocusedIndex: () => {},
  getModelAtFocusedIndex: () => null,
  performActionAtFocusedIndex: (e: KeyboardEvent) => {},
  focus: (value: boolean) => {},
  focusSearch: (value: boolean, search?: string) => {}
};

export const useMenu = <M extends Model.Model>(): NonNullRef<IMenuRef<M>> => {
  return useRef<IMenuRef<M>>(InitialMenuRef);
};

export const useMenuIfNotDefined = <M extends Model.Model>(menu?: NonNullRef<IMenuRef<M>>): NonNullRef<IMenuRef<M>> => {
  const ref = useRef<IMenuRef<M>>(InitialMenuRef);
  const returnRef = useMemo(() => (!isNil(menu) ? menu : ref), [menu, ref.current]);
  return returnRef;
};

export const useForm = <T>(form?: Partial<FormInstance<T>> | undefined): FormInstance<T> => {
  const _useAntdForm = RootForm.useForm();
  const antdForm = _useAntdForm[0];

  const [globalError, setGlobalError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean | undefined>(undefined);

  const renderFieldErrors = (e: api.ClientError) => {
    let fieldsWithErrors: { name: string; errors: string[] }[] = [];
    forEach(api.parseFieldErrors(e), (error: Http.FieldError) => {
      const existing = find(fieldsWithErrors, { name: error.field });
      if (!isNil(existing)) {
        fieldsWithErrors = util.replaceInArray<{ name: string; errors: string[] }>(
          fieldsWithErrors,
          { name: error.field },
          { ...existing, errors: [...existing.errors, api.standardizeError(error).message] }
        );
      } else {
        fieldsWithErrors.push({ name: error.field, errors: [api.standardizeError(error).message] });
      }
    });
    antdForm.setFields(fieldsWithErrors);
  };

  const wrapForm = useMemo<FormInstance<T>>(() => {
    return {
      ...antdForm,
      autoFocusField: form?.autoFocusField,
      submit: () => {
        setGlobalError(undefined);
        antdForm.submit();
      },
      resetFields: () => {
        setGlobalError(undefined);
        antdForm.resetFields();
      },
      setLoading,
      setGlobalError: (e: Error | string | undefined) => {
        if (!isNil(e)) {
          if (typeof e === "string") {
            setGlobalError(e);
          } else {
            setGlobalError(!isNil(e.message) ? e.message : `${e}`);
          }
        } else {
          setGlobalError(undefined);
        }
      },
      renderFieldErrors: renderFieldErrors,
      handleRequestError: (e: Error) => {
        if (!axios.isCancel(e)) {
          if (e instanceof api.ClientError) {
            const global = api.parseGlobalError(e);
            if (!isNil(global)) {
              /* eslint-disable no-console */
              console.error(e.errors);
              setGlobalError(global.message);
            }
            // Render the errors for each field next to the form field.
            renderFieldErrors(e);
          } else if (e instanceof api.NetworkError) {
            setGlobalError("There was a problem communicating with the server.");
          } else if (e instanceof api.ServerError) {
            /* eslint-disable no-console */
            console.error(e);
            setGlobalError("There was a problem communicating with the server.");
          } else {
            throw e;
          }
        }
      },
      globalError,
      loading,
      ...form
    };
  }, [form, antdForm, globalError, loading]);

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
   * @link https://reactjs.org/docs/hooks-faq.html#how-to-create-expensive-objects-lazily
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
