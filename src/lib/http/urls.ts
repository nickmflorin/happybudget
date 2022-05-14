import { forEach, isNil, reduce } from "lodash";

/**
 * Parses the provided URL and returns the query parameters in the URL as
 * an object.
 * @param url The URL for which we want to get the query parameters from.
 */
export const getQueryParams = (url: string): Record<string, string> => {
  const queryParams: Record<string, string> = {};

  const anchor = document.createElement("a");
  anchor.href = url;

  const queryStrings = anchor.search.substring(1);
  if (queryStrings !== "") {
    const params = queryStrings.split("&");
    for (let i = 0; i < params.length; i++) {
      const pair = params[i].split("=");
      queryParams[pair[0]] = decodeURIComponent(pair[1]);
    }
  }
  return queryParams;
};

/**
 * Adds the provided query parameters to the URL, merging the existing query
 * parameters with the provided query parameters if applicable.
 *
 * @param url The URL for which we want to add the provided query parameters to.
 * The URL can already contain query parameters, and the provided query parameters
 * will be merged with the exiting ones.
 * @param object The query parameters to add to the URL as an object.
 */
export const addQueryParamsToUrl = (
  url: string,
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  query: Record<string, any> = {},
  options: { filter: (string | number)[] } = { filter: [] }
): string => {
  const existingQuery = getQueryParams(url);
  const newQuery = query || {};
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const mergedQuery: Record<string, any> = { ...existingQuery, ...newQuery };

  const urlParams = new URLSearchParams();
  forEach(mergedQuery, (value: Record<string, string>, key: string) => {
    if (!isNil(value)) {
      if (typeof value === "string" || typeof value === "number") {
        if (isNil(options.filter) || !options.filter.includes(value)) {
          urlParams.append(key, String(value));
        }
      } else {
        urlParams.append(key, String(value));
      }
    }
  });
  if (urlParams.toString() !== "") {
    return url.split("?")[0] + "?" + urlParams.toString();
  }
  return url;
};

/**
 * Given an array representing the ordering of fields that should be applied
 * to the GET request, converts the object to a string so that it can be used
 * as a query parameter.
 *
 * @param ordering The ordering object that should be converted to a query
 *                 compatible string.  Each field in the object should have
 *                 value 1 or -1.
 */
export const convertOrderingQueryToString = <F extends string = string>(ordering: Http.Ordering<F>): string => {
  const orderingStrings: string[] = reduce(
    ordering,
    (prev: string[], order: Http.FieldOrder<F>) => {
      if (order.order === 1) {
        return [...prev, order.field];
      } else if (order.order === -1) {
        return [...prev, `-${order.field}`];
      }
      return prev;
    },
    []
  );
  if (orderingStrings.length !== 0) {
    return orderingStrings.join(",");
  }
  return "";
};
