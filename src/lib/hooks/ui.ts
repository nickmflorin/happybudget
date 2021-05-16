import { useRef, useEffect, useState } from "react";
import { forEach, isNil, debounce } from "lodash";
import * as JsSearch from "js-search";
import AwesomeDebouncePromise from "awesome-debounce-promise";
import useConstant from "use-constant";
import { useAsync, UseAsyncReturn } from "react-async-hook";
import { useDeepEqualMemo } from "lib/hooks";

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

export const usePortal = (id: string | number) => {
  const [parent, setParent] = useState<Element | null>(null);

  useEffect(() => {
    const existingParent = document.querySelector(`#${id}`);
    const parentElem = existingParent || createRootElement(id);
    setParent(parentElem);
  }, [id]);

  return parent;
};

/**
 * An awesome, reusable hook that allows asynchronous searching to be
 * debounced and maintains the relationship between the current search text
 * and the current search results.
 *
 * @param func          The search function which takes the search text and filters the results.
 * @param debounceTime  The debounce time for the search function.
 */
export const useDebouncedFullSearch = <T>(
  func: (input: string) => T[],
  debounceTime: number = 300
): [string, (value: string) => void, UseAsyncReturn<T[]>] => {
  const [inputText, setInputText] = useState("");

  // Create a debounced asynchronous version of the search function.  Use the
  // useConstant hook to ensure that the function is only created once.
  const debounced = useConstant((): ((input: string) => T[]) => AwesomeDebouncePromise(func, debounceTime));

  // Create an asynchronous callback that will call the debounced, async search
  // function whenever the text changes.
  const searchResults = useAsync(async () => {
    if (inputText.length === 0) {
      return [];
    } else {
      const d = debounced(inputText);
      return d;
    }
  }, [debounced, inputText]);

  return [inputText, setInputText, searchResults];
};

/**
 * A slightly less powerful version of useDebouncedFullSearch that assumes the
 * handling of the search text is external and that the only thing that needs
 * to be done is debounce the actual searching based on this text.
 *
 * @param search        The search text to filter the results by.
 * @param func          The search function which takes the search text and filters the results.
 * @param debounceTime  The debounce time for the search function.
 */
export const useDebouncedSearch = <T>(
  search: string,
  func: (input: string) => T[],
  debounceTime: number = 300
): UseAsyncReturn<T[]> => {
  // Create a debounced asynchronous version of the search function.  Use the
  // useConstant hook to ensure that the function is only created once.
  const debounced = useConstant((): ((input: string) => T[]) => AwesomeDebouncePromise(func, debounceTime));

  // Create an asynchronous callback that will call the debounced, async search
  // function whenever the text changes.
  const searchResults = useAsync(async () => {
    if (search.length === 0) {
      return [];
    } else {
      const d = debounced(search);
      return d;
    }
  }, [debounced, search]);

  return searchResults;
};

export interface SearchOptions {
  readonly indices: (string[] | string)[];
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
    forEach(options.indices, (indice: string | string[]) => {
      jssearch.addIndex(indice);
    });
    setJsSearch(jssearch);
  }, [options.indices]);

  useEffect(() => {
    if (!isNil(jsSearch) && options.disabled !== true) {
      jsSearch.addDocuments(models);
    }
  }, [jsSearch, useDeepEqualMemo(models), options.disabled]);

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
    }
  }, [search, useDeepEqualMemo(models), options.disabled]);

  return filteredModels;
};
